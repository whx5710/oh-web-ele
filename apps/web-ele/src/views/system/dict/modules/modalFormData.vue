<script lang="ts" setup>
import type { SystemDictApi } from '#/api/system/dict';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createDictData, updateDictData } from '#/api/system/dict';
import { $t } from '#/locales';

import { useDataSchema } from '../data';
/**
 * 数据字典-数据新增、修改表单。
 */
const emit = defineEmits(['success']);
const formData = ref<SystemDictApi.SystemData>();

const dictTypeId = ref();

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['字典数据'])
    : $t('ui.actionTitle.create', ['字典数据']);
});

const [Form, formApi] = useVbenForm({
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  // layout: 'vertical',
  schema: useDataSchema(),
  showDefaultActions: false,
});
// 重置
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
        data.dictTypeId = dictTypeId.value;
        await (formData.value?.id
          ? updateDictData(formData.value.id, data)
          : createDictData(data));
        modalApi.close();
        emit('success');
        message.success('操作成功');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemDictApi.SystemData>();
      if (data) {
        dictTypeId.value = data.dictTypeId;
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
        <Button type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
