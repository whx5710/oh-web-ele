<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api/system/dict';

import { ref } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDictData, getDictDataPage } from '#/api/system/dict';
import { $t } from '#/locales';

import { useDictDataColumns } from '../data';
import ModalFormData from './modalFormData.vue';
/**
 * 数据字典-数据列表（抽屉）。
 */
const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: ModalFormData,
  destroyOnClose: true,
});

const dictTypeId = ref();
const drawerTitle = ref('');
// drawerApi
const [Drawer, drawerApi] = useVbenDrawer({
  showConfirmButton: false,
  onOpenChange() {
    const data = drawerApi.getData<SystemDictApi.SystemType>();
    dictTypeId.value = data.id;
    drawerTitle.value = `维护字典数据-${data.dictName}`;
  },
});
// 编辑字典数据
function onDataEdit(row: SystemDictApi.SystemData) {
  formModalApi.setData(row).open();
}
// 删除字典数据
function onDataDelete(row: SystemDictApi.SystemData) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteDictData(row.id)
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

// gridApi 字典数据
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useDictDataColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          formValues.dictTypeId = dictTypeId.value;
          return await getDictDataPage({
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
  } as VxeTableGridOptions<SystemDictApi.SystemType>,
});

function onRefresh() {
  gridApi.query();
}

function onActionClick(e: OnActionClickParams<SystemDictApi.SystemData>) {
  switch (e.code) {
    case 'delete': {
      onDataDelete(e.row);
      break;
    }
    case 'edit': {
      onDataEdit(e.row);
      break;
    }
  }
}

function onCreate() {
  formModalApi.setData({ dictTypeId: dictTypeId.value }).open();
}
</script>
<template>
  <Drawer class="w-full max-w-[800px]" :title="drawerTitle">
    <FormModal @success="onRefresh" />
    <Grid table-title="">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增
        </Button>
      </template>
    </Grid>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
