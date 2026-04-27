<script setup lang="ts">
/**
 * 流程设计器 - 按需加载版本
 * 
 * 优化说明：
 * 1. BPMN 相关依赖体积较大（约 1MB+），使用动态导入实现按需加载
 * 2. 进入流程设计器页面时才加载 BPMN 相关资源
 * 3. 减少首屏加载时间，提升应用整体性能
 */
import { defineAsyncComponent } from 'vue';

// 使用 defineAsyncComponent 动态导入 BPMN 设计器组件
// 这样 BPMN 相关依赖会被打包到单独的 chunk，按需加载
const BpmnDesigner = defineAsyncComponent(() =>
  import('./draw/index.vue')
);
</script>

<template>
  <BpmnDesigner />
</template>
