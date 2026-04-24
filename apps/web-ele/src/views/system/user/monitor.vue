<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { Page, useVbenModal } from '@vben/common-ui';

import { Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { forceLogoutAll, onlineUserPage } from '#/api/system/user';

import { useMonitorColumns, useMonitorGridFormSchema } from './data';
import OnlineList from './modules/onlineList.vue';

const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false, // 隐藏搜索表单
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useMonitorGridFormSchema(),
    submitOnChange: true,
    showCollapseButton: false, // 是否显示展开/折叠
  },
  gridOptions: {
    columns: useMonitorColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await onlineUserPage({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isCurrent: true, // 高亮选中行
    },

    toolbarConfig: {
      custom: true,
      export: false,
      refresh: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (code) {
    case 'exit': {
      console.warn('退出', row);
      forceLogout(row.id, row.realName);
      break;
    }
    case 'show': {
      console.warn('详情', row);
      showList(row);
      break;
    }
  }
}
// token列表弹窗
const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: OnlineList,
  destroyOnClose: true,
});

// 下线
function forceLogout(userId: string, userName: string) {
  Modal.confirm({
    content: `是否下线 ${userName}`,
    onCancel() {
      console.warn('已取消');
    },
    onOk() {
      forceLogoutAll(userId).then(() => {
        onRefresh();
      });
    },
    title: '是否下线',
  });
}
// 刷新列表
function onRefresh() {
  gridApi.query();
}
function showList(row: SystemUserApi.SystemUser) {
  formModalApi.setData(row).open();
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid table-title="在线用户列表" />
  </Page>
</template>
