<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';
import type { SystemTenantApi } from '#/api/system/tenant';

import { ref, watch } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
// import { Plus } from '@vben/icons';

import { Button, Divider, Input, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getUserPage, unBindTenantUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useUserColumns, userSchema } from '../data';
import ModalUserForm from './modalUserForm.vue';

const tenantId = ref();
const title = ref('')
// drawerApi
const [Drawer, drawerApi] = useVbenDrawer({
  showConfirmButton: false,
  async onConfirm() {
    console.warn('------------------onConfirm');
  },
  onOpenChange() {
    const data = drawerApi.getData<SystemTenantApi.SystemTenant>();
    tenantId.value = data.tenantId;
    title.value = '租户用户-' + data.tenantName;
  },
});
// 删除数据
function onDataDelete(row: SystemUserApi.SystemUser) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.realName]),
    duration: 0,
    key: 'action_process_msg',
  });
  unBindTenantUser(row.tenantId, [row.id])
    .then(() => {
      message.success({
        content: `用户${row.realName}解绑成功`,
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

// gridApi 租户用户
const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false, // 默认隐藏搜索表单
  formOptions: {
    schema: userSchema(),
    submitOnChange: true,
    showCollapseButton: false, // 是否显示展开/折叠
  },
  gridOptions: {
    columns: useUserColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          formValues.tenantId = tenantId.value;
          return await getUserPage({
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
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

function onRefresh() {
  gridApi.query();
}

function onActionClick(e: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (e.code) {
    case 'delete': {
      onDataDelete(e.row);
      break;
    }
  }
}
const keyWord = ref('')
watch(keyWord, () => {
  onSearch()
  // useDebounceFn(onSearch , 3)
});
const onSearch = () => {
  gridApi.query({keyWord: keyWord.value})
  // useDebounceFn(() => {
  //   console.warn('---vvvv-----', keyWord.value)
  // } , 300)
}

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: ModalUserForm,
  destroyOnClose: true,
});

function onAdd() {
  formModalApi.setData({ tenantId: tenantId.value }).open();
}

</script>
<template>
  <Drawer class="w-full max-w-[1000px]" :title="title" >
    <FormModal @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onAdd">
          添加
        </Button>
        <Divider type="vertical" />
        <Input style="width: 200px;" v-model:value="keyWord" placeholder="关键字搜索" allowClear/>
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
