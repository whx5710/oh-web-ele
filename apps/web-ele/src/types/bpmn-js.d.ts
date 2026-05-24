declare module 'bpmn-js-properties-panel' {
  export const BpmnPropertiesPanelModule: any;
  export const BpmnPropertiesProviderModule: any;
  export const CamundaPlatformPropertiesProviderModule: any;
}

declare module 'camunda-bpmn-moddle/resources/camunda' {
  const camundaModdleDescriptor: any;
  export default camundaModdleDescriptor;
}

declare module 'bpmn-js-i18n/translations/zn' {
  const translations: Record<string, string>;
  export default translations;
}
