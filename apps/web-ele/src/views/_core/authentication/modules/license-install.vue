<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { useVbenForm, z } from '#/adapter/form';
import { getLicenseInfo, installLicense } from '#/api/system/license';
import type { LicenseApi } from '#/api/system/license';

defineOptions({ name: 'LicenseInstall' });

const licenseInfo = ref<LicenseApi.LicenseInfo>({});
const infoLoading = ref(false);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    hideLabel: true,
    hideRequiredMark: true,
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入 License JSON 字符串',
        rows: 8,
        type: 'textarea',
      },
      fieldName: 'licenseJson',
      label: 'License',
      rules: z.string().min(1, { message: 'License 内容不能为空' }),
    },
  ],
  showDefaultActions: false,
});

async function loadLicenseInfo() {
  infoLoading.value = true;
  try {
    const res = (await getLicenseInfo()) as any;
    // 兼容直接返回对象或标准包装格式 { code, data, success, msg }
    licenseInfo.value = res?.data ?? res ?? {};
    // eslint-disable-next-line no-console
    console.log('License 信息', res, licenseInfo.value);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('获取 License 信息失败', error);
    licenseInfo.value = {};
  } finally {
    infoLoading.value = false;
  }
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const jsonData = JSON.parse(values.licenseJson as string);
      const res = await installLicense(jsonData);
      if (res.success && res.code === 200) {
        ElMessage.success('License 安装成功');
        modalApi.close();
      } else {
        ElMessage.error(res.msg || 'License 安装失败');
      }
    } catch (error: any) {
      ElMessage.error(error?.message || 'JSON 解析失败');
    } finally {
      modalApi.lock(false);
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      formApi.resetForm();
      formApi.resetValidate();
      loadLicenseInfo();
    }
  },
});

function formatValue(value: any) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join('、') : '-';
  }
  return value;
}
</script>

<template>
  <Modal title="安装 License 证书" class="w-[720px]">
    <div class="mx-4 space-y-4">
      <!-- 当前 License 信息 -->
      <div class="rounded-lg border border-border bg-secondary/30 p-4">
        <h4 class="mb-3 text-sm font-medium">当前 License 信息</h4>
        <div
          v-if="infoLoading"
          class="text-muted-foreground text-sm"
        >
          加载中...
        </div>
        <div
          v-else-if="!licenseInfo.subject && !licenseInfo.signature && !licenseInfo.graceExpireAt"
          class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm"
        >
          <div class="space-y-1">
            <span class="font-medium text-yellow-500">暂无 License 信息</span>
          </div>
          <div class="col-span-2 space-y-1">
            <span class="text-muted-foreground">机器码：</span>
            <span class="break-all font-medium">{{ formatValue(licenseInfo.machineCode) }}</span>
          </div>
        </div>
        <div v-else-if="licenseInfo.graceExpireAt" class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div class="space-y-1">
            <span class="text-muted-foreground">宽限期到期时间：</span>
            <span class="font-medium">{{ formatValue(licenseInfo.graceExpireAt) }}</span>
          </div>
          <div class="col-span-2 space-y-1">
            <span class="text-muted-foreground">绑定机器码：</span>
            <span class="break-all font-medium">{{ formatValue(licenseInfo.machineCode) }}</span>
          </div>
        </div>
        <div v-else class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div class="space-y-1">
            <span class="text-muted-foreground">授权主体：</span>
            <span class="font-medium">{{ formatValue(licenseInfo.subject) }}</span>
          </div>
          <div class="space-y-1">
            <span class="text-muted-foreground">最大在线用户数：</span>
            <span class="font-medium">{{ formatValue(licenseInfo.maxUsers===0?'无限制':licenseInfo.maxUsers) }}</span>
          </div>
          <div class="space-y-1">
            <span class="text-muted-foreground">签发时间：</span>
            <span class="font-medium">{{ formatValue(licenseInfo.issuedAt) }}</span>
          </div>
          <div class="space-y-1">
            <span class="text-muted-foreground">过期时间：</span>
            <span class="font-medium">{{ formatValue(licenseInfo.expireAt) }}</span>
          </div>
          <div class="col-span-2 space-y-1">
            <span class="text-muted-foreground">绑定机器码：</span>
            <span class="break-all font-medium">{{ formatValue(licenseInfo.machineCode) }}</span>
          </div>
          <div class="col-span-2 space-y-1">
            <span class="text-muted-foreground">授权模块：</span>
            <span class="break-all font-medium">{{ formatValue(licenseInfo.modules) }}</span>
          </div>
        </div>
      </div>

      <!-- License 输入 -->
      <Form />
    </div>
  </Modal>
</template>
