<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { Recordable } from '@vben/types';

import type { SystemRoleApi } from '#/api/system/role';

import { computed, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { ElLoading } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { getAllMenusApi } from '#/api/system/menu';
import { createRole, updateRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

// 定义树节点类型（替代 ant-design-vue 的 DataNode）
interface TreeNode {
  key?: string | number;
  title?: string;
  children?: TreeNode[];
  [key: string]: any;
}

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.SystemRole>();

const schemaData: VbenFormSchema[] =  useFormSchema();

const [Form, formApi] = useVbenForm({
  schema: schemaData,
  showDefaultActions: false,
});

const menuIdList = ref<TreeNode[]>([]);
const loadingPermissions = ref(false);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateRole(id.value, values) : createRole(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      formApi.resetForm();
      if (data) {
        if(data.isSystem === 1){
          schemaData[1] = {
            component: 'Input',
            fieldName: 'code',
            label: $t('system.role.roleCode'),
            rules: 'required',
            disabled: true
          }
        }
        formData.value = data;
        id.value = data.id;
        formApi.setValues(data);
      } else {
        id.value = undefined;
      }

      if (menuIdList.value.length === 0) {
        loadPermissions();
      }
    }
  },
});

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const res = await getAllMenusApi({ type: 'all' });
    menuIdList.value = res as unknown as TreeNode[];
  } finally {
    loadingPermissions.value = false;
  }
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.role.name'))
    : $t('common.create', $t('system.role.name'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    // action
    classes.push('inline-flex');
    if (node.index % 3 >= 1) {
      classes.push('!pl-0');
    }
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #menuIdList="slotProps">
        <div v-loading="loadingPermissions" class="w-full">
          <!-- 不能勾选复选框，去掉 :default-expanded-level="2" -->
          <Tree
            :tree-data="menuIdList"
            multiple
            bordered
            :get-node-class="getNodeClass"
            :default-expanded-level="2" 
            v-bind="slotProps"
            value-field="id"
            label-field="meta.title"
            icon-field="meta.icon"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
              {{ $t(value.meta.title) }}
            </template>
          </Tree>
        </div>
      </template>
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
