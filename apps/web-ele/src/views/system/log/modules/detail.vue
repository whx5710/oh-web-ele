<script lang="ts" setup>
import type { SystemLogApi } from '#/api/system/log';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElTag } from 'element-plus';

const detailData = ref<SystemLogApi.SysErrorLog>();

const getTitle = computed(() => {
  return '错误日志详情';
});

const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemLogApi.SysErrorLog>();
      if (data) {
        detailData.value = data;
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-[750px]">
    <div v-if="detailData" class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="w-24 text-right text-gray-500">错误代码：</span>
        <ElTag type="danger">{{ detailData.errCode }}</ElTag>
      </div>
      <div class="flex gap-3">
        <span class="w-24 text-right text-gray-500 flex-shrink-0">错误消息：</span>
        <div class="flex-1 whitespace-pre-wrap">{{ detailData.msg }}</div>
      </div>
      <div class="flex gap-3">
        <span class="w-24 text-right text-gray-500 flex-shrink-0">跟踪ID：</span>
        <div class="flex-1 font-mono text-sm">{{ detailData.traceId }}</div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex gap-3">
          <span class="w-24 text-right text-gray-500 flex-shrink-0">租户：</span>
          <div class="flex-1 text-left">{{ detailData.tenantName || '-' }}</div>
        </div>
        <div class="flex gap-3">
          <span class="w-24 text-right text-gray-500 flex-shrink-0">报错时间：</span>
          <div class="flex-1 text-left">{{ detailData.errTime }}</div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex gap-3">
          <span class="w-24 text-right text-gray-500 flex-shrink-0">队列拥挤度：</span>
          <div class="flex-1 text-left">{{ detailData.score }} / 10</div>
        </div>
        <div class="flex gap-3">
          <span class="w-24 text-right text-gray-500 flex-shrink-0">创建时间：</span>
          <div class="flex-1 text-left">{{ detailData.createTime }}</div>
        </div>
      </div>
      <div class="flex gap-3">
        <span class="w-24 text-right text-gray-500 flex-shrink-0">错误栈信息：</span>
        <pre class="flex-1 text-xs text-gray-600 h-40 overflow-y-auto bg-gray-50 p-3 rounded whitespace-pre-wrap break-all">{{ detailData.stackInfo }}</pre>
      </div>
      <div class="flex gap-3">
        <span class="w-24 text-right text-gray-500 flex-shrink-0">备注：</span>
        <div class="flex-1">{{ detailData.note || '-' }}</div>
      </div>
    </div>
  </Modal>
</template>
