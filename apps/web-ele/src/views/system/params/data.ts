import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemParamsApi } from '#/api/system/params';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'paramName',
      label: '参数名称',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'paramKey',
      label: '参数KEY',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'paramValue',
      label: '参数值',
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '是', value: 1 },
          { label: '否', value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'paramType',
      label: '系统参数',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyWord',
      label: '关键字搜索',
      componentProps: {
        allowClear: true,
      },
    },
    // {
    //   component: 'RangePicker',
    //   fieldName: 'createTime',
    //   label: $t('system.role.createTime'),
    // },
  ];
}

export function useColumns<T = SystemParamsApi.SystemParam>(
  onActionClick: OnActionClickFn<T>,
  // onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'id',
      title: 'ID',
      width: 100,
      visible: false,
    },
    {
      align: 'left',
      field: 'paramName',
      title: '参数名称',
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
          { color: 'warning', label: '是', value: 1 },
          { color: 'success', label: '否', value: 0 },
        ],
      },
      field: 'paramType',
      minWidth: 50,
      title: '是否系统参数',
    },
    {
      align: 'left',
      field: 'paramKey',
      minWidth: 100,
      title: '参数KEY',
    },
    {
      align: 'left',
      field: 'paramValue',
      minWidth: 100,
      title: '参数值',
    },
    {
      align: 'left',
      field: 'remark',
      minWidth: 100,
      title: '备注',
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 160,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: '参数',
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
