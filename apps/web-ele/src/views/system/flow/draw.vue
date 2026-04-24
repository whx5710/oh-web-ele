<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Page } from '@vben/common-ui';
import { Button, message, Modal, Select } from 'ant-design-vue';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

// 导入属性面板相关模块
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule, CamundaPlatformPropertiesProviderModule } from 'bpmn-js-properties-panel';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';

// 导入中文翻译
import zhTranslations from 'bpmn-js-i18n/translations/zn';

// properties-panel 的中文翻译
const propertiesPanelZhTranslations = {
  // 通用属性
  "Id": "ID",
  "Name": "名称",
  "Documentation": "文档",
  "Element Documentation": "元素文档",
  "As XML": "作为 XML",
  "Cancel Activity": "取消活动",
  "Activity Behavior": "活动行为",
  "Asynchronous Continuations": "异步继续",
  "Asynchronous Before": "异步之前",
  "Asynchronous After": "异步之后",
  "Job Priority": "作业优先级",
  "Job Retries": "作业重试次数",
  "Exclusive": "独占",
  "Operations": "操作",
  "Add": "添加",
  "Remove": "移除",
  "Edit": "编辑",
  "Save": "保存",
  "Cancel": "取消",
  "Delete": "删除",
  "Up": "上移",
  "Down": "下移",
  "Required": "必填",
  "Optional": "可选",
  "Expression": "表达式",
  "Variable": "变量",
  "Constant": "常量",
  "Script": "脚本",
  "FEEL": "FEEL",
  "JavaScript": "JavaScript",
  "Groovy": "Groovy",
  "Python": "Python",
  "Ruby": "Ruby",
  "Java": "Java",
  "Spin": "Spin",
  "External": "外部",
  "Embedded": "嵌入",
  "Inline Script": "内联脚本",
  "Referenced Script": "引用脚本",
  "Resource": "资源",
  "Resource Name": "资源名称",
  "Script Format": "脚本格式",
  "Script Type": "脚本类型",
  "Script Value": "脚本值",
  "Result Variable": "结果变量",
  "Camunda": "Camunda",
  "Camunda Platform": "Camunda 平台",
  "Zeebe": "Zeebe",
  "Properties": "属性",
  "General": "通用",
  "Details": "详情",
  "Execution": "执行",
  "Multi Instance": "多实例",
  "Loop Characteristics": "循环特性",
  "Cardinality": "基数",
  "Collection": "集合",
  "Element Variable": "元素变量",
  "Completion Condition": "完成条件",
  "Sequential": "顺序",
  "Parallel": "并行",
  "Test Before": "先测试",
  "Is For Compensation": "用于补偿",
  "Activity Type": "活动类型",
  "Task Definition": "任务定义",
  "Task Type": "任务类型",
  "Implementation": "实现",
  "Job Type": "作业类型",
  "Topic": "主题",
  "Retries": "重试次数",
  "Priority": "优先级",
  "Form Key": "表单键",
  "Form Fields": "表单字段",
  "Form Field": "表单字段",
  "Field Id": "字段 ID",
  "Label": "标签",
  "Type": "类型",
  "Default Value": "默认值",
  "Validation": "验证",
  "Constraints": "约束",
  "Assignee": "负责人",
  "Candidate Users": "候选用户",
  "Candidate Groups": "候选组",
  "Due Date": "截止日期",
  "Follow Up Date": "跟进日期",
  "Task Listeners": "任务监听器",
  "Execution Listeners": "执行监听器",
  "Listener": "监听器",
  "Event Type": "事件类型",
  "Complete": "完成",
  "Timeout": "超时",
  "Start": "开始",
  "End": "结束",
  "Take": "获取",
  "Condition": "条件",
  "Condition Type": "条件类型",
  "Condition Expression": "条件表达式",
  "Default": "默认",
  "Sequence Flow": "顺序流",
  "Message Flow": "消息流",
  "Association": "关联",
  "Direction": "方向",
  "Source": "源",
  "Target": "目标",
  "Message": "消息",
  "Message Name": "消息名称",
  "Message Id": "消息 ID",
  "Signal": "信号",
  "Signal Name": "信号名称",
  "Signal Id": "信号 ID",
  "Error": "错误",
  "Error Code": "错误代码",
  "Error Message": "错误消息",
  "Timer": "定时器",
  "Timer Definition Type": "定时器定义类型",
  "Time Date": "时间日期",
  "Time Duration": "时间持续",
  "Time Cycle": "时间周期",
  "Escalation": "升级",
  "Escalation Code": "升级代码",
  "Link": "链接",
  "Link Name": "链接名称",
  "Compensation": "补偿",
  "Conditional": "条件",
  "Variable Name": "变量名称",
  "Variable Event": "变量事件",
  "All": "全部",
  "Gateway Direction": "网关方向",
  "Converging": "汇聚",
  "Diverging": "分叉",
  "Mixed": "混合",
  "Inclusive": "包容",
  "Event Based": "基于事件",
  "Complex": "复杂",
  "Call Activity": "调用活动",
  "Called Element": "被调用元素",
  "Business Key": "业务键",
  "Case Reference": "案例引用",
  "Case Status": "案例状态",
  "Case Variables": "案例变量",
  "Process Variables": "流程变量",
  "Variables": "变量",
  "Variable Type": "变量类型",
  "String": "字符串",
  "Integer": "整数",
  "Long": "长整数",
  "Double": "双精度",
  "Boolean": "布尔值",
  "Null": "空",
  "Object": "对象",
  "Array": "数组",
  "Variable Value": "变量值",
  "Input Parameters": "输入参数",
  "Output Parameters": "输出参数",
  "Parameter": "参数",
  "Parameter Name": "参数名称",
  "Parameter Value": "参数值",
  "Input Mappings": "输入映射",
  "Output Mappings": "输出映射",
  "Mapping": "映射",
  "Source Expression": "源表达式",
  "Target Variable": "目标变量",
  "Connector": "连接器",
  "Connector Id": "连接器 ID",
  "Connector Type": "连接器类型",
  "Connector Inputs": "连接器输入",
  "Connector Outputs": "连接器输出",
  "Extension Properties": "扩展属性",
  "Extension Property": "扩展属性",
  "History Time To Live": "历史存活时间",
  "Version Tag": "版本标签",
  "Executable": "可执行",
  "Process Type": "流程类型",
  "Public": "公共",
  "Private": "私有",
  "Is Executable": "是否可执行",
  "Candidate Starter Groups": "候选启动组",
  "Candidate Starter Users": "候选启动用户",
  "Process Documentation": "流程文档",
  "Participant": "参与者",
  "Pool": "池",
  "Lane": "通道",
  "Lane Set": "通道集",
  "Partition Element": "分区元素",
  "Group": "组",
  "Text Annotation": "文本注释",
  "Text": "文本",
  "Data Object": "数据对象",
  "Data Store": "数据存储",
  "Data Input": "数据输入",
  "Data Output": "数据输出",
  "Data Input Association": "数据输入关联",
  "Data Output Association": "数据输出关联",
  "Source Ref": "源引用",
  "Target Ref": "目标引用",
  "Transformation": "转换",
  "From": "从",
  "To": "到"
};

// 合并翻译
const combinedZhTranslations = {
  ...zhTranslations,
  ...propertiesPanelZhTranslations
};

// 自定义翻译模块
const CustomTranslateModule = {
  translate: ['value', function(template, replacements) {
    replacements = replacements || {};
    const translated = combinedZhTranslations[template] || template;
    return translated.replace(/{([^}]+)}/g, (_, key) => {
      return replacements[key] || '{' + key + '}';
    });
  }]
};

// 导入属性面板样式
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';

import type { BpmnFlowApi } from '#/api/system/flow';
import { createFlow, getFlowList, updateFlow } from '#/api/system/flow';

const containerRef = ref<HTMLElement>();
const propertiesPanelRef = ref<HTMLElement>();
const modeler = ref<BpmnModeler>();
const editFlag = ref<string>('new');

// 选择流程，进行编辑
const OPTIONS = ref<FlowItem[]>([]);
const selectedItem = ref<string>('');
const flowId = ref<string>('');
interface FlowItem {
  keyCode: string;
  name: string;
}

// 处理流程选择
const handleSelect = async (value: string) => {
  if (!value) return;
  
  try {
    // 调用 getFlowList 获取流程详情
    const res = await getFlowList({
      keyCode: value,
      pageNum: 1,
      pageSize: 10
    });
    
    if (res.list && res.list.length > 0) {
      editFlag.value = 'edit';
      const flow = res.list[0];
      // console.log('获取到的流程详情:', flow);
      // 加载流程 XML 到模型器中
      flowId.value = flow.id;
      if (flow.xml) {
        importModel(flow.xml);
        // message.success('流程加载成功');
      } else {
        message.error('流程 XML 为空');
      }
    } else {
      message.error('未找到对应的流程');
    }
  } catch (error) {
    console.error('获取流程详情失败:', error);
    message.error('获取流程详情失败');
  }
};


// 初始化 BPMN 模型
const initModeler = () => {
  if (!containerRef.value || !propertiesPanelRef.value) return;

  modeler.value = new BpmnModeler({
    container: containerRef.value,
    height: '100%',
    width: '100%',
    propertiesPanel: {
      parent: propertiesPanelRef.value
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      CamundaPlatformPropertiesProviderModule,
      CustomTranslateModule
    ],
    moddleExtensions: {
      camunda: camundaModdleDescriptor
    },
    // 添加中文翻译
    i18n: {
      translate: function(template: string, replacements?: Record<string, string>) {
        replacements = replacements || {};
        const translated = combinedZhTranslations[template] || template;
        return translated.replace(/{([^}]+)}/g, (_: string, key: string) => {
          return replacements[key] || '{' + key + '}';
        });
      }
    }
  });

  // 创建默认流程
  createDefaultProcess();
  // 查询流程列表
  getFlowListApi({
    pageNum: 1,
    pageSize: 20,
  })
};

/**
 * 查询流程列表
 * @param params 参数
 */
const getFlowListApi = async (params: any) => {
  getFlowList(params).then((res: BpmnFlowApi.BpmnFlowPage) => {
    // console.log('流程列表:', res.list);
    OPTIONS.value = res.list.map(item => ({ keyCode: item.keyCode, name: item.name }));
  });
};

// 处理关键字搜索
const handleSearch = (value: string) => {
  getFlowListApi({
    pageNum: 1,
    pageSize: 20,
    keyWord: value
  });
};

// 创建默认流程
const createDefaultProcess = async () => {
  if (!modeler.value) return;

  const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds height="36" width="36" x="100" y="200" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

  try {
    await modeler.value.importXML(defaultXml);
    flowId.value = '';
    console.log('BPMN 模型加载成功');
  } catch (error) {
    console.error('BPMN 模型加载失败:', error);
  }
};

// 保存 BPMN 模型到服务器
const saveModel = async () => {
  if (!modeler.value) return;
  try {
    // 获取 XML 内容
    const { xml } = await modeler.value.saveXML({ format: true });
    
    // 获取 SVG 内容
    const { svg } = await modeler.value.saveSVG({
      fit: true,
      background: '#ffffff'
    });
    
    // 获取流程信息
    let processId = 'process';
    let processName = '流程';
    let processNote = '';
    
    // 获取流程元素
    const elementRegistry = modeler.value.get('elementRegistry');
    const processElements = elementRegistry.filter(element => element.type === 'bpmn:Process');
    
    if (processElements.length > 0) {
      const processElement = processElements[0];
      processId = processElement.id;
      
      // 从 businessObject 中获取 name 属性
      processName = processElement.businessObject.name || processElement.name || processId;
      console.log('processElement.name:', processElement.name);
      console.log('processElement.businessObject.name:', processElement.businessObject.name);
      
      // 获取 documentation 内容
      if (processElement.businessObject.documentation) {
        const documentation = processElement.businessObject.documentation;
        if (Array.isArray(documentation) && documentation.length > 0) {
          processNote = documentation[0].text || documentation[0].body || '';
        } else if (documentation.text) {
          processNote = documentation.text;
        } else if (documentation.body) {
          processNote = documentation.body;
        }
      }
      console.log('processNote:', processNote);
    }
    if (editFlag.value === 'new') {
      // 判断流程key是否已经存在
      getFlowList({
        keyCode: processId,
        pageNum: 1,
        pageSize: 2
      }).then((res: BpmnFlowApi.BpmnFlowPage) => {
        if (res.list && res.list.length > 0) {
          message.error('流程key已存在');
          return;
        }else{
          // 调用 createFlow 接口保存流程
          const params: BpmnFlowApi.BpmnFlow = {
            id: flowId.value,
            keyCode: processId,
            name: processName,
            xml: xml,
            svgStr: svg,
            versionTag: '1.0.0',
            note: processNote || '流程设计器创建'
          };
          createFlow(params).then(() => {
            message.success('流程新增成功');
          });
        }
      });
    } else {
      // 调用 createFlow 接口保存流程
          const params: BpmnFlowApi.BpmnFlow = {
            id: flowId.value,
            keyCode: processId,
            name: processName,
            xml: xml,
            svgStr: svg,
            note: processNote || '流程设计器创建'
          };
          updateFlow(params).then(() => {
            message.success('流程修改成功');
          });
    }
  } catch (error) {
    console.error('保存 BPMN 模型失败:', error);
    message.error('流程保存失败');
  }
};

// 导出流程图为SVG
const exportAsImage = async () => {
  if (!modeler.value) return;

  let processId = 'process';
  const elementRegistry = modeler.value.get('elementRegistry');
  const processElements = elementRegistry.filter(element => element.type === 'bpmn:Process');
  if (processElements.length > 0) {
    processId = processElements[0].id;
  }

  try {
    // 导出为 SVG，使用 fit: true 确保导出整个流程图
    const { svg } = await modeler.value.saveSVG({
      fit: true,  // 适应整个流程图
      width: 1200,  // 设置宽度
      height: 800,  // 设置高度
      background: '#ffffff'  // 设置背景色
    });
    
    // 直接下载 SVG 文件
    downloadFile(svg, `${processId}.svg`, 'image/svg+xml');
    message.success('图片导出成功');
  } catch (error) {
    console.error('导出 SVG 失败:', error);
    message.error('图片导出失败');
  }
};

// 导入 BPMN 模型
const importModel = (xml: string) => {
  if (!modeler.value) return;

  modeler.value.importXML(xml)
    .then(() => {
      // console.log('BPMN 模型导入成功');
      message.success('流程打开成功');
    })
    .catch((error) => {
      console.error('BPMN 模型导入失败:', error);
      message.error('流程打开失败');
    });
};

// 下载文件
const downloadFile = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 处理文件上传
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target?.result as string;
    importModel(content);
  };
  reader.readAsText(file);
};

// 打开流程文件
const handleOpenProcess = () => {
  const fileInput = document.getElementById('bpmn-upload') as HTMLInputElement;
  if (fileInput) {
    fileInput.click();
  }
};

// 创建新流程
const createNewProcess = () => {
  Modal.confirm({
    title: '确认创建新流程',
    content: '确定要创建新流程吗？当前未保存的更改将会丢失。',
    onOk() {
      editFlag.value = 'new';
      createDefaultProcess();
      message.success('新流程创建成功');
    }
  });
};

// 复制 XML 到粘贴板
const handleCopyXML = async () => {
  if (!modeler.value) return;

  try {
    const { xml } = await modeler.value.saveXML({ format: true });
    
    // 使用 Clipboard API 复制到粘贴板
    await navigator.clipboard.writeText(xml);
    message.success('XML 已复制到粘贴板');
  } catch (error) {
    console.error('复制 XML 失败:', error);
    message.error('复制 XML 失败');
  }
};

// 放大流程
const zoomIn = () => {
  if (!modeler.value) return;
  const canvas = modeler.value.get('canvas');
  const viewbox = canvas.viewbox();
  const newScale = viewbox.scale * 1.1;
  canvas.viewbox({ x: viewbox.x, y: viewbox.y, width: viewbox.width / 1.1, height: viewbox.height / 1.1, scale: newScale });
};

// 缩小流程
const zoomOut = () => {
  if (!modeler.value) return;
  const canvas = modeler.value.get('canvas');
  const viewbox = canvas.viewbox();
  const newScale = viewbox.scale * 0.9;
  canvas.viewbox({ x: viewbox.x, y: viewbox.y, width: viewbox.width / 0.9, height: viewbox.height / 0.9, scale: newScale });
};

// 重置缩放
const zoomReset = () => {
  if (!modeler.value) return;
  const canvas = modeler.value.get('canvas');
  canvas.viewbox({ x: 0, y: 0, width: 1000, height: 800, scale: 1 });
};

onMounted(() => {
  initModeler();
});

onUnmounted(() => {
  if (modeler.value) {
    modeler.value.destroy();
  }
});
</script>

<template>
  <Page auto-content-height class="flex flex-col h-full">
    <div class="flex justify-between items-center p-4 bg-white border-b border-gray-200 flex-shrink-0">
      <h2 class="m-0 text-lg font-semibold text-gray-800">流程设计器</h2>
      <div class="flex gap-2">
        <Select
          v-model="selectedItem"
          placeholder="选择流程编辑"
          style="width: 300px"
          :options="OPTIONS.map(item => ({ value: item.keyCode, label: item.keyCode + ' - ' + item.name }))"
          @change="handleSelect"
          allowClear
          show-search
          :filter-option="false"
          @search="handleSearch"
        ></Select>
        <Button @click="createNewProcess">
          新建
        </Button>
        <input
          type="file"
          accept=".bpmn"
          @change="handleFileUpload"
          class="hidden"
          id="bpmn-upload"
        />
        <Button @click="handleOpenProcess">
          打开
        </Button>
        <Button @click="handleCopyXML">
          复制XML
        </Button>
        <Button type="primary" @click="saveModel">
          保存
        </Button>
        <Button type="primary" danger @click="exportAsImage">
          导出图片
        </Button>
      </div>
    </div>
    <div class="flex flex-1 gap-4 " style="height: calc(var(--vben-content-height) - 100px);">
      <div ref="containerRef" class="flex-1 bg-white border border-gray-300 rounded-md overflow-hidden relative">
        <!-- 缩放控制栏 -->
        <div class="absolute bottom-20 right-8 flex flex-col gap-1 z-100">
          <Button size="small" @click="zoomIn" title="放大" class="w-8 h-8 flex items-center justify-center p-0 rounded">
            +
          </Button>
          <Button size="small" @click="zoomReset" title="重置" class="w-8 h-8 flex items-center justify-center p-0 rounded text-xs">
            100%
          </Button>
          <Button size="small" @click="zoomOut" title="缩小" class="w-8 h-8 flex items-center justify-center p-0 rounded">
            -
          </Button>
        </div>
      </div>
      <div ref="propertiesPanelRef" class="w-[300px] bg-white border border-gray-300 rounded-md overflow-auto flex-shrink-0"></div>
    </div>
  </Page>
</template>

<style scoped>
/* 确保 BPMN 画布占满容器 */
:deep(.bjs-container) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

:deep(.djs-container) {
  width: 100% !important;
  height: 100% !important;
}

:deep(svg) {
  width: 100% !important;
  height: 100% !important;
}
</style>
