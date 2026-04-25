<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRole, getRolePage } from '#/api/system/role';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import UserDrawer from './modules/userDrawer.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});
// 用户
const [FormDrawerUser, formDrawerUserApi] = useVbenDrawer({
  connectedComponent: UserDrawer,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false, // 默认隐藏搜索表单
  formOptions: {
    // fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
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
          return await getRolePage({
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
  } as VxeTableGridOptions<SystemRoleApi.SystemRole>,
});

function onActionClick(e: OnActionClickParams<SystemRoleApi.SystemRole>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'viewUser': {
      onViewUser(e.row);
      break;
    }
  }
}

function onEdit(row: SystemRoleApi.SystemRole) {
  formDrawerApi.setData(row).open();
}
// 查看用户
function onViewUser(row: SystemRoleApi.SystemRole) {
  formDrawerUserApi.setData(row).open();
}
function onDelete(row: SystemRoleApi.SystemRole) {
  if (row.isSystem === 1) {
    ElMessage.warning({
      message: '内置角色不能删除',
    });
    return;
  }
  deleteRole(row.id)
    .then(() => {
      ElMessage.success({
        message: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      console.log('删除失败');
      ElMessage.error({
        message: '删除失败',
        key: 'action_process_msg',
      });
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <FormDrawerUser @success="onRefresh" />
    <Grid :table-title="$t('system.role.list')">
      <template #operation="{ row }">
        {{ row }}
      </template>
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.role.name')]) }}
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
