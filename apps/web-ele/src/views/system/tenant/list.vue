<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemTenantApi } from '#/api/system/tenant';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteTenant, getTenantPage } from '#/api/system/tenant';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import UserDrawer from './modules/userDrawer.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: UserDrawer,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false, // 默认隐藏搜索表单
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
    showCollapseButton: false, // 是否显示展开/折叠
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getTenantPage({
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
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemTenantApi.SystemTenant>,
});

function onActionClick(e: OnActionClickParams<SystemTenantApi.SystemTenant>) {
  switch (e.code) {
    case 'append': {
      onEditUser(e.row);
      break;
    }
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}
function onEditUser(row: SystemTenantApi.SystemTenant) {
  formDrawerApi.setData(row).open();
}
function onEdit(row: SystemTenantApi.SystemTenant) {
  formModalApi.setData(row).open();
}

function onDelete(row: SystemTenantApi.SystemTenant) {
  const hideLoading = ElMessage.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteTenant(row.id)
    .then(() => {
      ElMessage.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formModalApi.setData({}).open();
}
</script>
<template>
  <Page auto-content-height >
    <FormModal @success="onRefresh" />
    <!-- 抽屉-->
    <FormDrawer @success="onRefresh" />
    <Grid table-title="租户列表">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
