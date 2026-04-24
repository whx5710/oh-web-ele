import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemAttachApi } from '#/api/system/attachment';

import { h, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { useDebounceFn } from '@vueuse/core';
import { Spin } from 'ant-design-vue';

import { getTenantPage } from '#/api/system/tenant';

const keyWord = ref('');

const fetching = ref(false);
const userStore = useUserStore();

// 远程获取数据
function fetchRemoteOptions(keyWord: Record<string, any>) {
  fetching.value = true;
  return getTenantPage({
    pageNum: 1,
    pageSize: 10,
    ...keyWord,
  });
}

// 搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '附件名称',
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: () => {
        return {
          // 接口转options格式 { tenantId: string; tenantName: string }[]
          afterFetch: (res: any) => {
            fetching.value = false;
            const data: { name: string; path: string }[] = res.list;
            return data.map((item: any) => ({
              label: item.tenantName,
              value: item.tenantId,
            }));
          },
          api: fetchRemoteOptions,
          allowClear: true,
          disabled: userStore.userInfo?.superAdmin !== 1,
          // 禁止本地过滤
          filterOption: false,
          // 如果正在获取数据，使用插槽显示一个loading
          notFoundContent: fetching.value ? undefined : null,
          // 搜索词变化时记录下来， 使用useDebounceFn防抖。
          onSearch: useDebounceFn((value: string) => {
            keyWord.value = value;
          }, 300),
          // 远程搜索参数。当搜索词变化时，params也会更新
          params: {
            keyWord: keyWord.value || undefined,
          },
          showSearch: true,
        };
      },
      // 字段名
      fieldName: 'tenantId',
      // 界面显示的label
      label: '租户',
      renderComponentContent: () => {
        return {
          notFoundContent: fetching.value ? h(Spin) : undefined,
        };
      },
      // rules: 'selectRequired',
    },
  ];
}

export function useColumns<T = SystemAttachApi.SysAttach>(
  onActionClick: OnActionClickFn<T>,
  // onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    { type: 'checkbox', width: 60 },
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'id',
      title: 'ID',
      minWidth: 100,
      visible: false,
    },
    {
      field: 'name',
      title: '附件名称',
      width: 200,
    },
    {
      field: 'url',
      title: '附件地址',
      minWidth: 180,
    },
    {
      field: 'size',
      width: 120,
      title: '附件大小',
    },
    {
      field: 'platform',
      width: 120,
      title: '存储平台',
    },
    {
      field: 'tenantName',
      minWidth: 120,
      title: '租户',
    },
    {
      field: 'createTime',
      width: 150,
      title: '创建时间',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: '附件',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'download', // 默认的删除按钮
            text: '下载',
          },
          {
            code: 'delete', // 默认的删除按钮
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 130,
    },
  ];
}
