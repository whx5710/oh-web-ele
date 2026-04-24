import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { h, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { useDebounceFn } from '@vueuse/core';
import { Spin } from 'ant-design-vue';

import { z } from '#/adapter/form';
import { getDeptTreeList } from '#/api/system/dept';
import { getPostList } from '#/api/system/post';
import { getRoleList } from '#/api/system/role';
import { getTenantPage } from '#/api/system/tenant';
import { $t } from '#/locales';

const fetching = ref(false);
const userStore = useUserStore();
const keyWord = ref('');

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', ['用户名', 2]))
        .max(50, $t('ui.formRules.maxLength', ['用户名', 50])),
    },
    {
      component: 'Input',
      fieldName: 'realName',
      label: '姓名',
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', ['姓名', 2]))
        .max(50, $t('ui.formRules.maxLength', ['姓名', 50])),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getDeptTreeList,
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'deptId',
      label: '所属部门',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '男', value: 0 },
          { label: '女', value: 1 },
          { label: '未知', value: 2 },
        ],
        // optionType: 'button',
      },
      defaultValue: 0,
      fieldName: 'gender',
      label: '性别',
    },
    {
      component: 'Input',
      fieldName: 'mobile',
      label: '手机号',
      rules: z.string().min(11, $t('ui.formRules.minLength', ['手机号', 11])),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: '邮箱',
      rules: z.string().min(4, $t('ui.formRules.minLength', ['邮箱', 4])),
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        multiple: true,
        api: getPostList,
        class: 'w-full',
        labelField: 'postName',
        valueField: 'id',
      },
      fieldName: 'postIdList',
      label: '所属岗位',
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        multiple: true,
        api: getRoleList,
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
      },
      fieldName: 'roleIdList',
      label: '角色',
    },
    {
      component: 'Input',
      fieldName: 'userKey',
      label: '密钥',
      help: () => '用于第三方登录，不校验验证码', // ['用于第三方登录，不校验验证码', '第二行'].map((v) => h('p', v)),
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 100,
      },
      fieldName: 'note',
      label: '备注',
      rules: z
        .string()
        .max(100, $t('ui.formRules.maxLength', ['备注', 100]))
        .optional(),
    },
  ];
}

// 远程获取数据
function fetchRemoteOptions(keyWord: Record<string, any>) {
  fetching.value = true;
  return getTenantPage({
    pageNum: 1,
    pageSize: 10,
    ...keyWord,
  });
}

// 搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyWord',
      label: '关键字',
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: () => {
        return {
          // 接口转options格式 { tenantId: string; tenantName: string }[]
          afterFetch: (res: any) => {
            fetching.value = false;
            const data: { name: string; path: string }[] = res.list;
            return data.map((item: any) => ({
              label: item.tenantName,
              value: item.tenantId,
            }));
          },
          api: fetchRemoteOptions,
          allowClear: true,
          disabled: userStore.userInfo?.superAdmin !== 1,
          // 禁止本地过滤
          filterOption: false,
          // 如果正在获取数据，使用插槽显示一个loading
          notFoundContent: fetching.value ? undefined : null,
          // 搜索词变化时记录下来， 使用useDebounceFn防抖。
          onSearch: useDebounceFn((value: string) => {
            keyWord.value = value;
          }, 300),
          // 远程搜索参数。当搜索词变化时，params也会更新
          params: {
            keyWord: keyWord.value || undefined,
          },
          showSearch: true,
        };
      },
      // 字段名
      fieldName: 'tenantId',
      // 界面显示的label
      label: '租户',
      renderComponentContent: () => {
        return {
          notFoundContent: fetching.value ? h(Spin) : undefined,
        };
      },
      // rules: 'selectRequired',
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 * @param onActionClick 表格操作按钮点击事件
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemUserApi.SystemUser>,
): VxeTableGridOptions<SystemUserApi.SystemUser>['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      align: 'left',
      field: 'username',
      title: '用户名',
      width: 150,
    },
    {
      align: 'left',
      field: 'realName',
      title: '姓名',
      width: 150,
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
      width: 60,
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
      field: 'tenantName',
      title: '租户',
      width: 150,
    },
    {
      align: 'left',
      field: 'email',
      title: '邮箱',
      width: 150,
    },
    {
      align: 'left',
      field: 'deptName',
      title: '所属机构',
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
      field: 'createTime',
      title: '创建时间',
      width: 160,
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
          'edit', // 默认的编辑按钮
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
      width: 100,
    },
  ];
}
// 在线用户
export function useMonitorColumns(
  onActionClick?: OnActionClickFn<SystemUserApi.SystemUser>,
): VxeTableGridOptions<SystemUserApi.SystemUser>['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      align: 'left',
      field: 'username',
      title: '用户名',
      width: 150,
    },
    {
      align: 'left',
      field: 'realName',
      title: '姓名',
      minWidth: 150,
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
      width: 60,
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
      field: 'tenantName',
      title: '租户',
      minWidth: 150,
    },
    {
      align: 'left',
      field: 'email',
      title: '邮箱',
      minWidth: 150,
    },
    {
      align: 'left',
      field: 'deptName',
      title: '所属机构',
      width: 150,
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
            code: 'show', // 默认的删除按钮
            // disabled: false,
            text: '详情',
          },
          {
            code: 'exit', // 默认的删除按钮
            // disabled: false,
            text: '下线',
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 100,
    },
  ];
}

// 搜索表单
export function useMonitorGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyWord',
      label: '关键字',
      componentProps: {
        allowClear: true,
      },
    },
  ];
}

// 在线用户token
export function useTokenColumns(
  onActionClick?: OnActionClickFn<SystemUserApi.UserToken>,
): VxeTableGridOptions<SystemUserApi.UserToken>['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      align: 'left',
      field: 'username',
      title: '用户名',
      width: 100,
    },
    {
      align: 'left',
      field: 'realName',
      title: '姓名',
      minWidth: 120,
    },
    {
      align: 'left',
      field: 'loginTime',
      title: '登录时间',
      minWidth: 120,
    },
    {
      align: 'left',
      field: 'accessToken',
      title: 'TOKEN',
      minWidth: 150,
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
            code: 'exit', // 默认的删除按钮
            // disabled: false,
            text: '下线',
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 80,
    },
  ];
}
