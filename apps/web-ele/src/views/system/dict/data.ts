import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api/system/dict';

// 字典样式标签
export function getDictClassOptions() {
  return [
    { color: 'default', label: 'info', value: 'info' },
    { color: '#ff2700', label: 'danger', value: 'danger' },
    { color: '#006be6', label: 'primary', value: 'primary' },
    { color: 'success', label: 'success', value: 'success' },
    { color: 'warning', label: 'warning', value: 'warning' },
  ];
}

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 * 字典类型弹窗新增、修改表单
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      componentProps: () => {
        return { class: 'hidden' };
      },
    },
    {
      component: 'Input',
      fieldName: 'dictType',
      label: '字典类型',
      componentProps: (values) => {
        return {
          allowClear: true,
          class: 'w-full',
          disabled: values?.dictType !== undefined && values?.id !== undefined,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'dictName',
      label: '字典名称',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '动态SQL', value: 1 },
          { label: '字典数据', value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 0,
      fieldName: 'dictSource',
      label: '字典来源',
    },
    {
      component: 'Input',
      fieldName: 'dictSql',
      label: 'SQL脚本',
      componentProps: (values) => {
        return {
          allowClear: true,
          class: 'w-full',
          type: 'textarea',
          disabled: values?.dictSource === 0,
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: '排序',
      componentProps: {
        style: 'width: 100%',
        defaultValue: 0,
      },
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: '备注',
      componentProps: () => {
        return {
          allowClear: true,
          class: 'w-full',
          type: 'textarea',
        };
      },
    },
  ];
}

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 * 字典数据表单；维护字典中的数据信息
 */
export function useDataSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'dictLabel',
      label: '字典标签',
      componentProps: () => {
        return {
          allowClear: true,
          class: 'w-full',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'dictValue',
      label: '字典值',
    },
    {
      component: 'Input',
      fieldName: 'labelClass',
      label: '标签样式',
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: '排序',
      componentProps: {
        style: 'width: 100%',
        defaultValue: 0,
      },
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: '备注',
      componentProps: () => {
        return {
          allowClear: true,
          class: 'w-full',
          type: 'textarea',
        };
      },
    },
  ];
}

// 搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyWord',
      label: '关键字搜索',
      componentProps: {
        allowClear: true,
      },
    },
  ];
}
// 表格的列
export function useColumns<T = SystemDictApi.SystemType>(
  onActionClick: OnActionClickFn<T>,
  // onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'id',
      title: 'ID',
      width: 100,
      visible: false, // 是否可见-隐藏
    },
    {
      align: 'left',
      field: 'dictType',
      title: '字典类型',
      width: 200,
    },
    {
      align: 'left',
      field: 'dictName',
      title: '字典名称',
      width: 200,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'warning', label: '动态SQL', value: 1 },
          { color: 'success', label: '字典数据', value: 0 },
        ],
      },
      field: 'dictSource',
      width: 110,
      title: '字典来源',
    },
    {
      align: 'left',
      field: 'remark',
      title: '备注',
    },
    {
      field: 'sort',
      title: '排序',
      width: 50,
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: '字典类型',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '字典配置',
          },
          'edit', // 默认的编辑按钮
          'delete', // 删除
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 180,
    },
  ];
}
// 数据表格
export function useDictDataColumns<T = SystemDictApi.SystemType>(
  onActionClick: OnActionClickFn<T>,
  // onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'id',
      title: 'ID',
      width: 100,
      visible: false,
    },
    {
      align: 'left',
      field: 'dictLabel',
      title: '字典标签',
      minWidth: 120,
    },
    {
      align: 'left',
      field: 'dictValue',
      title: '字典值',
      width: 100,
    },
    {
      align: 'left',
      field: 'labelClass',
      title: '标签样式',
      width: 100,
      cellRender: { name: 'CellTag', options: getDictClassOptions() },
    },
    {
      field: 'sort',
      title: '排序',
      width: 50,
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: '字典类型',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          'delete', // 删除
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 120,
    },
  ];
}
