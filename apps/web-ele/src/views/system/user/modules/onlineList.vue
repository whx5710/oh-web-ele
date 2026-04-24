<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Modal as Amodal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { forceLogout, tokenList } from '#/api/system/user';

import { useTokenColumns } from '../data';

const userId = ref();

const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false, // 隐藏搜索表单
  formOptions: {},
  gridOptions: {
    columns: useTokenColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          console.warn(page);
          return await tokenList(userId.value);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isCurrent: true, // 高亮选中行
    },
    toolbarConfig: {
      enabled: false,
      custom: true,
      export: false,
      refresh: { code: 'query' },
      search: false,
      zoom: true,
    },
    pagerConfig: {
      enabled: false,
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false, // 隐藏确认按钮
  async onConfirm() {},
  onOpenChange(isOpen) {
    const data = modalApi.getData<SystemUserApi.SystemUser>();
    console.warn(data);
    if (isOpen) {
      userId.value = data.id;
    }
  },
});
// 刷新列表
function onRefresh() {
  gridApi.query();
}
// 退出登录
function handleForceLogout(token: string) {
  Amodal.confirm({
    content: '是否下线',
    onCancel() {
      console.warn('已取消');
    },
    onOk() {
      forceLogout(token).then(() => {
        onRefresh();
      });
    },
    title: '请确认',
  });
}
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemUserApi.UserToken>) {
  switch (code) {
    case 'exit': {
      handleForceLogout(row.accessToken);
      break;
    }
  }
}
</script>

<template>
  <Modal title="用户token列表" class="w-[900px]">
    <Grid class="mx-4" />
  </Modal>
</template>
