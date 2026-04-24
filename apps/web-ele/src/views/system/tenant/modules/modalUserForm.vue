<script lang="ts" setup>
import type { SystemTenantApi } from '#/api/system/tenant';

import { h, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { useDebounceFn } from '@vueuse/core';

import { useVbenForm } from '#/adapter/form';
import { bindTenantUser } from '#/api/system/user';
import { ElLoading } from 'element-plus';
import { getUserPage, type SystemUserApi } from '#/api/system/user';

const emit = defineEmits(['success']);
// const formData = ref<SystemTenantApi.SystemTenant>();

const keyword = ref('');
const fetching = ref(false);
const tenantId = ref('')

// afterFetch 钩子：接收原始数据，返回转换后的数据
const transformData = (rawData: any) => {
  if(rawData && rawData.total && rawData.total > 0){
    // 递归地将后端数据映射为组件所需的格式
    const formatData = (items: SystemUserApi.SystemUser[]) => {
      return items.map(item => ({
        label: item.realName + ' | ' + item.deptName + ' | ' + item.mobile + ' | ' + item.email,          // 将后端的 'name' 映射为组件的 'label'
        value: item.id,            // 将后端的 'id' 映射为组件的 'value'
      }));
    };
    return formatData(rawData.list)
  }
}

const [Form, formApi] = useVbenForm({
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  // layout: 'vertical',
  schema: [{
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: () => {
        return {
          api: getUserPage,
          afterFetch: transformData,
          // 禁止本地过滤
          filterable: true,
          remote: true,
          // 如果正在获取数据，使用插槽显示一个loading
          // 搜索词变化时记录下来， 使用useDebounceFn防抖。
          remoteMethod: useDebounceFn((value: string) => {
            keyword.value = value;
          }, 300),
          // 远程搜索参数。当搜索词变化时，params也会更新
          params: {
            pageNum: 1,
            pageSize: 20,
            keyWord: keyword.value || undefined,
            tenantRole: true, // 有租户角色的
            tenantFlag: 0 // 未绑定租户的用户
          },
          style: 'width: 100%;',
          // resultField: 'list',
          // labelField: 'realName',
          // valueField: 'id'
        };
      },
      // 字段名
      fieldName: 'keyWord',
      // 界面显示的label
      label: '关键字搜索',
      help: '一般只添加初始的管理用户',
      renderComponentContent: () => {
        return {
          loading: fetching.value,
        };
      },
      rules: 'selectRequired',
    }],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        bindTenantUser(tenantId.value, [data.keyWord]).then(()=>{
          emit('success');
        })
        modalApi.close();
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemTenantApi.SystemTenant>();
      if (data) {
        tenantId.value = data.tenantId
      }
    }
  },
});
</script>

<template>
  <Modal title="添加用户">
    <Form class="mx-2" />
  </Modal>
</template>
