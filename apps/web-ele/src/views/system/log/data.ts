import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api/system/log';

import dayjs from 'dayjs';

// 搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
      componentProps: {
        clearable: true,
      },
    },
    // 暂时移除日期选择器，避免 Element Plus 日期组件错误
    // {
    //   component: 'DatePicker',
    //   fieldName: 'startTime',
    //   label: '开始时间',
    //   componentProps: {
    //     valueFormat: 'YYYY-MM-DD',
    //     placeholder: '请选择开始时间',
    //   },
    // },
    // {
    //   component: 'DatePicker',
    //   fieldName: 'endTime',
    //   label: '结束时间',
    //   componentProps: {
    //     valueFormat: 'YYYY-MM-DD',
    //     placeholder: '请选择结束时间',
    //   },
    // },
  ];
}
// 搜索表单-操作日志
export function useOpGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyWord',
      label: '关键字',
      componentProps: {
        clearable: true,
      },
    },
  ];
}

// 错误日志表单
export function useErrorLogGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyWord',
      label: '关键字',
      componentProps: {
        clearable: true,
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'errTime',
      label: '报错时间',
      componentProps: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        style: { width: '100%' },
      },
      defaultValue: [
        dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      ],
    },
  ];
}
// 登录日志
export function useLoginColumns(): VxeTableGridOptions['columns'] {
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
      field: 'username',
      title: '用户名',
      width: 200,
    },
    {
      field: 'address',
      title: '登录地址',
      minWidth: 180,
    },
    {
      field: 'status', // 登录状态  0：失败   1：成功
      width: 120,
      title: '登录状态',
      cellRender: {
        name: 'CellTag',
        options: [
          { type: 'warning', label: '失败', value: 0 },
          { type: 'success', label: '成功', value: 1 },
        ],
      },
    },
    {
      field: 'ip',
      width: 120,
      title: 'IP',
    },
    {
      field: 'userAgent',
      minWidth: 120,
      title: 'User Agent',
    },
    // {
    //   field: 'statusLabel',
    //   minWidth: 120,
    //   title: '登录状态',
    // },
    {
      field: 'operationLabel',
      minWidth: 120,
      title: '操作信息',
    },
    {
      field: 'createTime',
      width: 150,
      title: '创建时间',
    },
    // {
    //   align: 'center',
    //   cellRender: {
    //     attrs: {
    //       nameField: 'name',
    //       nameTitle: '附件',
    //       onClick: onActionClick,
    //     },
    //     name: 'CellOperation',
    //     options: [
    //       {
    //         code: 'download', // 默认的删除按钮
    //         text: '详情',
    //       },
    //     ],
    //   },
    //   field: 'operation',
    //   fixed: 'right',
    //   title: '操作',
    //   width: 130,
    // },
  ];
}

// 操作日志
export function useOpColumns(): VxeTableGridOptions['columns'] {
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
      field: 'module',
      title: '模块名',
      width: 150,
    },
    {
      field: 'name',
      title: '操作名',
      minWidth: 120,
    },
    {
      field: 'reqUri',
      width: 120,
      title: '请求URI',
    },
    {
      field: 'realName',
      minWidth: 120,
      title: '操作人',
    },
    {
      field: 'reqMethod',
      width: 100,
      title: '请求方法',
    },
    {
      field: 'reqParams',
      minWidth: 120,
      title: '请求参数',
    },
    {
      field: 'ip',
      minWidth: 120,
      title: '操作IP',
    },
    {
      field: 'address',
      minWidth: 120,
      title: '登录地址',
    },
    {
      field: 'userAgent',
      minWidth: 120,
      title: 'User Agent',
    },
    {
      field: 'operateTypeLabel',
      minWidth: 120,
      title: '操作类型',
    },
    {
      field: 'duration',
      minWidth: 120,
      title: '执行时长(毫秒)',
    },
    {
      field: 'status',
      minWidth: 120,
      title: '操作状态',
      cellRender: {
        name: 'CellTag',
        options: [
          { type: 'warning', label: '失败', value: 0 },
          { type: 'success', label: '成功', value: 1 },
        ],
      },
    },
    {
      field: 'resultMsg',
      minWidth: 120,
      title: '返回消息',
    },
    {
      field: 'createTime',
      width: 150,
      title: '创建时间',
    },
    {
      field: 'userId',
      title: '用户ID',
      visible: false,
    },
  ];
}

// 错误日志
export function useErrorLogColumns<T = SystemLogApi.SysErrorLog>(
  onActionClick: OnActionClickFn<T>,
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
      field: 'errCode',
      title: '错误代码',
      width: 95,
    },
    {
      field: 'msg',
      title: '错误消息',
      minWidth: 100,
      showOverflow: true,
    },
    {
      field: 'traceId',
      title: '跟踪ID',
      minWidth: 200,
      cellRender: {
        attrs: {
          onClick: onActionClick,
        },
        name: 'CellLink',
      },
    },
    {
      field: 'queueSize',
      title: '队列数量',
      width: 85,
    },
    {
      field: 'stackInfo',
      title: '错误栈信息',
      minWidth: 250,
      showOverflow: true,
      visible: false,
    },
    {
      field: 'score',
      title: '队列拥挤度',
      width: 150,
      cellRender: {
        name: 'CellRate',
        props: {
          max: 5,
          modelValue: 'score',
          allowHalf: true,
        },
      },
    },
    {
      field: 'errTime',
      title: '报错时间',
      width: 180,
    },
    {
      field: 'createTime',
      width: 180,
      title: '创建时间',
      visible: false,
    },
    {
      field: 'note',
      title: '备注',
      showOverflow: true,
    },
  ];
}
