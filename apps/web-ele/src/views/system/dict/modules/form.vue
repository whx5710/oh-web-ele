<script lang="ts" setup>
import type { SystemDictApi } from '#/api/system/dict';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { createDictType, updateDictType } from '#/api/system/dict';
import { $t } from '#/locales';

import { useSchema } from '../data';
/**
 * 数据字典-类别新增、修改表单。
 */
const emit = defineEmits(['success']);
const formData = ref<SystemDictApi.SystemType>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['字典类型'])
    : $t('ui.actionTitle.create', ['字典类型']);
});

const [Form, formApi] = useVbenForm({
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  // layout: 'vertical',
  schema: useSchema(),
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        await (formData.value?.id
          ? updateDictType(formData.value.id, data)
          : createDictType(data));
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemDictApi.SystemType>();
      if (data) {
        formData.value = data;
        formApi.setValues(formData.value);
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <ElButton type="danger" @click="resetForm">
          {{ $t('common.reset') }}
        </ElButton>
      </div>
    </template>
  </Modal>
</template>
