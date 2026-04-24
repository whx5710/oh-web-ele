<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { SystemTenantApi } from '#/api/system/tenant';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createTenant, updateTenant } from '#/api/system/tenant';
import { $t } from '#/locales';

import { useSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<SystemTenantApi.SystemTenant>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['租户'])
    : $t('ui.actionTitle.create', ['租户']);
});

const schemaData: VbenFormSchema[] =  useSchema();

const [Form, formApi] = useVbenForm({
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  // layout: 'vertical',
  schema: schemaData,
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
          ? updateTenant(formData.value.id, data)
          : createTenant(data));
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemTenantApi.SystemTenant>();
      if (data) {
        if (data.parentId === 0) {
          data.parentId = undefined;
        }
        formData.value = data;
        if(formData.value?.id){
          schemaData[0] = {
            component: 'Input',
            fieldName: 'tenantId',
            label: '租户编码',
            disabled: true
          }
        }
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
