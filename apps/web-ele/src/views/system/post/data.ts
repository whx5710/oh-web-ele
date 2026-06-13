import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { $t } from '#/locales';

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
      defaultValue: 1,
      componentProps: {
        style: 'width: 100%',
        min: 1,
      },
    },
  ];
}

// 搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'postName',
      label: '岗位名称',
      componentProps: {
        clearable: true,
      },
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
