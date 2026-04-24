<script lang="ts" setup>
import type {
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemAppApi } from '#/api/system/app';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { downloadFileFromBlob } from '@vben/utils';

import {
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessage,
  ElMessageBox,
  ElPopconfirm,
} from 'element-plus';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteByDate,
  deleteLog,
  getLogPage,
  logExport,
} from '#/api/system/app';

import { useLogColumns, useLogGridFormSchema } from './data';

const fileMap = new Map();

// 表格事件
const gridEvents: VxeGridListeners<SystemAppApi.Log> = {
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
    fieldMappingTime: [['createTime', ['startDate', 'endDate']]],
    schema: useLogGridFormSchema(),
    submitOnChange: true,
    showCollapseButton: false, // 是否显示展开/折叠
  },
  gridOptions: {
    columns: useLogColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          if (formValues.startDate) {
            formValues.startDate = `${formValues.startDate} 00:00:00`;
          }
          if (formValues.endDate) {
            formValues.endDate = `${formValues.endDate} 23:59:59`;
          }
          return await getLogPage({
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
  } as VxeTableGridOptions<SystemAppApi.Log>,
});

// 批量导出
function batchExport() {
  gridApi.formApi.getValues().then((res) => {
    const params = res;
    if (res.startTime) {
      params.startTime = `${res.startTime} 00:00:00`;
    }
    if (res.endTime) {
      params.endTime = `${res.endTime} 23:59:59`;
    }
    logExport(params).then((res) => {
      const disposition = res.headers['content-disposition'];
      const filename = disposition.replaceAll('attachment;filename=', '');
      downloadFileFromBlob({
        source: res.data,
        fileName: decodeURI(filename),
      });
    });
  });
}

// 批量删除
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
  const hideLoading = ElMessage.info({
    message: '批量删除',
    duration: 0,
  });
  deleteLog(logIds)
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
// 按时间删除日志
function deleteLogs(command: string) {
  if (command !== undefined) {
    let content = '是否全部删除？';
    if (command !== '0') {
      content = `是否删除${command}天前的日志`;
    }
    ElMessageBox.confirm(content, '是否删除日志', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      const date = new Date();
      date.setDate(date.getDate() - Number(command));
      const formattedDate = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
      deleteByDate(formattedDate).then(() => {
        ElMessage.success({
          message: '删除成功',
        });
        onRefresh();
      });
    }).catch(() => {
      console.warn('已取消');
    });
  }
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="日志列表">
      <template #toolbar-tools>
        <ElPopconfirm title="确定导出？" @confirm="batchExport">
          <template #reference>
            <ElButton class="mr-2" type="primary">
              <IconifyIcon icon="carbon:export" /> 导出
            </ElButton>
          </template>
        </ElPopconfirm>
        <ElPopconfirm title="确定删除？" @confirm="batchDelete">
          <template #reference>
            <ElButton
              v-access:code="['sys:app:delete']"
              class="mr-2"
              type="danger"
            >
              <IconifyIcon icon="carbon:row-delete" /> 删除
            </ElButton>
          </template>
        </ElPopconfirm>
        <ElDropdown class="mr-2" @command="deleteLogs">
          <ElButton v-access:code="['sys:app:delete']">
            按时间删除
            <IconifyIcon icon="ant-design:down-outlined" />
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
