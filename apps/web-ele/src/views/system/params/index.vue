<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemParamsApi } from '#/api/system/params';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteParams, getParamsPage } from '#/api/system/params';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
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
          return await getParamsPage({
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
  } as VxeTableGridOptions<SystemParamsApi.SystemParam>,
});

function onActionClick(e: OnActionClickParams<SystemParamsApi.SystemParam>) {
  switch (e.code) {
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

function onEdit(row: SystemParamsApi.SystemParam) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemParamsApi.SystemParam) {
  const hideLoading = ElMessage.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteParams(row.id)
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
  formDrawerApi.setData({}).open();
}
</script>
<template>
  <Page auto-content-height description="系统相关的参数配置">
    <FormDrawer @success="onRefresh" />
    <Grid table-title="参数列表">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增参数
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
