<script lang="ts" setup>
import type { SystemAppApi } from '#/api/system/app';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createFunc, updateFunc } from '#/api/system/app';
import { $t } from '#/locales';

import { useFuncSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<SystemAppApi.Func>();
const getTitle = computed(() => {
  return formData.value?.id ? '修改接口' : '新增接口';
});

const [Form, formApi] = useVbenForm({
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  // layout: 'vertical',
  schema: useFuncSchema(),
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
          ? updateFunc(formData.value.id, data)
          : createFunc(data));
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemAppApi.Func>();
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
        <Button type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
