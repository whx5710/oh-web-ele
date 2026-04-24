<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemAttachApi } from '#/api/system/attachment';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAppConfig } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';
import { useAccessStore } from '@vben/stores';
import { downloadFileFromUrl } from '@vben/utils';

import { ElButton, ElMessage, ElPopconfirm, ElUpload } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteAttach, getAttachPage } from '#/api/system/attachment';
import { sysApi } from '#/config/env';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';

const fileMap = new Map();

// 表格事件
const gridEvents: VxeGridListeners<SystemAttachApi.SysAttach> = {
  // 勾选
  checkboxChange: ({ checked, row }) => {
    // console.warn(checked, '选择数据', row);
    if (checked && row) {
      fileMap.set(row.id, row);
    } else {
      fileMap.delete(row.id);
    }
  },
  // 全选
  checkboxAll: ({ checked }) => {
    const records = gridApi.grid.getCheckboxRecords();
    if (checked) {
      if (records) {
        records.forEach((element) => {
          fileMap.set(element.id, element);
        });
      }
    } else {
      fileMap.clear();
    }
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents,
  showSearchForm: false, // 隐藏搜索表单
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
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getAttachPage({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
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
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemAttachApi.SysAttach>,
});

function onActionClick(e: OnActionClickParams<SystemAttachApi.SysAttach>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'download': {
      download(e.row);
      break;
    }
  }
}

// 下载
function download(row: SystemAttachApi.SysAttach) {
  downloadFileFromUrl({
    source: row.url,
  });
}
// 删除
function onDelete(row: SystemAttachApi.SysAttach) {
  const hideLoading = ElMessage.info({
    message: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
  });
  deleteAttach([row.id])
    .then(() => {
      ElMessage.success({
        message: $t('ui.actionMessage.deleteSuccess', [row.name]),
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading?.close();
    });
}
// 批量删除
function batchDelete() {
  const attachIds: string[] = [];
  fileMap.forEach((value, key) => {
    console.warn(value);
    attachIds.push(key);
  });
  if (attachIds.length === 0) {
    ElMessage.warning({
      message: '请勾选要删除的数据',
    });
    return;
  }
  const hideLoading = ElMessage.info({
    message: '批量删除',
    duration: 0,
  });
  deleteAttach(attachIds)
    .then(() => {
      ElMessage.success({
        message: '批量删除成功',
      });
      onRefresh();
      fileMap.clear();
    })
    .catch(() => {
      hideLoading?.close();
      fileMap.clear();
    });
}

// 刷新列表
function onRefresh() {
  gridApi.query();
}

// 上传成功回调
function handleSuccess() {
  ElMessage.success('文件上传成功');
  gridApi.query();
}

// 上传失败回调
function handleError() {
  ElMessage.error('文件上传失败');
}

const accessStore = useAccessStore();
const token = ref('');
// 格式化请求token
function formatToken() {
  token.value = accessStore.accessToken
    ? `Bearer ${accessStore.accessToken}`
    : '';
}
formatToken();
// 请求头
const headers = { authorization: token.value };
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
// 请求接口 /api/sysApi/sys/file/upload
const actionUrl = `${apiURL}/${sysApi}/sys/file/upload`;
// 上传前
function beforeUpload(file: any) {
  if (file.size / 1024 / 1024 / 1024 / 1024 > 1) {
    ElMessage.warning({
      message: '文件大小不能超过100M',
    });
    return false;
  }
  return true;
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="附件列表">
      <template #toolbar-tools>
        <ElUpload
          class="mr-2 inline-block"
          name="file"
          :multiple="true"
          :action="actionUrl"
          :headers="headers"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-success="handleSuccess"
          :on-error="handleError"
        >
          <ElButton type="primary">
            <IconifyIcon icon="carbon:cloud-upload" /> 上传
          </ElButton>
        </ElUpload>
        <ElPopconfirm title="确定删除？" @confirm="batchDelete">
          <template #reference>
            <ElButton class="mr-2" type="danger">
              <IconifyIcon icon="carbon:row-delete" /> 删除
            </ElButton>
          </template>
        </ElPopconfirm>
      </template>
    </Grid>
  </Page>
</template>
