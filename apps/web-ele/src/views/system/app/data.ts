import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemAppApi } from '#/api/system/app';

import { z } from '#/adapter/form';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'clientId',
      label: '客户端ID',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '客户端名',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'funcList',
      formItemClass: 'items-start',
      label: '接口授权',
      modelPropName: 'modelValue',
      componentProps: () => {
        return {
          style: 'width: 100%',
        };
      },
    },
  ];
}
// 搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyWord',
      label: '搜索关键字',
      componentProps: {
        clearable: true,
        placeholder: '请输入关键字搜索',
      },
    },
  ];
}

// 日志搜索表单
export function useLogGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyWord',
      label: '搜索关键字',
      componentProps: {
        clearable: true,
        placeholder: '请输入关键字搜索',
      },
    },
    {
      component: 'Select',
      componentProps: {
        // allowClear: true,
        class: 'w-full',
        options: [
          { label: '全部', value: null },
          { label: '未处理', value: '0' },
          { label: '已处理', value: '1' },
          { label: '未找到对应服务', value: '2' },
          { label: '业务处理失败', value: '3' },
        ],
      },
      // dependencies: {
      //   triggerFields: ['type'],
      // },
      fieldName: 'state', // // 状态0未处理1处理2未找到对应的服务类3业务处理失败
      label: '处理状态',
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: '创建时间',
    },
  ];
}

export function useColumns<T = SystemAppApi.App>(
  onActionClick: OnActionClickFn<T>,
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
      field: 'clientId',
      title: '客户端ID',
      width: 120,
    },
    {
      field: 'name',
      title: '客户端',
      width: 200,
    },
    {
      field: 'secretKey',
      minWidth: 100,
      title: '密钥',
    },
    {
      field: 'remark',
      minWidth: 80,
      title: '备注',
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 160,
    },
    {
      field: 'updateTime',
      title: '修改时间',
      width: 160,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: '客户端',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          {
            code: 'authorize',
            text: '授权',
          },
          {
            code: 'delete', // 默认的删除按钮
            disabled: (row: SystemAppApi.App) => {
              return !!(row.isSystem === 1);
            },
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

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'clientId',
      label: '客户端ID',
      rules: z.string().min(2, '最小两个长度').max(50, '最大50个长度'),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '客户端名称',
      rules: z.string().min(2, '最小两个长度').max(50, '最大50个长度'),
    },
    {
      component: 'Input',
      fieldName: 'secretKey',
      label: '密钥',
      help: '复杂随机字符串',
    },
    {
      component: 'Textarea',
      componentProps: {
        maxlength: 100,
        rows: 3,
        showCount: true,
        style: 'width: 100%',
      },
      fieldName: 'remark',
      label: '备注',
    },
  ];
}

/**
 * 接口列表
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useFuncSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'funcCode',
      label: '接口编号',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '接口名称',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '是', value: true },
          { label: '否', value: false },
        ],
        optionType: 'button',
      },
      defaultValue: false,
      fieldName: 'async',
      label: '是否异步',
    },
    {
      component: 'Textarea',
      componentProps: {
        maxlength: 100,
        rows: 3,
        showCount: true,
        style: 'width: 100%',
      },
      fieldName: 'remark',
      label: '备注',
    },
  ];
}

// 接口函数数据表格
export function useFuncColumns(): VxeTableGridOptions['columns'] {
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
      field: 'funcCode',
      title: '功能号',
      width: 100,
    },
    {
      align: 'left',
      field: 'name',
      title: '功能名称',
      width: 140,
    },
    {
      field: 'checkedFunc',
      slots: { default: 'checkedFunc' },
      title: '授权',
      width: 80,
    },
    {
      field: 'async',
      title: '是否异步',
      width: 80,
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'warning', label: '否', value: false },
          { color: 'success', label: '是', value: true },
        ],
      },
    },
    {
      align: 'left',
      field: 'remark',
      title: '备注',
    },
  ];
}

// 接口函数数据表格
export function useFuncListColumns<T = SystemAppApi.Func>(
  onActionClick: OnActionClickFn<T>,
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
      field: 'funcCode',
      title: '功能号',
      minWidth: 100,
    },
    {
      align: 'left',
      field: 'name',
      title: '功能名称',
      minWidth: 140,
    },
    {
      field: 'async',
      title: '是否异步',
      width: 100,
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'warning', label: '否', value: false },
          { color: 'success', label: '是', value: true },
        ],
      },
    },
    {
      align: 'left',
      field: 'remark',
      title: '备注',
    },
    {
      align: 'left',
      field: 'createTime',
      title: '创建时间',
      width: 140,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: '接口',
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

// 日志
export function useLogColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'checkbox', width: 60 },
    { title: '序号', type: 'seq', width: 60 },
    {
      field: 'id',
      title: 'ID',
      minWidth: 100,
      visible: false,
    },
    {
      align: 'left',
      field: 'clientId',
      title: '客户端编号',
      width: 100,
    },
    {
      align: 'left',
      field: 'clientName',
      title: '客户端',
      width: 150,
    },
    {
      field: 'funcCode',
      title: '接口编号',
      width: 120,
    },
    {
      field: 'funcCodeName',
      width: 150,
      title: '接口名称',
    },
    {
      field: 'jsonStr',
      minWidth: 120,
      title: '请求参数',
    },
    {
      field: 'resultMsg',
      minWidth: 120,
      title: '响应参数',
    },
    {
      field: 'state',
      width: 120,
      title: '处理状态', // 状态0未处理1处理2未找到对应的服务类3业务处理失败
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'warning', label: '未处理', value: '0' },
          { color: 'success', label: '已处理', value: '1' },
          { color: 'processing', label: '未找到对应服务', value: '2' },
          { color: 'error', label: '业务处理失败', value: '3' },
        ],
      },
    },
    {
      field: 'createTime',
      width: 180,
      title: '创建时间',
    },
  ];
}
