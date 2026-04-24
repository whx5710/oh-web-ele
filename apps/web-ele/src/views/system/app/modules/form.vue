<script lang="ts" setup>
import type { SystemAppApi } from '#/api/system/app';

import { computed, reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Button,
  Form,
  FormItem,
  Input,
  InputSearch,
  Textarea,
} from 'ant-design-vue';

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
    <Form
      ref="addOrUpdate"
      :model="formState"
      name="basic"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <FormItem
        label="客户端ID"
        name="clientId"
        :rules="[{ required: true, message: '请输入客户端ID!' }]"
      >
        <Input v-model:value="formState.clientId" />
      </FormItem>
      <FormItem
        label="客户端名称"
        name="name"
        :rules="[{ required: true, message: '请输入客户端名称!' }]"
      >
        <Input v-model:value="formState.name" />
      </FormItem>
      <FormItem
        label="密钥"
        name="secretKey"
        :rules="[{ required: true, message: '请输入密钥!' }]"
      >
        <InputSearch
          v-model:value="formState.secretKey"
          placeholder="密钥"
          size="large"
          @search="randomKey"
        >
          <template #enterButton>
            <Button>随机</Button>
          </template>
        </InputSearch>
      </FormItem>
      <FormItem label="备注" name="remark">
        <Textarea v-model:value="formState.remark" :rows="4" />
      </FormItem>
    </Form>
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
