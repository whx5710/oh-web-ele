<script lang="ts" setup>
import type { BpmnFlowApi } from '#/api/system/flow';
import { getFlowList, deleteFlow as deleteFlowApi, publishFlow as publishFlowApi } from '#/api/system/flow';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Button, Card, Space, Tag, message, Input, Pagination, Popconfirm, Empty, Modal } from 'ant-design-vue';
import { ref, onMounted } from 'vue';

// 导入流程实例列表组件
import ProcessList from './modules/processList.vue';

// 创建流程实例列表抽屉
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: ProcessList,
  destroyOnClose: true,
  placement: 'right',
});

// 状态管理
const flowList = ref<BpmnFlowApi.BpmnFlow[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyWord = ref('');

// 图片放大功能
const previewVisible = ref(false);
const previewSvg = ref('');

// 处理图片点击事件
const handleImageClick = (svgStr: string) => {
  previewSvg.value = svgStr;
  previewVisible.value = true;
};

// 加载流程列表
const loadFlowList = async () => {
  loading.value = true;
  try {
    const res = await getFlowList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      keyWord: keyWord.value,
    });
    flowList.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error('加载流程列表失败:', error);
    // message.error('加载流程列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索流程
const handleSearch = () => {
  currentPage.value = 1;
  loadFlowList();
};

// 分页变化
const handlePageChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  loadFlowList();
};

// 查看流程详情
const viewFlow = (row: BpmnFlowApi.BpmnFlow) => {
  // 打开流程实例列表抽屉
  formDrawerApi.setData({ keyCode: row.keyCode, name: row.name }).open();
};

// 删除流程
const deleteFlow = (row: BpmnFlowApi.BpmnFlow) => {
  // message.info(`删除流程: ${row.name}`);
  // 这里可以添加删除流程的逻辑
  deleteFlowApi([row.id || '']).then(() => {
    message.success('删除成功');
    loadFlowList();
  }).catch((error) => {
    console.error('删除流程失败:', error);
    // message.error('删除流程失败');
  });
};

/**
 * 发布流程
 * @param row 流程对象
 */
const publishFlow = (row: BpmnFlowApi.BpmnFlow) => {
  // message.info(`发布流程: ${row.name}`);
  // 这里可以添加发布流程的逻辑
  publishFlowApi(row.keyCode || '').then(() => {
    message.success('发布成功');
    loadFlowList();
  }).catch((error) => {
    console.error('发布流程失败:', error);
    // message.error('发布流程失败');
  });
};

// 初始化加载
onMounted(() => {
  loadFlowList();
});
</script>
<template>
  <Page auto-content-height>
    <div class="flow-list-container">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <Input
          v-model:value="keyWord"
          placeholder="请输入流程名称或编码"
          style="width: 300px"
          allow-clear
          @pressEnter="handleSearch"
        />
        <Button type="primary" style="margin-left: 10px" @click="handleSearch">
          搜索
        </Button>
      </div>

      <!-- 流程卡片列表 -->
      <div class="flow-card-list" v-if="flowList.length > 0">
        <Card 
          v-for="flow in flowList" 
          :key="flow.id"
          style="margin-bottom: 16px;"
          :title="flow.name"
        >
          <template #extra>
            <Space>
              <Popconfirm
                :title="`确定发布流程: ${flow.name} 吗?发布后将用最新修改的流程.`"
                ok-text="确定"
                cancel-text="取消"
                @confirm="publishFlow(flow)"
              >
                <Button type="link" danger ">发布</Button>
              </Popconfirm>
              <Popconfirm
                :title="`确定要删除流程: ${flow.name} 吗?`"
                ok-text="确定"
                cancel-text="取消"
                @confirm="deleteFlow(flow)"
              >
                <Button type="link" danger ">删除</Button>
              </Popconfirm>
              <Button type="link" @click="viewFlow(flow)">
                查看
              </Button>
            </Space>
          </template>
          <div class="flow-card-content">
            <div class="flow-info">
              <div class="flow-info-item">
                <span class="label">编码:</span>
                <Tag color="blue">{{ flow.keyCode }}</Tag>
              </div>
              <div class="flow-info-item">
                <span class="label">创建时间:</span>
                <span class="value">{{ flow.createTime || 'N/A' }}</span>
              </div>
              <div class="flow-info-item">
                <span class="label">描述:</span>
                <span class="value">{{ flow.note || '无' }}</span>
              </div>
            </div>
            <div class="flow-svg" v-if="flow.svgStr" @click="handleImageClick(flow.svgStr)">
              <div v-html="flow.svgStr" class="svg-content" style="cursor: pointer;"></div>
            </div>
            <div class="flow-svg" v-else>
              <div class="no-svg">无流程图</div>
            </div>
          </div>
        </Card>
      </div>

      <!-- 空状态 -->
      <div class="empty-container" v-else>
        <Empty description="暂无流程数据" />
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <Pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          show-size-changer
          :page-size-options="['10', '20', '50', '100']"
          :show-total="(total) => `共 ${total} 条记录`"
          @change="handlePageChange"
        />
      </div>

      <!-- 图片预览模态框 -->
      <Modal
        v-model:open="previewVisible"
        title="流程图预览"
        width="80%"
        :footer="null"
      >
        <div class="preview-svg" v-html="previewSvg"></div>
      </Modal>
    </div>
    
    <!-- 流程实例列表抽屉 -->
    <FormDrawer />
  </Page>
</template>

<style scoped>
.flow-list-container {
  padding: 16px;
}

.search-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.flow-card-list {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.flow-card-list .ant-card {
  flex: 1 1 calc(50% - 8px);
  min-width: 300px;
}

.flow-card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flow-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.flow-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
  min-width: 50px;
}

.value {
  color: rgba(0, 0, 0, 0.85);
}

.flow-svg {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-content {
  width: 100%;
  height: 200px;
  overflow: auto;
}

.svg-content svg {
  max-width: 100%;
  max-height: 100%;
}

.no-svg {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.empty-container {
  margin: 64px 0;
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.preview-svg {
  width: 100%;
  height: 600px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.preview-svg svg {
  max-width: 100%;
  max-height: 100%;
  cursor: zoom-in;
}

.preview-svg svg:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}
</style>
