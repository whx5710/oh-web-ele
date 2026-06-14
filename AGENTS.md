# 项目开发规范

## 技术栈

- **框架**: Vue 3.5.34 + Vite 8 + TypeScript 6
- **UI 组件库**: Element Plus 2.14.0
- **表格组件**: vxe-table 4.18.13（通过 @vben/plugins 封装）
- **表单组件**: @vben/common-ui 的 vben-form
- **状态管理**: Pinia 3.0.4
- **路由**: Vue Router 5.0.7（后端动态路由）
- **HTTP 客户端**: Axios 1.16.1（通过 @vben/request 封装）
- **构建工具**: pnpm 10.33.4 + Turbo 2.9.14
- **项目结构**: Monorepo（vben-admin-monorepo v5.7.0）

## 项目结构

```
oh-web-ele/
├── apps/web-ele/              # 主应用
│   ├── src/
│   │   ├── api/               # API 接口封装
│   │   │   ├── request.ts     # 请求客户端配置
│   │   │   ├── core/          # 核心接口（登录、认证等）
│   │   │   └── system/        # 系统管理接口（user、dept、role、menu 等）
│   │   ├── adapter/           # 适配器封装
│   │   │   ├── vxe-table.ts   # 表格适配器（useVbenVxeGrid）
│   │   │   ├── form.ts        # 表单适配器（useVbenForm）
│   │   │   └── component/     # 组件适配器（Element Plus 组件注册）
│   │   ├── views/             # 页面视图
│   │   │   ├── system/        # 系统管理页面
│   │   │   │   ├── user/      # 用户管理
│   │   │   │   │   ├── list.vue         # 用户列表页
│   │   │   │   │   ├── lock.vue         # 锁定用户列表页
│   │   │   │   │   ├── monitor.vue      # 在线用户监控页
│   │   │   │   │   ├── data.ts          # 表格列和表单配置
│   │   │   │   │   └── modules/         # 子模块组件
│   │   │   │   │       └── form.vue     # 用户表单弹窗
│   │   │   │   ├── dept/      # 部门管理
│   │   │   │   ├── role/      # 角色管理
│   │   │   │   ├── menu/      # 菜单管理
│   │   │   │   └── ...
│   │   │   └── _core/         # 核心页面（登录、个人中心等）
│   │   ├── router/            # 路由配置
│   │   │   ├── index.ts       # 路由实例
│   │   │   ├── access.ts      # 动态路由生成（后端菜单驱动）
│   │   │   └── routes/        # 路由模块
│   │   ├── store/             # Pinia Store
│   │   │   └── auth.ts        # 认证状态管理
│   │   ├── locales/           # 多语言
│   │   │   ├── index.ts       # i18n 配置
│   │   │   └── langs/         # 语言包
│   │   ├── config/            # 配置文件
│   │   │   └── env.ts         # 环境变量（sysApi 前缀等）
│   │   ├── layouts/           # 布局组件
│   │   └── app.vue            # 根组件
│   └── package.json
├── packages/                  # 共享包
│   ├── @vben/...              # vben 核心包
│   └── effects/               # 效果插件
└── package.json
```

## 编码规范

### 1. 命名规范

#### 文件命名

- **页面组件**: 小写，语义化命名
  - 列表页: `list.vue`
  - 详情/表单页: `modules/form.vue`
  - 特殊功能页: `monitor.vue`、`lock.vue`
- **子模块组件**: 统一放在 `modules/` 目录下，如 `modules/form.vue`
- **API 文件**: 与模块名一致，如 `user.ts`、`dept.ts`
- **配置文件**: `data.ts`（存放表格列配置和表单 schema）

#### 组件命名

- Vue 单文件组件使用大驼峰导入，如 `import Form from './modules/form.vue'`
- 组件引用使用语义化名称，如 `FormModal`、`Grid`

#### 变量与函数命名

- **接口命名空间**: `SystemUserApi`、`SystemDeptApi`
- **接口类型**: `SystemUser`、`SystemDept`
- **API 函数**: 动词 + 名词，如 `getUserPage`、`createUser`、`deleteDept`
- **表格/表单配置函数**: `useColumns`、`useGridFormSchema`、`useClockColumns`
- **组合式函数**: 以 `use` 开头，如 `useVbenVxeGrid`、`useVbenForm`

### 2. 类文件命名约定

#### API 文件结构

```typescript
// 1. 定义命名空间接口
export namespace SystemUserApi {
  export interface SystemUser {
    id: string;
    username: string;
    // ...
  }
}

// 2. 导出 API 函数
export async function getUserPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    `/${sysApi}/sys/user/page`,
    { params },
  );
}
```

#### 页面文件结构

```typescript
// 1. 类型导入
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

// 2. Vue / 框架导入
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getClockUserPage } from '#/api/system/user';

// 3. 本地模块导入
import { useClockColumns, useClockGridFormSchema } from './data';

// 4. 表格配置
const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: true,
  formOptions: {
    schema: useClockGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useClockColumns(onActionClick),
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getClockUserPage({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  },
});

// 5. 操作回调
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (code) {
    case 'unlock': {
      // 处理解锁逻辑
      break;
    }
  }
}
```

#### data.ts 配置结构

```typescript
// 搜索表单配置
export function useClockGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
      componentProps: {
        clearable: true,
        placeholder: '请输入用户名查询',
      },
    },
  ];
}

// 表格列配置
export function useClockColumns<T = SystemUserApi.SystemUser>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'username', title: '用户名', width: 120 },
    // ...
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: { onClick: onActionClick },
        options: [{ code: 'unlock', text: '解锁' }],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 100,
    },
  ];
}
```

### 3. Import 顺序规范

按以下顺序组织导入：

1. `type` 类型导入
2. Vue / 框架核心导入
3. 第三方库导入（@vben/\*、element-plus）
4. 本地绝对路径导入（`#/api/*`、`#/locales`、`#/adapter/*`）
5. 本地相对路径导入（`./data`、`./modules/form`）

### 4. 表格开发规范

- 使用 `useVbenVxeGrid` 创建表格
- 分页参数统一为 `pageNum` / `pageSize`
- 搜索表单使用 `submitOnChange: true` 实现自动查询
- 操作列使用 `CellOperation` 渲染器
- 状态标签使用 `CellTag` 渲染器
- 表格标题通过 `table-title` prop 设置

### 5. 表单开发规范

- 使用 `useVbenForm` 创建表单
- 表单项通过 `VbenFormSchema` 数组配置
- 使用 `z`（zod）进行表单校验
- 远程选择使用 `ApiSelect` / `ApiTreeSelect` 组件

### 6. 路由与菜单

- **路由由后端动态生成**，通过 `/sys/menu/route` 接口获取
- 前端无需手动配置静态路由（除核心路由外）
- 新增页面后，需在后端菜单管理中配置对应菜单项
- 菜单字段：
  - `name`: 路由名称
  - `path`: 路由路径（如 `/system/user/lock`）
  - `component`: 组件路径（如 `system/user/lock`）
  - `meta.title`: 菜单标题

## 安全规范

1. **Token 处理**: 由 `@vben/request` 自动在请求头中添加 `Authorization: Bearer {token}`
2. **Token 刷新**: 在 `request.ts` 中配置自动刷新逻辑
3. **登录过期**: 支持模态框提示和自动跳转登录页两种模式
4. **权限控制**:
   - 使用 `registerAccessDirective` 注册权限指令
   - 菜单权限由后端返回的 `authCode` 控制
   - 路由访问权限通过 `generateAccessible` 动态生成
5. **API 前缀**: 通过 `sysApi` 变量统一管理（当前值为 `sysApi`）
6. **禁止在代码中硬编码**: 敏感信息（如密钥、密码）禁止写死在代码中

## Git 提交规范

项目使用 lefthook + commitlint 进行提交前检查：

- **pre-commit**: 自动运行代码格式检查和类型检查
- **commit-msg**: 使用 conventional commits 规范检查提交信息

提交信息格式：`type(scope): description`

常用 type:

- `feat`: 新功能
- `fix`: 修复缺陷
- `docs`: 文档变更
- `style`: 代码格式
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建流程、依赖变更
- `ci`: CI 配置变更
- `chore`: 其他杂项

## 配置文件规范

### env.ts

```typescript
const sysApi = 'sysApi'; // 系统管理接口前缀
const externalApi = 'externalApi'; // 扩展系统接口前缀
export { externalApi, sysApi };
```

### request.ts 关键配置

- `responseReturn: 'data'`：直接返回响应数据
- `codeField: 'code'`：响应状态码字段
- `dataField: 'data'`：响应数据字段
- `successCode: 200`：成功状态码

## 常用组件速查

| 功能       | 组件/函数        | 来源                  |
| ---------- | ---------------- | --------------------- |
| 表格       | `useVbenVxeGrid` | `#/adapter/vxe-table` |
| 表单       | `useVbenForm`    | `#/adapter/form`      |
| 弹窗       | `useVbenModal`   | `@vben/common-ui`     |
| 页面容器   | `Page`           | `@vben/common-ui`     |
| 树形组件   | `Tree`           | `@vben/common-ui`     |
| 请求客户端 | `requestClient`  | `#/api/request`       |
| 多语言     | `$t`             | `#/locales`           |
| 图标       | `IconifyIcon`    | `@vben/icons`         |
| 状态管理   | `useUserStore`   | `@vben/stores`        |

## 开发环境要求

- **Node.js**: ^22.18.0 || ^24.0.0
- **pnpm**: >=10.0.0

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:ele

# 构建
pnpm build:ele

# 类型检查
pnpm check:type

# 代码检查
pnpm lint

# 格式化
pnpm format

# 提交代码（使用 cz-git 交互式提交）
pnpm commit
```
