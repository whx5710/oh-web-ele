<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { reactive, ref, watch } from 'vue';

import { Page, Tree, useVbenModal } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';
import { downloadFileFromBlob } from '@vben/utils';

import {
  ElButton,
  ElCard,
  ElCol,
  ElInput,
  ElMessage,
  ElPopconfirm,
  ElRow,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDeptTreeList } from '#/api/system/dept';
import {
  deleteUser,
  getUserById,
  getUserPage,
  userExport,
} from '#/api/system/user';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

// 获取上级部门ID
let expandedKeys: Array<number | string> = [];
const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

// const showLine = ref<boolean>(true);
const queryParam = ref();
const searchValue = ref<string>('');
// const autoExpandParent = ref<boolean>(true);
/**
 * 编辑用户
 * @param row
 */
function onEdit(row: SystemUserApi.SystemUser) {
  getUserById(row.id).then((data) => {
    formModalApi.setData(data).open();
  });
}

/**
 * 创建新用户
 */
function onCreate() {
  formModalApi.setData(queryParam.value).open();
}

/**
 * 删除用户
 * @param row
 */
function onDelete(row: SystemUserApi.SystemUser) {
  const hideLoading = ElMessage.loading({
    message: $t('ui.actionMessage.deleting', [row.realName]),
    duration: 0,
  });
  deleteUser(row.id)
    .then(() => {
      ElMessage.success({
        message: $t('ui.actionMessage.deleteSuccess', [row.realName]),
      });
      refreshGrid();
    })
    .catch(() => {
      hideLoading?.close();
    });
}

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false, // 默认隐藏搜索表单
  gridEvents: {},
  // 搜索表单
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
    showCollapseButton: false, // 是否显示展开/折叠
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    // pagerConfig: {
    //   enabled: false,
    // },
    proxyConfig: {
      ajax: {
        query: async ({ page }, _params) => {
          return await getUserPage({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ..._params,
            ...queryParam.value,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isCurrent: true, // 高亮选中行
    },
    toolbarConfig: {
      custom: true,
      export: false,
      search: true,
      refresh: true,
      refreshOptions: { queryMethod: refreshGrid }, // 刷新按钮调用方法
      zoom: true,
    },
    // treeConfig: {
    //   parentField: 'parentId',
    //   rowField: 'id',
    //   transform: false,
    // },
  } as VxeTableGridOptions,
});

/**
 * 刷新表格
 */
function refreshGrid() {
  queryParam.value = { parentId: null };
  gridApi.query(queryParam.value);
  getDeptTree({});
}
// 部门树
const treeData = ref([]);
// 加载树形单位信息
const getDeptTree = (params: Recordable<any>) => {
  getDeptTreeList(params).then((data) => {
    const tmpData = reactive([] as any);
    tmpData.push({
      id: '0',
      name: '全部',
      children: data,
    });
    treeData.value = tmpData;
    treeData.value = tmpData;
    generateList(treeData.value);

    setTimeout(() => {
      // 展开-延迟执行
      // deptTreeRef.value.expandNodes(['0']);
    }, 100);
  });
};
getDeptTree({});
const deptTreeRef = ref();
// 点击左边树形列表，查询单位信息
const getDeptById = (node: any) => {
  queryParam.value = { deptId: node.value.id };
  gridApi.query(queryParam.value);
};
const getParentKey = (id: number | string): number | string | undefined => {
  let parentId;
  if (id) {
    expandedKeys.push(id);
    for (const node of dataList) {
      if (node.parentId && node.id === id) {
        parentId = node.parentId;
        expandedKeys.push(parentId);
      }
    }
    if (parentId) {
      getParentKey(parentId);
    }
  }
  return parentId;
};
// 转列表
const dataList: any[] = [];
const generateList = (data: any[]) => {
  for (const node of data) {
    const id = node.id;
    const parentId = node.parentId;
    dataList.push({ id, parentId, title: node.name });
    if (node.children) {
      generateList(node.children);
    }
  }
};
watch(searchValue, (value) => {
  expandedKeys = [];
  dataList.forEach((item) => {
    if (item.title.includes(value)) {
      getParentKey(item.id);
    }
  });
  searchValue.value = value;
  const params = [...new Set(expandedKeys)];
  getDeptTree({ deptIds: params });
  deptTreeRef.value.expandNodes(params);
});
// 批量导出
function batchExport() {
  gridApi.formApi.getValues().then((res) => {
    const params = res;
    // if (res.startTime) {
    //   params.startTime = `${res.startTime} 00:00:00`;
    // }
    // if (res.endTime) {
    //   params.endTime = `${res.endTime} 23:59:59`;
    // }
    userExport(params).then((res) => {
      const disposition = res.headers['content-disposition'];
      const filename = disposition.replaceAll('attachment;filename=', '');
      downloadFileFromBlob({
        source: res.data,
        fileName: decodeURI(filename),
      });
    });
  });
}
</script>
<template>
  <ElRow>
    <ElCol :span="6">
      <Page auto-content-height>
        <ElCard>
          <ElInput
            v-model="searchValue"
            style="margin-bottom: 8px"
            placeholder="请输入关键字"
            clearable
          />
          <Tree
            ref="deptTreeRef"
            :tree-data="treeData"
            bordered
            :transition="false"
            value-field="id"
            label-field="name"
            @select="getDeptById"
          >
            <template #node="item">
              <span v-if="item.value.name.includes(searchValue)">
                {{
                  item.value.name.substring(
                    0,
                    item.value.name.indexOf(searchValue),
                  )
                }}
                <span style="font-weight: bold; color: #f50">{{
                  searchValue
                }}</span>
                {{
                  item.value.name.substring(
                    item.value.name.indexOf(searchValue) + searchValue.length,
                  )
                }}
              </span>
              <span v-else>{{ item.value.name }}</span>
            </template>
          </Tree>
        </ElCard>
      </Page>
    </ElCol>
    <ElCol :span="18">
      <!-- content-class 对应tailwind样式，详情查看 https://tailwind.nodejs.cn/docs -->
      <Page auto-content-height content-class="pl-0">
        <FormModal @success="refreshGrid" />
        <Grid table-title="用户列表">
          <template #toolbar-tools>
            <ElButton class="mr-2" type="primary" @click="onCreate">
              <Plus class="size-5" />
              新增
            </ElButton>
            <ElPopconfirm title="确定导出？" @confirm="batchExport">
              <template #reference>
                <ElButton class="mr-2" type="primary">
                  <IconifyIcon icon="carbon:export" class="mr-1" /> 导出
                </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </Grid>
      </Page>
    </ElCol>
  </ElRow>
</template>

<style lang="scss" scoped>
.messageIndex {
  z-index: 99 !important;
}
.contentPage {
  padding-left: 0rem !important;
}
</style>
