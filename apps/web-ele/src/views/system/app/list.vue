<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemAppApi } from '#/api/system/app';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteApp,
  getAppPage,
  startListener,
  stopListener,
} from '#/api/system/app';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import AuthorizeForm from './modules/authorizeForm.vue';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: AuthorizeForm,
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
          return await getAppPage({
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
  } as VxeTableGridOptions<SystemAppApi.App>,
});

function onActionClick(e: OnActionClickParams<SystemAppApi.App>) {
  switch (e.code) {
    // 授权
    case 'authorize': {
      onAuthorize(e.row);
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

/**
 * 编辑
 * @param row
 */
function onEdit(row: SystemAppApi.App) {
  formModalApi.setData(row).open();
}
// 授权
function onAuthorize(row: SystemAppApi.App) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemAppApi.App) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteApp(row.id)
    .then(() => {
      message.success({
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
// 开启监听
function startListenerApi() {
  startListener('openApi').then((res) => {
    message.success(res);
  });
}
// 关闭监听
function stopListenerApi() {
  stopListener('openApi').then((res) => {
    message.success(res);
  });
}
</script>
<template>
  <Page auto-content-height>
    <!--授权-->
    <FormDrawer @success="onRefresh" />
    <!--新增修改-->
    <FormModal @success="onRefresh" />
    <Grid table-title="客户端列表">
      <template #operation="{ row }">
        {{ row }}
      </template>
      <template #toolbar-tools>
        <Button type="link" @click="startListenerApi()">启动Kafka监听</Button>
        <Button type="link" danger @click="stopListenerApi()">
          关闭Kafka监听
        </Button>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增客户端
        </Button>
      </template>
    </Grid>
  </Page>
</template>
