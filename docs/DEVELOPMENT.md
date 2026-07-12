# Oh Admin Ele 开发上手指南

本文档面向需要在 `apps/web-ele` 中进行业务功能开发的工程师，涵盖从环境准备到完成一个完整 CRUD 模块的全流程。

---

## 1. 技术栈与前置知识

| 层级 | 技术 |
| --- | --- |
| 框架 | Vue 3.5（Composition API + `<script setup>`） |
| 构建 | Vite 8 + pnpm workspace + Turbo |
| 语言 | TypeScript 5 |
| UI 库 | Element Plus 2.14 |
| 表格 | vxe-table 4.18（通过 `@vben/plugins` 封装） |
| 表单 | `@vben/common-ui` 的 `vben-form` |
| 路由 | Vue Router 5，后端动态路由 |
| 状态 | Pinia 3 |
| HTTP | Axios（通过 `@vben/request` 封装） |
| 校验 | zod |
| 样式 | TailwindCSS + SCSS |

建议先阅读：

- [AGENTS.md](../AGENTS.md)：项目级开发规范（命名、Import 顺序、提交规范等）。
- 本文档第 6、7、8 章的代码模板，可直接复制修改。

---

## 2. 环境准备

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev:ele

# 3. 常用命令
pnpm build:ele   # 生产构建
pnpm check:type  # 类型检查
pnpm lint        # 代码检查
pnpm format      # 自动格式化
pnpm commit      # 交互式提交（cz-git）
```

要求：

- Node.js：`^22.18.0 || ^24.0.0`
- pnpm：`>=10.0.0`

---

## 3. 项目结构（业务开发重点关注）

```text
apps/web-ele/src/
├── api/                    # 接口封装
│   ├── request.ts          # requestClient / baseRequestClient
│   ├── core/               # 登录、认证、刷新 token
│   └── system/             # 系统管理接口：user、dept、role、menu ...
├── adapter/                # 适配器
│   ├── component/index.ts  # Element Plus 组件注册（表单/弹窗可用组件清单）
│   ├── form.ts             # useVbenForm、zod 导出
│   └── vxe-table.ts        # useVbenVxeGrid、CellOperation 等渲染器
├── views/                  # 页面
│   ├── _core/              # 登录、个人中心、异常页
│   ├── dashboard/          # 首页 / 工作台
│   └── system/             # 系统管理页面
│       ├── user/
│       │   ├── list.vue           # 列表页
│       │   ├── lock.vue           # 锁定用户页
│       │   ├── monitor.vue        # 在线用户监控
│       │   ├── data.ts            # 表格列 + 表单 schema
│       │   └── modules/
│       │       └── form.vue       # 新增/编辑弹窗
│       └── dept/ ...
├── router/
│   ├── access.ts           # 动态路由生成（读取后端菜单）
│   └── routes/core.ts      # 核心静态路由（登录、首页、个人中心）
├── store/auth.ts           # 登录、登出、用户信息
├── locales/                # 多语言
│   ├── index.ts
│   └── langs/
│       ├── zh-CN/
│       │   ├── page.json
│       │   └── system.json
│       └── en-US/ ...
├── config/env.ts           # sysApi / externalApi 前缀
└── layouts/                # BasicLayout / AuthLayout / IFrameView
```

---

## 4. 开发工作流

新增一个业务模块（以 `system/post` 岗位管理为例）的标准流程：

1. **API 层**：在 `src/api/system/post.ts` 定义类型和接口函数。
2. **配置层**：在 `src/views/system/post/data.ts` 定义表格列和表单 schema。
3. **弹窗层**：在 `src/views/system/post/modules/form.vue` 实现新增/编辑弹窗。
4. **列表层**：在 `src/views/system/post/list.vue` 实现表格、搜索、操作。
5. **菜单层**：登录后端管理界面，在菜单管理中新增菜单项，绑定组件路径 `system/post/list`。
6. **刷新页面**：前端会根据后端菜单动态生成路由，新页面即可访问。

> 路由由后端驱动，前端**不需要**手动添加静态路由（`core.ts` 中的核心路由除外）。

---

## 5. 新增模块完整示例

下面给出一个最小可用的 CRUD 模块模板，可直接复制后替换字段名。

### 5.1 API 层：`src/api/system/post.ts`

```typescript
import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace SystemPostApi {
  export interface SystemPost {
    id: string;
    postCode: string;
    postName: string;
    sort: number;
    status: 0 | 1;
    createTime: string;
    note?: string;
  }
}

export async function getPostPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemPostApi.SystemPost>>(
    `/${sysApi}/sys/post/page`,
    { params },
  );
}

export async function createPost(data: Recordable<any>) {
  return requestClient.post(`/${sysApi}/sys/post`, data);
}

export async function updatePost(id: string, data: Recordable<any>) {
  data.id = id;
  return requestClient.post(`/${sysApi}/sys/post/update`, data);
}

export async function deletePost(id: string) {
  return requestClient.post(`/${sysApi}/sys/post/del`, [id]);
}

export async function getPostById(id: string | number) {
  return requestClient.get<SystemPostApi.SystemPost>(
    `/${sysApi}/sys/post/${id}`,
  );
}
```

**约定：**

- 接口类型用命名空间：`SystemPostApi.SystemPost`。
- API 函数命名：`getXxxPage`、`createXxx`、`updateXxx`、`deleteXxx`、`getXxxById`。
- URL 前缀统一使用 `sysApi`（当前值为 `sysApi`）。
- 分页参数：后端返回 `{ list: [], total: number }`，前端在 `vxe-table.ts` 已配置 `result: 'list'`、`total: 'total'`。

### 5.2 配置层：`src/views/system/post/data.ts`

```typescript
import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

// 编辑表单 schema
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'postCode',
      label: '岗位编码',
      rules: z.string().min(2, $t('ui.formRules.minLength', ['岗位编码', 2])),
    },
    {
      component: 'Input',
      fieldName: 'postName',
      label: '岗位名称',
      rules: z.string().min(2, $t('ui.formRules.minLength', ['岗位名称', 2])),
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: '排序',
      defaultValue: 1,
      componentProps: { min: 1, style: 'width: 100%' },
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: '状态',
      defaultValue: 1,
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
    },
    {
      component: 'Input',
      fieldName: 'note',
      label: '备注',
      componentProps: { type: 'textarea', rows: 3, maxLength: 50, showCount: true },
      rules: z.string().max(50, $t('ui.formRules.maxLength', ['备注', 50])).optional(),
    },
  ];
}

// 搜索表单 schema
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'postName',
      label: '岗位名称',
      componentProps: { clearable: true, placeholder: '请输入岗位名称' },
    },
  ];
}

// 表格列
export function useColumns<T = SystemPostApi.SystemPost>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'postCode', title: '岗位编码', width: 120 },
    { field: 'postName', title: '岗位名称', width: 150 },
    { field: 'sort', title: '排序', width: 80 },
    {
      field: 'status',
      title: '状态',
      width: 90,
      cellRender: {
        name: 'CellTag',
        options: [
          { type: 'warning', label: '禁用', value: 0 },
          { type: 'success', label: '启用', value: 1 },
        ],
      },
    },
    { field: 'createTime', title: '创建时间', width: 160 },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'postName',
          nameTitle: '岗位',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', { code: 'delete', disabled: (row) => row.isSystem === 1 }],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 130,
    },
  ];
}
```

### 5.3 弹窗层：`src/views/system/post/modules/form.vue`

```vue
<script lang="ts" setup>
import type { SystemPostApi } from '#/api/system/post';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { createPost, updatePost } from '#/api/system/post';
import { $t } from '#/locales';

import { useSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<SystemPostApi.SystemPost>();
const getTitle = computed(() =>
  formData.value?.id ? '修改岗位' : '新增岗位',
);

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  schema: useSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    modalApi.lock();
    try {
      const data = await formApi.getValues();
      await (formData.value?.id
        ? updatePost(formData.value.id, data)
        : createPost(data));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.lock(false);
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemPostApi.SystemPost>();
      formData.value = data;
      formApi.setValues(data || {});
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-[700px]">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <ElButton type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </ElButton>
      </div>
    </template>
  </Modal>
</template>
```

### 5.4 列表页：`src/views/system/post/list.vue`

```vue
<script lang="ts" setup>
import type { OnActionClickParams, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElMessage, ElPopconfirm } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deletePost, getPostById, getPostPage } from '#/api/system/post';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

function onCreate() {
  formModalApi.setData({}).open();
}

async function onEdit(row: SystemPostApi.SystemPost) {
  const data = await getPostById(row.id);
  formModalApi.setData(data).open();
}

async function onDelete(row: SystemPostApi.SystemPost) {
  try {
    await deletePost(row.id);
    ElMessage.success($t('ui.actionMessage.deleteSuccess', [row.postName]));
    gridApi.query();
  } catch {
    ElMessage.error($t('ui.actionMessage.deleteFailed', [row.postName]));
  }
}

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemPostApi.SystemPost>) {
  switch (code) {
    case 'edit':
      onEdit(row);
      break;
    case 'delete':
      onDelete(row);
      break;
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: true,
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getPostPage({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'id', isCurrent: true },
    toolbarConfig: {
      custom: true,
      export: false,
      search: true,
      refresh: true,
      zoom: true,
    },
  } as VxeTableGridOptions,
});

function refreshGrid() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid table-title="岗位列表">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
```

---

## 6. API 层开发详解

### 6.1 请求客户端

在业务代码中统一使用 `requestClient`：

```typescript
import { requestClient } from '#/api/request';
```

特性：

- 自动在请求头携带 `Authorization: Bearer {token}`。
- 自动处理 `responseReturn: 'data'`，业务代码直接拿到 `data` 内容。
- 自动刷新 token（通过 `preferences.app.enableRefreshToken` 控制）。
- 业务错误统一通过 `ElMessage.error` 提示。

### 6.2 标准响应结构

后端约定：

```json
{
  "code": 200,
  "data": { "list": [], "total": 0 },
  "msg": "success"
}
```

`request.ts` 配置：

- `codeField: 'code'`
- `dataField: 'data'`
- `successCode: 200`

### 6.3 文件下载

参考 `userExport` 示例：

```typescript
import { downloadFileFromBlob } from '@vben/utils';

const res = await requestClient.download('/sysApi/sys/user/export', {
  params,
  responseReturn: 'raw',
});
const filename =
  res.headers['content-disposition']?.replaceAll('attachment;filename=', '') ||
  'export.xlsx';
downloadFileFromBlob({ source: res.data, fileName: decodeURI(filename) });
```

### 6.4 无 Token 请求

登录接口等不需要 token 的场景，使用 `baseRequestClient`。

---

## 7. 页面层开发详解

### 7.1 Import 顺序

必须遵守以下顺序：

```typescript
// 1. type 类型导入
import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

// 2. Vue / 框架核心
import { ref } from 'vue';

// 3. 第三方库（@vben/*、element-plus）
import { Page, useVbenModal } from '@vben/common-ui';
import { ElButton } from 'element-plus';

// 4. 本地绝对路径导入
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPostPage } from '#/api/system/post';
import { $t } from '#/locales';

// 5. 本地相对路径导入
import { useColumns } from './data';
import Form from './modules/form.vue';
```

### 7.2 页面容器 `Page`

```vue
<Page auto-content-height>
  <!-- 页面内容 -->
</Page>
```

常用属性：

- `auto-content-height`：自动撑满剩余高度。
- `content-class`：传入 Tailwind 类，如 `pl-0`。

### 7.3 表格 `useVbenVxeGrid`

#### 基础配置

```typescript
const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: true,           // 是否显示搜索表单
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,         // 修改后自动查询
    showCollapseButton: false,    // 是否显示展开/折叠
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getPostPage({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  },
});
```

#### 表格 API 常用方法

```typescript
gridApi.query();              // 重新查询（保留当前分页）
gridApi.query({ status: 1 }); // 带参数查询
gridApi.reload();             // 刷新当前页
gridApi.formApi.getValues();  // 获取搜索表单值
```

#### 操作列 `CellOperation`

```typescript
{
  align: 'center',
  cellRender: {
    name: 'CellOperation',
    attrs: {
      nameField: 'postName',   // 删除确认弹窗中显示的名称字段
      nameTitle: '岗位',        // 删除确认弹窗中的对象名称
      onClick: onActionClick,
    },
    options: [
      'edit',                   // 内置编辑按钮
      { code: 'delete' },       // 内置删除按钮（带二次确认）
      { code: 'custom', text: '自定义' },
      { code: 'disabledBtn', text: '禁用', disabled: (row) => row.isSystem === 1 },
    ],
  },
  field: 'operation',
  fixed: 'right',
  title: '操作',
}
```

内置 code：

- `edit`：编辑按钮。
- `delete`：删除按钮，自动弹出二次确认。

自定义按钮通过 `code` + `text` 声明，点击后会触发 `onActionClick`。

#### 状态标签 `CellTag`

```typescript
{
  field: 'status',
  title: '状态',
  cellRender: {
    name: 'CellTag',
    options: [
      { type: 'warning', label: '禁用', value: 0 },
      { type: 'success', label: '启用', value: 1 },
    ],
  },
}
```

#### 其他内置渲染器

| 渲染器 | 用途 |
| --- | --- |
| `CellTag` | 状态标签 |
| `CellOperation` | 操作按钮组 |
| `CellSwitch` | 开关（需配置 `beforeChange`） |
| `CellImage` | 图片预览 |
| `CellLink` | 链接按钮 |
| `CellRate` | 评分展示 |

---

## 8. 表单开发详解

### 8.1 创建表单

```typescript
import { useVbenForm, z } from '#/adapter/form';

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',           // horizontal / vertical
  schema: useSchema(),
  showDefaultActions: false,      // 弹窗中通常自己控制按钮
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});
```

### 8.2 常用表单组件

| 组件 | 说明 |
| --- | --- |
| `Input` | 输入框 |
| `InputNumber` | 数字输入 |
| `RadioGroup` | 单选组，通过 `options` 配置 |
| `CheckboxGroup` | 多选组 |
| `Select` | 下拉选择（基于 ElSelectV2） |
| `ApiSelect` | 远程下拉选择 |
| `ApiTreeSelect` | 远程树形选择 |
| `TreeSelect` | 本地树形选择 |
| `DatePicker` | 日期选择 |
| `TimePicker` | 时间选择 |
| `Switch` | 开关 |
| `Upload` | 上传 |
| `IconPicker` | 图标选择 |
| `Divider` | 分隔线 |

### 8.3 表单校验

```typescript
{
  component: 'Input',
  fieldName: 'postName',
  label: '岗位名称',
  rules: z
    .string()
    .min(2, $t('ui.formRules.minLength', ['岗位名称', 2]))
    .max(20, $t('ui.formRules.maxLength', ['岗位名称', 20])),
}
```

可选字段使用 `.optional()`。

### 8.4 远程选择 `ApiSelect` / `ApiTreeSelect`

```typescript
{
  component: 'ApiTreeSelect',
  fieldName: 'deptId',
  label: '所属部门',
  componentProps: {
    api: getDeptTreeList,
    labelField: 'name',
    valueField: 'id',
    childrenField: 'children',
    allowClear: true,
    showSearch: true,
    checkStrictly: true,
  },
}
```

### 8.5 弹窗表单数据回显

```typescript
const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemPostApi.SystemPost>();
      formData.value = data;
      formApi.setValues(data || {});
    }
  },
});
```

---

## 9. 树形组件使用

左侧树 + 右侧表格是常见布局，参考 `system/user` 和 `system/dept`。

```vue
<script setup>
import { Page, Tree } from '@vben/common-ui';

const treeData = ref([]);
const expandedParams = ref([]);

function onTreeSelect(node) {
  queryParam.value = { deptId: node.value.id };
  gridApi.query(queryParam.value);
}
</script>

<template>
  <ElRow>
    <ElCol :span="6">
      <Page auto-content-height>
        <ElCard>
          <Tree
            :tree-data="treeData"
            value-field="id"
            label-field="name"
            children-field="children"
            v-model:expanded="expandedParams"
            @select="onTreeSelect"
          />
        </ElCard>
      </Page>
    </ElCol>
    <ElCol :span="18">
      <Page auto-content-height content-class="pl-0">
        <!-- 表格 -->
      </Page>
    </ElCol>
  </ElRow>
</template>
```

---

## 10. 路由与菜单

### 10.1 动态路由

路由由后端菜单驱动，前端在 `src/router/access.ts` 中调用 `getAllMenusApi({ type: 'menu' })`，并通过 `generateAccessible` 动态生成。

页面组件通过 `import.meta.glob('../views/**/*.vue')` 自动映射，因此新增页面后**无需改动前端路由文件**。

### 10.2 后端菜单配置

新增页面后，登录后端管理，进入菜单管理新增菜单项：

| 字段 | 说明 | 示例 |
| --- | --- | --- |
| `name` | 路由名称（唯一） | `SystemPost` |
| `path` | 路由路径 | `/system/post` |
| `component` | 组件路径（相对 `views/`） | `system/post/list` |
| `meta.title` | 菜单标题 | `岗位管理` |
| `meta.icon` | 菜单图标（可选） | `lucide:briefcase` |
| `authCode` | 权限标识（可选） | `system:post:list` |

### 10.3 核心静态路由

仅以下路由在前端静态维护：`src/router/routes/core.ts`

- 根路由 `/` + 首页 `/home`
- 个人中心 `/profile`
- 认证路由 `/auth/*`（登录、注册、找回密码等）
- 404 兜底路由

---

## 11. 多语言

### 11.1 使用方式

```vue
<script setup>
import { $t } from '#/locales';
</script>

<template>
  <div>{{ $t('system.post.title') }}</div>
</template>
```

### 11.2 添加语言包

业务语言包位于 `src/locales/langs/{zh-CN,en-US}/`：

- `page.json`：通用页面文案。
- `system.json`：系统管理模块文案。

新增 key 后，需要在两个语言的 JSON 中都补充对应翻译。

### 11.3 与表格列/表单的联动

`data.ts` 中使用函数返回列配置，而不是直接 `export const columns = [...]`，就是为了在语言切换时重新生成表头：

```typescript
export function useColumns(onActionClick) {
  return [
    { field: 'postName', title: $t('system.post.postName') },
  ];
}
```

---

## 12. 权限控制

### 12.1 菜单权限

后端返回的菜单数据中的 `authCode` 会进入 `accessStore.accessCodes`，用于控制按钮级权限。

### 12.2 按钮权限指令

项目中已注册 `v-access` 权限指令（在 `@vben/access` 中），可通过以下方式控制按钮显示：

```vue
<ElButton v-access="'system:user:create'">新增</ElButton>
```

### 12.3 路由守卫

路由访问权限通过 `src/router/guard.ts` 和 `src/router/access.ts` 控制，未授权访问会进入 `forbidden.vue`。

---

## 13. 状态管理

### 13.1 用户认证

`src/store/auth.ts` 提供：

- `authLogin(params, onSuccess)`：登录。
- `logout(redirect)`：登出。
- `fetchUserInfo()`：获取用户信息。

### 13.2 全局 Store

- `useUserStore`：用户信息、角色、权限码。
- `useAccessStore`：accessToken、refreshToken、权限码、登录过期状态。

### 13.3 在组件中使用

```typescript
import { useUserStore } from '@vben/stores';

const userStore = useUserStore();
const currentUserId = computed(() => userStore.userInfo?.id);
```

---

## 14. 常用组件速查

| 功能 | 组件/函数 | 导入路径 |
| --- | --- | --- |
| 页面容器 | `Page` | `@vben/common-ui` |
| 表格 | `useVbenVxeGrid` | `#/adapter/vxe-table` |
| 表单 | `useVbenForm` | `#/adapter/form` |
| 弹窗 | `useVbenModal` | `@vben/common-ui` |
| 抽屉 | `useVbenDrawer` | `@vben/common-ui` |
| 树形组件 | `Tree` | `@vben/common-ui` |
| 请求客户端 | `requestClient` | `#/api/request` |
| 多语言 | `$t` | `#/locales` |
| 图标 | `IconifyIcon` / `Plus` | `@vben/icons` |
| 用户 Store | `useUserStore` | `@vben/stores` |
| 权限 Store | `useAccessStore` | `@vben/stores` |
| 认证 Store | `useAuthStore` | `#/store` |
| 文件下载 | `downloadFileFromBlob` | `@vben/utils` |
| 表单校验 | `z` | `#/adapter/form` |

---

## 15. 调试与排错

### 15.1 接口联调

- 确认 `.env.development` 中的 `VITE_GLOB_API_URL` 指向正确的后端地址。
- 在浏览器 Network 面板中查看请求是否携带 `Authorization`。
- 后端返回非 200 或业务 code 非 200 时，`errorMessageResponseInterceptor` 会自动弹窗提示。

### 15.2 热更新报错

`vxe-table.ts` 中已配置每次 setup 时清理 `Cell*` 开头的渲染器，避免热更新时重复注册。若仍遇到渲染器相关报错，尝试刷新页面。

### 15.3 类型检查

```bash
pnpm check:type
```

提交前 lefthook 会自动运行格式化和类型检查，未通过则无法提交。

---

## 16. 代码提交

项目使用 Conventional Commits：

```bash
pnpm commit
```

常用 type：

- `feat`：新功能
- `fix`：修复缺陷
- `refactor`：重构
- `perf`：性能优化
- `docs`：文档
- `style`：代码格式（不影响逻辑）

提交信息示例：

```text
feat(system): 新增岗位管理模块
fix(system/user): 修复用户编辑时部门回显错误
```

---

## 17. 参考模块

以下模块代码规范且功能完整，可作为开发参考：

| 模块 | 路径 | 适合参考 |
| --- | --- | --- |
| 用户管理 | `src/views/system/user/` | 左侧树 + 右侧表格 + 弹窗表单 + 导出 |
| 部门管理 | `src/views/system/dept/` | 树形表格 + 新增下级 |
| 岗位管理 | `src/views/system/post/` | 标准 CRUD |
| 角色管理 | `src/views/system/role/` | 抽屉分配用户 |

---

## 18. 注意事项

1. **不要硬编码 API 前缀**：统一使用 `sysApi` / `externalApi`。
2. **不要直接引入 Element Plus 全量包**：表单组件已在 `adapter/component/index.ts` 中注册，直接使用组件名即可。
3. **敏感信息禁止写入代码**：token、密钥等通过环境变量或运行时接口获取。
4. **保持 Import 顺序**：类型 → Vue → 第三方 → 绝对路径 → 相对路径。
5. **新增页面后配置后端菜单**：否则前端路由不会生成，页面无法访问。
