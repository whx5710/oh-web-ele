<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api/system/log';

import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { downloadFileFromBlob } from '@vben/utils';

import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessage,
  ElMessageBox,
  ElPopconfirm,
} from 'element-plus';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteErrorLog,
  deleteErrorLogByDate,
  errorLogExport,
  getErrorLogPage,
} from '#/api/system/log';

import Detail from './modules/detail.vue';
import { useErrorLogColumns, useErrorLogGridFormSchema } from './data';

const fileMap = new Map();

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: Detail,
  destroyOnClose: true,
});

function onActionClick(e: OnActionClickParams<SystemLogApi.SysErrorLog>) {
  switch (e.code) {
    case 'detail': {
      detailModalApi.setData(e.row).open();
      break;
    }
  }
}

const gridEvents: VxeGridListeners<SystemLogApi.SysErrorLog> = {
  checkboxChange: ({ checked, row }) => {
    if (checked && row) {
      fileMap.set(row.id, row);
    } else {
      fileMap.delete(row.id);
    }
  },
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
  showSearchForm: false,
  formOptions: {
    schema: useErrorLogGridFormSchema(),
    submitOnChange: true,
    showCollapseButton: false,
  },
  gridOptions: {
    columns: useErrorLogColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          if (formValues.startTime) {
            formValues.startTime = `${formValues.startTime} 00:00:00`;
          }
          if (formValues.endTime) {
            formValues.endTime = `${formValues.endTime} 23:59:59`;
          }
          if (!formValues.startTime) delete formValues.startTime;
          if (!formValues.endTime) delete formValues.endTime;
          return await getErrorLogPage({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isCurrent: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemLogApi.SysErrorLog>,
});

function batchExport() {
  gridApi.formApi.getValues().then((res) => {
    const params = res;
    if (res.startTime) {
      params.startTime = `${res.startTime} 00:00:00`;
    }
    if (res.endTime) {
      params.endTime = `${res.endTime} 23:59:59`;
    }
    errorLogExport(params).then((res) => {
      const disposition = res.headers['content-disposition'];
      const filename = disposition.replaceAll('attachment;filename=', '');
      downloadFileFromBlob({
        source: res.data,
        fileName: decodeURI(filename),
      });
    });
  });
}

function batchDelete() {
  const logIds: string[] = [];
  fileMap.forEach((value, key) => {
    console.warn(value);
    logIds.push(key);
  });
  if (logIds.length === 0) {
    ElMessage.warning({
      message: '请勾选要删除的数据',
    });
    return;
  }
  deleteErrorLog(logIds)
    .then(() => {
      ElMessage.success({
        message: '批量删除成功',
      });
      onRefresh();
      fileMap.clear();
    })
    .catch(() => {
      fileMap.clear();
    });
}

function onRefresh() {
  gridApi.query();
}

function deleteLogs(command: string) {
  let content = '是否全部删除？';
  if (command !== '0') {
    content = `是否删除${command}天前的日志`;
  }
  ElMessageBox.confirm(content, '是否删除日志', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const date = new Date();
      date.setDate(date.getDate() - Number(command));
      const formattedDate = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
      deleteErrorLogByDate(formattedDate).then(() => {
        ElMessage.success({
          message: '删除成功',
        });
        onRefresh();
      });
    })
    .catch(() => {
      console.warn('已取消');
    });
}
</script>

<template>
  <Page auto-content-height>
    <DetailModal />
    <Grid table-title="日志列表">
      <template #toolbar-tools>
        <ElPopconfirm title="确定导出？" @confirm="batchExport">
          <template #reference>
            <ElButton class="mr-2" type="primary">
              <IconifyIcon icon="carbon:export" class="mr-1" /> 导出
            </ElButton>
          </template>
        </ElPopconfirm>
        <ElPopconfirm title="确定删除？" @confirm="batchDelete">
          <template #reference>
            <ElButton
              class="mr-2"
              type="danger"
              v-access:code="['sys:log:error:delete']"
            >
              <IconifyIcon icon="carbon:row-delete" class="mr-1" /> 删除
            </ElButton>
          </template>
        </ElPopconfirm>
        <ElDropdown class="mr-2" @command="deleteLogs">
          <ElButton v-access:code="['sys:log:error:delete']">
            按时间删除
            <IconifyIcon icon="ant-design:down-outlined" class="ml-1" />
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="0">全部删除</ElDropdownItem>
              <ElDropdownItem command="1">删除1天前的</ElDropdownItem>
              <ElDropdownItem command="3">删除3天前的</ElDropdownItem>
              <ElDropdownItem command="7">删除7天前的</ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </template>
    </Grid>
  </Page>
</template>
