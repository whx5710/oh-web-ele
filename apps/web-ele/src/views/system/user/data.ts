import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { ref } from 'vue';

import { useUserStore } from '@vben/stores';
import { useDebounceFn } from '@vueuse/core';
import { getTenantPage } from '#/api/system/tenant';
import { getDeptTreeList } from '#/api/system/dept';
import { getRoleList } from '#/api/system/role';
import { getPostList } from '#/api/system/post';
import { $t } from '#/locales';
import { z } from '#/adapter/form';

const keyWord = ref('');

const fetching = ref(false);
const userStore = useUserStore();

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
        clearable: true,
        placeholder: '请输入关键字搜索',
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
          clearable: true,
          disabled: userStore.userInfo?.superAdmin !== 1,
          // 禁止本地过滤
          filterable: true,
          remote: true,
          // 搜索词变化时记录下来， 使用useDebounceFn防抖。
          remoteMethod: useDebounceFn((value: string) => {
            keyWord.value = value;
          }, 300),
          // 远程搜索参数。当搜索词变化时，params也会更新
          params: {
            keyWord: keyWord.value || undefined,
          },
        };
      },
      // 字段名
      fieldName: 'tenantId',
      // 界面显示的label
      label: '租户',
      renderComponentContent: () => {
        return {
          loading: fetching.value,
        };
      },
      // rules: 'selectRequired',
    },
  ];
}

// 在线用户搜索表单
export function useMonitorGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyWord',
      label: '关键字',
      componentProps: {
        clearable: true,
        placeholder: '请输入关键字搜索',
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
          clearable: true,
          disabled: userStore.userInfo?.superAdmin !== 1,
          // 禁止本地过滤
          filterable: true,
          remote: true,
          // 搜索词变化时记录下来， 使用useDebounceFn防抖。
          remoteMethod: useDebounceFn((value: string) => {
            keyWord.value = value;
          }, 300),
          // 远程搜索参数。当搜索词变化时，params也会更新
          params: {
            keyWord: keyWord.value || undefined,
          },
        };
      },
      // 字段名
      fieldName: 'tenantId',
      // 界面显示的label
      label: '租户',
      renderComponentContent: () => {
        return {
          loading: fetching.value,
        };
      },
      // rules: 'selectRequired',
    },
  ];
}

export function useColumns<T = SystemUserApi.SystemUser>(
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
      field: 'username',
      title: '用户名',
      width: 120,
    },
    {
      field: 'realName',
      title: '真实姓名',
      width: 120,
    },
    {
      field: 'mobile',
      title: '手机号',
      width: 120,
    },
    {
      field: 'email',
      title: '邮箱',
      width: 150,
    },
    {
      field: 'deptName',
      title: '部门',
      width: 120,
    },
    {
      field: 'postName',
      title: '岗位',
      width: 120,
    },
    {
      field: 'tenantName',
      title: '租户',
      width: 120,
    },
    {
      field: 'status',
      title: '状态',
      width: 80,
      cellRender: {
        name: 'CellTag',
        options: [
          { type: 'warning', label: '禁用', value: 0 },
          { type: 'success', label: '启用', value: 1 },
        ],
      },
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
          nameField: 'realName',
          nameTitle: '用户',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
            disabled: (row: SystemUserApi.SystemUser) => {
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

// 在线用户
export function useMonitorColumns<T = SystemUserApi.SystemUser>(
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
      field: 'username',
      title: '用户名',
      width: 120,
    },
    {
      field: 'realName',
      title: '真实姓名',
      width: 120,
    },
    {
      field: 'tenantName',
      title: '租户',
      width: 120,
    },
    {
      field: 'ip',
      title: 'IP',
      width: 120,
    },
    {
      field: 'address',
      title: '登录地址',
      width: 150,
    },
    {
      field: 'userAgent',
      title: 'User Agent',
      width: 200,
    },
    {
      field: 'loginTime',
      title: '登录时间',
      width: 160,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'realName',
          nameTitle: '用户',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'show',
            text: '查看',
          },
          {
            code: 'exit',
            text: '下线',
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

// Token列表
export function useTokenColumns<T = SystemUserApi.UserToken>(
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
      field: 'accessToken',
      title: 'Token',
      width: 300,
    },
    {
      field: 'ip',
      title: 'IP',
      width: 120,
    },
    {
      field: 'address',
      title: '登录地址',
      width: 150,
    },
    {
      field: 'userAgent',
      title: 'User Agent',
      width: 200,
    },
    {
      field: 'loginTime',
      title: '登录时间',
      width: 160,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'accessToken',
          nameTitle: 'Token',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'exit',
            text: '下线',
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 100,
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
      component: 'Input',
      fieldName: 'password',
      label: '密码',
      componentProps: {
        type: 'password',
        showPassword: true,
      },
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
