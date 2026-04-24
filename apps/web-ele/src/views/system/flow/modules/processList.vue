<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
  VxeGridProps,
  VxeGridListeners,
} from '#/adapter/vxe-table';
import { ref } from 'vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listProcessByKey as listProcessByKeyApi, getNodeList, updateNode, updateNodeBatch } from '#/api/system/flow';
import { Button, message, Row, Col, Modal as ModalComponent, Layout, LayoutContent, LayoutFooter } from 'ant-design-vue';
import { useVbenDrawer, useVbenModal, JsonViewer, Page } from '@vben/common-ui';
import { useProcessHistoryColumns, useGridFormSchema } from '../data';
import type { BpmnFlowApi } from '#/api/system/flow';

const keyCode = ref('');
const drawerTitle = ref('流程实例列表');
const procDefId = ref('');
const nodeTitle = ref('节点列表');
const jsonParams = ref({});

// drawerApi
const [Drawer, drawerApi] = useVbenDrawer({
  showConfirmButton: false,
  onOpenChange() {
    const data = drawerApi.getData<{ keyCode: string, name: string }>();
    keyCode.value = data.keyCode;
    drawerTitle.value = `流程发布记录 - ${data.name} - ${data.keyCode}`;
  },
});

// gridApi 流程实例列表
const [Grid] = useVbenVxeGrid({
  gridOptions: {
    columns: useProcessHistoryColumns(onViewClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false, // 禁用分页（不分页）
    },
    proxyConfig: {
      ajax: {
        query: async () => {
          try {
            return await listProcessByKeyApi(keyCode.value);
          } catch (error) {
            console.error('加载流程实例列表失败:', error);
            message.error('加载流程实例列表失败');
            return [];
          }
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
  } as VxeTableGridOptions<BpmnFlowApi.ProcessHistory>,
});

// 查看
function onViewClick(e: OnActionClickParams<BpmnFlowApi.ProcessHistory>) {
  switch (e.code) {
    case 'view': {
      // console.log('onViewClick e ------------ ', e.row);
      modalApi.setData(e.row).open();
      break;
    }
  }
}

const [Modal, modalApi] = useVbenModal({
  // showConfirmButton: false,
  confirmText: '全部保存',
  // showCancelButton: false,
  fullscreen: true,
  async onConfirm() {
    const data = nodeGridApi.grid.getData();
    if (!data) {
      return;
    }
    ModalComponent.confirm({
      content: '是否全部保存？',
      onCancel() {
        console.warn('已取消');
      },
      onOk() {
        updateNodeBatch(data).then(() => {
          message.success('保存成功');
          nodeGridApi.query();
        }).catch(() => {
          console.error('保存节点失败');
          message.error('保存节点失败');
        });
      },
      title: '是否保存当前页',
    });
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<BpmnFlowApi.ProcessHistory>();
      procDefId.value = data?.id || '';
      nodeTitle.value = `节点列表 - ${data?.id || ''}`;
    }
  },
});

// 环节列表
const gridOptions: VxeGridProps<BpmnFlowApi.Node> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'actDefId', title: '环节ID', align: 'left' },
    { field: 'nodeName', title: '名称', align: 'left' },
    { 
      cellRender: {
        name: 'CellTag',
        options: [
          { color: '#f50', label: 'StartEvent', value: 'StartEvent' },
          { color: '#f50', label: 'EndEvent', value: 'EndEvent' },
          { color: '#2db7f5', label: 'UserTask', value: 'UserTask' },
          { color: '#108ee9', label: 'ExclusiveGateway', value: 'ExclusiveGateway' },
          { color: '#2db7f5', label: 'ManualTask', value: 'ManualTask' },
          { color: '#2db7f5', label: 'ReceiveTask', value: 'ReceiveTask' },
          { color: '#2db760', label: 'SequenceFlow', value: 'SequenceFlow' },
        ],
      },
      field: 'elementType',
      title: '类型',
      width: 125
    },
    { field: 'conditionExpression', title: '条件表达式', width: 160 },
    { editRender: { name: 'input', placeholder: '请输入json格式参数' }, field: 'jsonParams', title: '自定义json参数', minWidth: 140 },
    { editRender: { name: 'input', placeholder: '请输入备注' }, field: 'note', title: '备注', minWidth: 160 },
    { editRender: { name: 'input', placeholder: '请输入排序', attrs: { type: 'number' } }, field: 'sort', title: '排序', width: 80 },
    { slots: { default: 'action' }, title: '操作', width: 140 },
  ],
  editConfig: {
    mode: 'row',
    trigger: 'click',
  },
  height: 'auto',
  keepSource: true,
  border: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, _params) => {
        return await getNodeList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          procDefId: procDefId.value,
          ..._params,
        });
      },
    },
  },
  showOverflow: true,
  rowConfig: {
    keyField: 'id',
    isCurrent: true, // 高亮选中行
  }
} as VxeTableGridOptions<BpmnFlowApi.Node>;

// 点击事件
const gridEvents: VxeGridListeners<BpmnFlowApi.Node> = {
  cellClick: ({ row }) => {
    jsonParams.value = JSON.parse(row.jsonParams || '{}') || {};
  },
};

// 流程实例环节详情列表
const [NodeGrid, nodeGridApi] = useVbenVxeGrid({ 
  gridOptions,
  gridEvents,
  // 搜索表单
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
    showCollapseButton: false, // 是否显示展开/折叠
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    refreshOptions: { code: 'query' },
    search: true,
    zoom: true,
  },
  // showSearchForm: false, // 默认隐藏搜索表单
 });

// 判断是否在编辑状态
function hasEditStatus(row: BpmnFlowApi.Node) {
  return nodeGridApi.grid?.isEditByRow(row);
}
// 取消编辑
const cancelRowEvent = (_row: BpmnFlowApi.Node) => {
  nodeGridApi.grid?.clearEdit();
};
// 保存编辑
async function saveRowEvent(row: BpmnFlowApi.Node) {
  await nodeGridApi.grid?.clearEdit();
  nodeGridApi.setLoading(true);
  await updateNode(row).then(() => {
    nodeGridApi.setLoading(false);
    message.success({ content: `保存成功！nodeName=${row.nodeName || row.actDefId || ''}` });
    nodeGridApi.query();
  }).catch(() => {
    nodeGridApi.setLoading(false);
    message.error({ content: `保存失败！nodeName=${row.nodeName || row.actDefId || ''}` }); 
  });
}
// 编辑
function editRowEvent(row: BpmnFlowApi.Node) {
  nodeGridApi.grid?.setEditRow(row);
}
</script>

<template>
  <Drawer class="w-full max-w-[65%]" :title="drawerTitle">
    <Grid table-title="">
      <template #toolbar-tools>
      </template>
    </Grid>
  </Drawer>
  <Modal :title="nodeTitle" class="min-w-[80%]">
    <Layout>
      <LayoutContent>
        <Page auto-content-height style="height: calc(var(--vben-content-height) - 200px); overflow-y: auto;">
          <NodeGrid table-title="" auto-content-height class="min-h-[550px]">
            <!-- <template #toolbar-tools>
            </template> -->
            <template #action="{ row }">
              <template v-if="hasEditStatus(row)">
                <Button type="link" @click="saveRowEvent(row)">保存</Button>
                <Button type="link" @click="cancelRowEvent(row)">取消</Button>
              </template>
              <template v-else>
                <Button type="link" @click="editRowEvent(row)">编辑</Button>
              </template>
            </template>
          </NodeGrid>
        </Page>
      </LayoutContent>
      <LayoutFooter style="padding: 8px 8px;">
        <JsonViewer
          style="min-height: 145px;"
          :value="jsonParams"
          copyable
          preview-mode
          :showDoubleQuotes="true"
          :show-array-index="false" />
      </LayoutFooter>
    </Layout>
  </Modal>
</template>

<style scoped>
/* 自定义样式 */
</style>