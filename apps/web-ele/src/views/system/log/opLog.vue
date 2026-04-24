<script lang="ts" setup>
import type {
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api/system/log';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { downloadFileFromBlob } from '@vben/utils';

import { ElButton, ElPopconfirm } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOpLogPage, opLogExport } from '#/api/system/log';
// import { sysApi } from '#/config/env';

import { useOpColumns, useOpGridFormSchema } from './data';

const fileMap = new Map();

// 表格事件
const gridEvents: VxeGridListeners<SystemLogApi.SysLoginLog> = {
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
  formOptions: {
    // 字段映射时间范围（已改为独立的开始/结束时间字段）
    // fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useOpGridFormSchema(),
    submitOnChange: true,
    showCollapseButton: false, // 是否显示展开/折叠
  },
  showSearchForm: false, // 隐藏搜索表单
  gridOptions: {
    columns: useOpColumns(),
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
          // 移除空值字段
          if (!formValues.startTime) delete formValues.startTime;
          if (!formValues.endTime) delete formValues.endTime;
          return await getOpLogPage({
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
  } as VxeTableGridOptions<SystemLogApi.SysOpLog>,
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
    opLogExport(params).then((res) => {
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
  <Page auto-content-height>
    <Grid table-title="日志列表">
      <template #toolbar-tools>
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
</template>
