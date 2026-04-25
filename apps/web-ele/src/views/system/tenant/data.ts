import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemTenantApi } from '#/api/system/tenant';
import { getDeptTreeList } from '#/api/system/dept';

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 * 新增、修改表单
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'tenantId',
      label: '租户编码',
    },
    {
      component: 'Input',
      fieldName: 'tenantName',
      label: '租户名称',
    },
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
      fieldName: 'deptId',
      label: '根部门',
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
      component: 'Input',
      componentProps: {
        type: 'textarea',
        maxLength: 100,
        rows: 3,
        showCount: true,
        style: 'width: 100%',
      },
      fieldName: 'note',
      label: '备注',
    },
  ];
}

// 搜索表单
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
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: [
          { label: '全部', value: null },
          { label: '正常', value: 1 },
          { label: '停用', value: 0 },
        ],
      },
      // dependencies: {
      //   triggerFields: ['type'],
      // },
      fieldName: 'status',
      label: '状态',
    },
  ];
}

// 搜索表单
export function userSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyWord',
      label: '关键字搜索',
      componentProps: {
        allowClear: true,
      },
    }
  ];
}

export function useColumns<T = SystemTenantApi.SystemTenant>(
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
      field: 'tenantId',
      title: '租户编码',
      width: 200,
    },
    {
      field: 'tenantName',
      title: '租户名称',
      width: 200,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: '正常', value: 1 },
          { color: 'warning', label: '停用', value: 0 },
        ],
      },
      field: 'status',
      minWidth: 100,
      title: '状态',
    },
    {
      field: 'note',
      minWidth: 100,
      title: '备注',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: '租户',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '配置用户',
          },
          'edit', // 默认的编辑按钮
          'delete', // 删除
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 180,
    },
  ];
}

// 数据表格
export function useUserColumns<T = SystemTenantApi.SystemTenant>(
  onActionClick: OnActionClickFn<T>,
  // onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      align: 'left',
      field: 'username',
      title: '用户名',
      width: 120,
    },
    {
      align: 'left',
      field: 'realName',
      title: '姓名',
      width: 120,
    },
    {
      align: 'left',
      field: 'mobile',
      title: '手机号',
      width: 120,
    },
    {
      align: 'left',
      field: 'gender',
      title: '性别',
      width: 55,
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'warning', label: '男', value: 0 },
          { color: 'success', label: '女', value: 1 },
          { color: 'error', label: '未知', value: 2 },
        ],
      },
    },
    {
      align: 'left',
      field: 'email',
      title: '邮箱',
      width: 150,
    },
    {
      align: 'left',
      field: 'status',
      title: '状态',
      width: 50,
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'warning', label: '停用', value: 0 },
          { color: 'success', label: '正常', value: 1 },
        ],
      },
    },
    {
      align: 'left',
      field: 'tenantName',
      title: '租户',
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'realName',
          nameTitle: '用户',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'delete', // 默认的删除按钮
            disabled: false,
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 60,
    },
  ];
}

// 数据表格-选择用户
export function useCheckUserColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'checkbox', width: 60 },
    { title: '序号', type: 'seq', width: 50 },
    {
      align: 'left',
      field: 'username',
      title: '用户名',
      width: 130,
    },
    {
      align: 'left',
      field: 'realName',
      title: '姓名',
      width: 130,
    },
    {
      align: 'left',
      field: 'mobile',
      title: '手机号',
      width: 120,
    },
    {
      align: 'left',
      field: 'gender',
      title: '性别',
      width: 55,
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'warning', label: '男', value: 0 },
          { color: 'success', label: '女', value: 1 },
          { color: 'error', label: '未知', value: 2 },
        ],
      },
    },
    {
      align: 'left',
      field: 'email',
      title: '邮箱',
    },
    {
      align: 'left',
      field: 'status',
      title: '状态',
      width: 50,
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'warning', label: '停用', value: 0 },
          { color: 'success', label: '正常', value: 1 },
        ],
      },
    },
    {
      align: 'left',
      field: 'tenantName',
      title: '租户',
    },
  ];
}
