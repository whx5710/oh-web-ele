<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { createUser, updateUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<SystemUserApi.SystemUser>();
const getTitle = computed(() => {
  return formData.value?.id ? '修改用户' : '新增用户';
});

const [Form, formApi] = useVbenForm({
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: useSchema(),
  showDefaultActions: false,
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
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
          ? updateUser(formData.value.id, data)
          : createUser(data).then((msg) => {
              ElMessage.success(msg);
            }));
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemUserApi.SystemUser>();
      if (data) {
        formData.value = data;
        formApi.setValues(formData.value);
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-[800px]">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <ElButton type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </ElButton>
      </div>
    </template>
  </Modal>
</template>
