import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { h, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { useDebounceFn } from '@vueuse/core';
import { ElLoading } from 'element-plus';

import { getTenantPage } from '#/api/system/tenant';
import { $t } from '#/locales';

const keyWord = ref('');

const fetching = ref(false);
const userStore = useUserStore();

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'postCode',
      label: '岗位编码',
    },
    {
      component: 'Input',
      fieldName: 'postName',
      label: '岗位名称',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '正常', value: 1 },
          { label: '停用', value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: '排序',
      componentProps: {
        style: 'width: 100%',
        defaultValue: 0,
      },
    },
  ];
}

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
      fieldName: 'postName',
      label: '岗位名称',
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
          notFoundContent: fetching.value ? h(ElLoading, { loading: true }) : undefined,
        };
      },
      // rules: 'selectRequired',
    },
  ];
}

export function useColumns<T = SystemPostApi.SystemPost>(
  onActionClick: OnActionClickFn<T>,
  // onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'id',
      title: $t('system.role.id'),
      width: 100,
      visible: false,
    },
    {
      field: 'postCode',
      title: '岗位编码',
      width: 200,
    },
    {
      field: 'postName',
      title: '岗位名称',
      width: 200,
    },
    // {
    //   cellRender: {
    //     attrs: { beforeChange: onStatusChange },
    //     name: onStatusChange ? 'CellSwitch' : 'CellTag',
    //   },
    //   field: 'status',
    //   title: $t('system.role.status'),
    //   width: 100,
    // },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { type: 'success', label: '正常', value: 1 },
          { type: 'warning', label: '停用', value: 0 },
        ],
      },
      field: 'status',
      minWidth: 100,
      title: '状态',
    },
    {
      field: 'tenantId',
      minWidth: 100,
      title: '租户ID',
    },
    {
      field: 'tenantName',
      minWidth: 100,
      title: '租户名称',
    },
    {
      field: 'remark',
      minWidth: 100,
      title: '备注',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: '岗位',
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 130,
    },
  ];
}
