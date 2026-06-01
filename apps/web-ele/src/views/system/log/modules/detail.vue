<script lang="ts" setup>
import type { SystemLogApi } from '#/api/system/log';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
} from 'element-plus';

const detailData = ref<SystemLogApi.SysErrorLog>();

const getTitle = computed(() => {
  return '错误日志详情';
});

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
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
  <Modal :title="getTitle" class="w-[900px]">
    <div v-if="detailData" class="space-y-4">
      <!-- 基本信息 -->
      <ElCard shadow="never">
        <template #header>
          <div class="font-medium">基本信息</div>
        </template>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="错误代码">
            <ElTag type="danger" size="small">{{ detailData.errCode }}</ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="跟踪ID">
            <span class="font-mono text-xs">{{ detailData.traceId }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="租户">
            {{ detailData.tenantName || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="队列拥挤度">
            <ElTag
              :type="detailData.score >= 4 ? 'danger' : detailData.score >= 2 ? 'warning' : 'success'"
              size="small"
            >
              {{ detailData.score }} / 5
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="报错时间">
            {{ detailData.errTime }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">
            {{ detailData.createTime }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>

      <!-- 错误消息 -->
      <ElCard shadow="never">
        <template #header>
          <div class="font-medium">错误消息</div>
        </template>
        <div class="text-sm text-gray-700 whitespace-pre-wrap">
          {{ detailData.msg }}
        </div>
      </ElCard>

      <!-- 错误堆栈 -->
      <ElCard shadow="never">
        <template #header>
          <div class="font-medium">错误堆栈</div>
        </template>
        <pre
          class="text-xs text-gray-600 h-48 overflow-y-auto bg-gray-50 p-3 rounded whitespace-pre-wrap break-all"
        >{{ detailData.stackInfo }}</pre>
      </ElCard>

      <!-- 备注 -->
      <ElCard v-if="detailData.note" shadow="never">
        <template #header>
          <div class="font-medium">备注</div>
        </template>
        <div class="text-sm text-gray-700">
          {{ detailData.note }}
        </div>
      </ElCard>
    </div>
  </Modal>
</template>
