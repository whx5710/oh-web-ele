<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getClockUserPage, unlockUser } from '#/api/system/user';

import { useClockColumns, useClockGridFormSchema } from './data';

const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: true,
  formOptions: {
    schema: useClockGridFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
  },
  gridOptions: {
    columns: useClockColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getClockUserPage({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isCurrent: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
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
    case 'unlock': {
      handleUnlock(row);
      break;
    }
  }
}

function handleUnlock(row: SystemUserApi.SystemUser) {
  ElMessageBox.confirm(
    `是否解锁用户 ${row.realName}(${row.username})？`,
    '解锁确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(() => {
      unlockUser(row.username).then(() => {
        ElMessage.success('解锁成功');
        onRefresh();
      });
    })
    .catch(() => {
      console.warn('已取消解锁');
    });
}

function onRefresh() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <Grid table-title="锁定用户列表" />
  </Page>
</template>
