<script lang="ts" setup>
import type { SystemAppApi } from '#/api/system/app';

import { computed, reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
} from 'element-plus';

import { createApp, updateApp } from '#/api/system/app';

const emit = defineEmits(['success']);

const addOrUpdate = ref();

const formState = reactive<SystemAppApi.App>({
  clientId: '',
  name: '',
  secretKey: '',
  remark: '',
  id: '',
  dbStatus: 0,
});

const getTitle = computed(() => {
  return formState.id ? '编辑客户端' : '新增客户端';
});

function resetForm() {
  addOrUpdate.value.resetFields();
}

function randomKey() {
  let uuid = Array.prototype.map
    .call(window.crypto.getRandomValues(new Uint8Array(16)), (item) =>
      item.toString(16),
    )
    .join('');
  if (uuid.length < 32) {
    uuid += '0'.repeat(32 - uuid.length); // 添加0补足位数
  }
  formState.secretKey = uuid;
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    addOrUpdate.value.validate().then(async () => {
      try {
        modalApi.lock();
        await (formState.id
          ? updateApp(formState.id, formState)
          : createApp(formState));
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    });
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemAppApi.App>();
      if (data) {
        // 拷贝赋值
        Object.assign(formState, data);
      }
    }
  },
});
</script>

<template>
  <Modal class="w-full max-w-[600px]" :title="getTitle">
    <ElForm
      ref="addOrUpdate"
      :model="formState"
      label-width="120px"
      autocomplete="off"
    >
      <ElFormItem
        label="客户端ID"
        prop="clientId"
        :rules="[{ required: true, message: '请输入客户端ID!' }]"
      >
        <ElInput v-model="formState.clientId" />
      </ElFormItem>
      <ElFormItem
        label="客户端名称"
        prop="name"
        :rules="[{ required: true, message: '请输入客户端名称!' }]"
      >
        <ElInput v-model="formState.name" />
      </ElFormItem>
      <ElFormItem
        label="密钥"
        prop="secretKey"
        :rules="[{ required: true, message: '请输入密钥!' }]"
      >
        <ElInput v-model="formState.secretKey" placeholder="密钥">
          <template #suffix>
            <ElButton link @click="randomKey">随机</ElButton>
          </template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formState.remark" type="textarea" :rows="4" />
      </ElFormItem>
    </ElForm>
    <template #prepend-footer>
      <div class="flex-auto">
        <ElButton type="danger" @click="resetForm">
          {{ $t('common.reset') }}
        </ElButton>
      </div>
    </template>
  </Modal>
</template>
