<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useAppConfig } from '@vben/hooks';
import {
  QrCode,
  Smartphone,
  SvgGithubIcon,
  SvgGoogleIcon,
  SvgQQChatIcon,
  SvgWeChatIcon,
} from '@vben/icons';
import { $t } from '@vben/locales';

import { VbenIconButton } from '@vben-core/shadcn-ui';

import DingdingLogin from './dingding-login.vue';

interface Props {
  codeLoginPath?: string;
  qrCodeLoginPath?: string;
  showCodeLogin?: boolean;
  showQrcodeLogin?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  codeLoginPath: '/auth/code-login',
  qrCodeLoginPath: '/auth/qrcode-login',
  showCodeLogin: true,
  showQrcodeLogin: true,
});

const router = useRouter();

function handleGo(path: string) {
  router.push(path);
}

const {
  auth: { dingding: dingdingAuthConfig },
} = useAppConfig(import.meta.env, import.meta.env.PROD);
</script>

<template>
  <div class="w-full sm:mx-auto md:max-w-md">
    <div class="mt-6 flex items-center justify-between">
      <span class="w-[30%] border-b border-input dark:border-gray-600"></span>
      <span class="text-center text-xs text-muted-foreground uppercase">
        {{ $t('authentication.thirdPartyLogin') }}
      </span>
      <span class="w-[30%] border-b border-input dark:border-gray-600"></span>
    </div>

    <div class="mt-4 flex flex-wrap justify-center gap-3">
      <VbenIconButton
        :tooltip="$t('authentication.wechatLogin')"
        tooltip-side="top"
      >
        <SvgWeChatIcon />
      </VbenIconButton>
      <VbenIconButton
        :tooltip="$t('authentication.qqLogin')"
        tooltip-side="top"
      >
        <SvgQQChatIcon />
      </VbenIconButton>
      <VbenIconButton
        :tooltip="$t('authentication.githubLogin')"
        tooltip-side="top"
      >
        <SvgGithubIcon />
      </VbenIconButton>
      <VbenIconButton
        :tooltip="$t('authentication.googleLogin')"
        tooltip-side="top"
      >
        <SvgGoogleIcon />
      </VbenIconButton>
      <DingdingLogin
        v-if="dingdingAuthConfig"
        :corp-id="dingdingAuthConfig.corpId"
        :client-id="dingdingAuthConfig.clientId"
      />
      <VbenIconButton
        v-if="showCodeLogin"
        :tooltip="$t('authentication.mobileLogin')"
        tooltip-side="top"
        @click="handleGo(codeLoginPath)"
      >
        <Smartphone class="size-5" />
      </VbenIconButton>
      <VbenIconButton
        v-if="showQrcodeLogin"
        :tooltip="$t('authentication.qrcodeLogin')"
        tooltip-side="top"
        @click="handleGo(qrCodeLoginPath)"
      >
        <QrCode class="size-5" />
      </VbenIconButton>
    </div>
  </div>
</template>
