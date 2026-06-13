import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemAttachApi } from '#/api/system/attachment';

// 搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '附件名称',
      componentProps: {
        clearable: true,
      },
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
