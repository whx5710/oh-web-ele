import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { z } from '#/adapter/form';
import { getDeptTreeList } from '#/api/system/dept';
import { $t } from '#/locales';

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        showSearch: true,
        treeNodeFilterProp: 'label',
        api: getDeptTreeList,
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'parentId',
      label: $t('system.dept.parentDept'),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.dept.deptName'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.dept.deptName'), 2]))
        .max(
          20,
          $t('ui.formRules.maxLength', [$t('system.dept.deptName'), 20]),
        ),
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: '排序',
      componentProps: {
        style: 'width: 100%',
        min: 1,
      },
    },
    {
      component: 'Input',
      componentProps: {
        type: 'textarea',
        maxLength: 50,
        rows: 3,
        showCount: true,
        style: 'width: 100%',
      },
      fieldName: 'note',
      label: $t('system.dept.remark'),
      rules: z
        .string()
        .max(50, $t('ui.formRules.maxLength', [$t('system.dept.remark'), 50]))
        .optional(),
    },
  ];
}
// 搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.dept.deptName'),
      componentProps: {
        clearable: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'tenantName',
      label: '租户名',
      componentProps: {
        clearable: true,
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 * @param onActionClick 表格操作按钮点击事件
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemDeptApi.SystemDept>,
): VxeTableGridOptions<SystemDeptApi.SystemDept>['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      align: 'left',
      field: 'name',
      title: $t('system.dept.deptName'),
      width: 150,
    },
    {
      align: 'left',
      field: 'parentName',
      title: '上级部门',
      width: 150,
    },
    {
      align: 'left',
      field: 'tenantName',
      title: '租户',
      width: 150,
    },
    // {
    //   cellRender: { name: 'CellTag' },
    //   field: 'status',
    //   title: $t('system.dept.status'),
    //   width: 100,
    // },
    {
      field: 'createTime',
      title: $t('system.dept.createTime'),
      width: 160,
    },
    {
      field: 'note',
      title: $t('system.dept.remark'),
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.dept.name'),
          onClick: onActionClick,
        },
        props: {
          width: 220,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '新增下级',
          },
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
            disabled: (row: SystemDeptApi.SystemDept) => {
              return !!(row.children && row.children.length > 0);
            },
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.dept.operation'),
      width: 180,
    },
  ];
}
