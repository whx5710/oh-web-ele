<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

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

import { Button, message, Popconfirm, Upload } from 'ant-design-vue';

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
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteAttach([row.id])
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
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
    message.warning({
      content: '请勾选要删除的数据',
    });
    return;
  }
  const hideLoading = message.loading({
    content: '批量删除',
    duration: 0,
    key: 'action_process_msg',
  });
  deleteAttach(attachIds)
    .then(() => {
      message.success({
        content: '批量删除成功',
        key: 'action_process_msg',
      });
      onRefresh();
      fileMap.clear();
    })
    .catch(() => {
      hideLoading();
      fileMap.clear();
    });
}

// 刷新列表
function onRefresh() {
  gridApi.query();
}

// 上传
function handleChange(info: UploadChangeParam) {
  // if (info.file.status !== 'uploading') {
  //   console.warn(info.file, info.fileList);
  // }
  if (info.file.status === 'done') {
    if (info.file.response.code === 500) {
      message.error(`${info.file.name} ${info.file.response.msg}`);
    } else {
      message.success(`${info.file.name} 文件上传成功`);
      gridApi.query();
    }
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} 文件上传失败`);
  }
}
const accessStore = useAccessStore();
const token = ref('');
const showUploadList = ref(false);
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
    message.warning({
      content: '文件大小不能超过100M',
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
        <Upload
          class="mr-2"
          name="file"
          :multiple="true"
          :action="actionUrl"
          :headers="headers"
          :show-upload-list="showUploadList"
          :before-upload="beforeUpload"
          @change="handleChange"
        >
          <Button type="primary">
            <IconifyIcon icon="carbon:cloud-upload" /> 上传
          </Button>
        </Upload>
        <Popconfirm title="确定删除？" @confirm="batchDelete">
          <Button class="mr-2" type="primary" danger>
            <IconifyIcon icon="carbon:row-delete" /> 删除
          </Button>
        </Popconfirm>
      </template>
    </Grid>
  </Page>
</template>
