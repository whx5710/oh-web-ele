import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { z } from '#/adapter/form';

export function useColumns<T = SystemPostApi.SystemPost>(
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
      field: 'postCode',
      title: '岗位编码',
      width: 120,
    },
    {
      field: 'postName',
      title: '岗位名称',
      width: 120,
    },
    {
      field: 'sort',
      title: '排序',
      width: 80,
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
          nameField: 'postName',
          nameTitle: '岗位',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
            disabled: (row: SystemPostApi.SystemPost) => {
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
      fieldName: 'postCode',
      label: '岗位编码',
      rules: z.string().min(2, '最小两个长度').max(50, '最大50个长度'),
    },
    {
      component: 'Input',
      fieldName: 'postName',
      label: '岗位名称',
      rules: z.string().min(2, '最小两个长度').max(50, '最大50个长度'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
        style: 'width: 100%',
      },
      defaultValue: 0,
      fieldName: 'sort',
      label: '排序',
    },
    {
      component: 'Input',
      componentProps: {
        type: 'textarea',
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
