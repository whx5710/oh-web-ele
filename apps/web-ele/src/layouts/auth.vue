<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { AuthPageLayout } from '@vben/layouts';
import { useVbenModal } from '@vben/common-ui';
import { preferences } from '@vben/preferences';

import { $t } from '#/locales';

import LicenseInstall from '#/views/_core/authentication/modules/license-install.vue';

const appName = computed(() => preferences.app.name);
const logo = computed(() => preferences.logo.source);
const logoDark = computed(() => preferences.logo.sourceDark);

// License 安装弹窗
const [LicenseModal, licenseModalApi] = useVbenModal({
  connectedComponent: LicenseInstall,
  destroyOnClose: true,
});

// 连续点击计数，用于隐秘触发 License 安装
const clickCount = ref(0);
let clickTimer: ReturnType<typeof setTimeout> | null = null;

function openLicenseInstall() {
  licenseModalApi.open();
}

function onLogoClick() {
  clickCount.value++;
  if (clickCount.value >= 5) {
    openLicenseInstall();
    clickCount.value = 0;
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    return;
  }
  if (clickTimer) {
    clearTimeout(clickTimer);
  }
  clickTimer = setTimeout(() => {
    clickCount.value = 0;
  }, 1500);
}

function onLicenseShortcut(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
    e.preventDefault();
    openLicenseInstall();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onLicenseShortcut);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onLicenseShortcut);
  if (clickTimer) {
    clearTimeout(clickTimer);
  }
});
</script>

<template>
  <AuthPageLayout
    :app-name="appName"
    :click-logo="onLogoClick"
    :logo="logo"
    :logo-dark="logoDark"
    :page-description="$t('authentication.pageDesc')"
    :page-title="$t('authentication.pageTitle')"
  >
    <!-- 自定义工具栏 -->
    <!-- <template #toolbar></template> -->
  </AuthPageLayout>
  <LicenseModal />
</template>
