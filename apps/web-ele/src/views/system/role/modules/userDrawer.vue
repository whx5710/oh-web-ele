<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';
import type { SystemRoleApi } from '#/api/system/role';

import { ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Input } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { pageByRole } from '#/api/system/user';

import { useUserColumns } from '../data';

const roleId = ref();
const title = ref('')
// drawerApi
const [Drawer, drawerApi] = useVbenDrawer({
  showConfirmButton: false,
  async onConfirm() {
    console.warn('------------------onConfirm');
  },
  onOpenChange() {
    const data = drawerApi.getData<SystemRoleApi.SystemRole>();
    roleId.value = data.id;
    title.value = data.name;
  },
});

// gridApi 租户用户
const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false, // 默认隐藏搜索表单
  gridOptions: {
    columns: useUserColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          formValues.roleId = roleId.value;
          return await pageByRole({
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

function onActionClick(e: OnActionClickParams<SystemUserApi.SystemUser>) {}
const keyWord = ref('')
watch(keyWord, () => {
  onSearch()
});
const onSearch = () => {
  gridApi.query({keyWord: keyWord.value})
  // useDebounceFn(() => {
  //   console.warn('---vvvv-----', keyWord.value)
  // } , 300)
}
</script>
<template>
  <Drawer class="w-full max-w-[1000px]" :title="title" >
    <Grid>
      <template #toolbar-tools>
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
