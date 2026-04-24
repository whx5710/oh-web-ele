<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemAppApi } from '#/api/system/app';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { ElMessage, ElSwitch } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { authority, pageByClientId } from '#/api/system/app';

import { useFormSchema, useFuncColumns } from '../data';

const formData = ref<SystemAppApi.App>();
// 新增修改弹窗
const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});
// 客户端ID
const clientId = ref('');

// 抽屉
const [Drawer, drawerApi] = useVbenDrawer({
  showConfirmButton: false,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemAppApi.App>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        clientId.value = data.clientId;
        formApi.setValues(data);
      }
    }
  },
});

// gridApi 客户端数据
const [Grid] = useVbenVxeGrid({
  gridOptions: {
    columns: useFuncColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await pageByClientId({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            clientId: clientId.value,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isCurrent: true, // 高亮选中行
    },
  } as VxeTableGridOptions<SystemAppApi.Func>,
});
// 授权
function authorize(data: SystemAppApi.Func) {
  const params: SystemAppApi.FuncAuthority = {
    id: '',
    funcCode: data.funcCode,
    clientId: clientId.value,
    dbStatus: 0,
  };
  if (data.checkedFunc) {
    params.dbStatus = 1;
  }
  authority(params).then(() => {
    ElMessage.success('操作成功');
  });
}
</script>

<template>
  <Drawer class="w-full max-w-[800px]" title="接口授权">
    <Form>
      <template #funcList="slotProps">
        <Grid class="h-full max-h-[450px]" v-bind="slotProps">
          <template #checkedFunc="{ row }">
            <ElSwitch v-model="row.checkedFunc" @click="authorize(row)" />
          </template>
        </Grid>
      </template>
    </Form>
  </Drawer>
</template>
