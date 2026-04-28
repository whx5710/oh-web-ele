import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { BpmnFlowApi } from '#/api/system/flow';
import type { VbenFormSchema } from '#/adapter/form';

// 流程发布历史表格
export function useProcessHistoryColumns<T = BpmnFlowApi.ProcessHistory>(
  onActionClick: OnActionClickFn<T>,
  // onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'deploymentId',
      title: 'ID',
      width: 100,
      visible: false,
    },
    {
      align: 'left',
      title: '实例ID',
      field: 'id',
      minWidth: 200,
    },
    {
      title: '名称',
      field: 'name',
      minWidth: 200,
    },
    {
      title: '版本号',
      field: 'version',
      width: 80,
    },
    {
      title: '发布时间',
      field: 'createTime',
      minWidth: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'view',
            text: '查看',
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 120,
    },
  ];
}

// 搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
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
