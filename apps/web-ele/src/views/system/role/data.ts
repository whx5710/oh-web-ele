import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';
import type { SystemTenantApi } from '#/api/system/tenant';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.role.roleCode'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        type: 'textarea',
      },
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      component: 'Input',
      fieldName: 'menuIdList',
      formItemClass: 'items-start',
      label: $t('system.role.setPermissions'),
      modelPropName: 'modelValue',
    },
  ];
}
// 搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'tenantName',
      label: '租户名',
      componentProps: {
        allowClear: true,
      },
    },
  ];
}

export function useColumns<T = SystemRoleApi.SystemRole>(
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
      field: 'name',
      title: $t('system.role.roleName'),
      width: 200,
    },
    {
      field: 'code',
      minWidth: 100,
      title: $t('system.role.roleCode'),
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { type: 'warning', label: '是', value: 1 },
          { type: 'success', label: '否', value: 0 },
        ],
      },
      field: 'isSystem',
      width: 80,
      title: '内置角色',
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
      title: $t('system.role.remark'),
    },
    {
      field: 'createTime',
      title: $t('system.role.createTime'),
      width: 160,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.role.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
            disabled: (row: SystemRoleApi.SystemRole) => {
              return !!(row.isSystem === 1);
            },
          },
          {
            text: '查看用户',
            code: 'viewUser' // 查看用户
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
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
          { type: 'warning', label: '男', value: 0 },
          { type: 'success', label: '女', value: 1 },
          { type: 'danger', label: '未知', value: 2 },
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
  ];
}
