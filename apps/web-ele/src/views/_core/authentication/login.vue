<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

// markRaw
import { computed, ref } from 'vue';

// SliderCaptcha
import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { getCaptcha, loginApi } from '#/api/core/auth';
import { getParamsByKeys } from '#/api/system/params';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
// 是否显示验证码
const showCaptcha = ref();
// 验证码长度
const captchaLength = ref(5);
// 验证码
const captchaBase64 = ref();
const captchaKey = ref();

const loginLoading = ref(false);

// 获取配置
function onConfig() {
  getParamsByKeys(['LOGIN_CAPTCHA', 'CAPTCHA_LENGTH', 'WS_URL']).then(
    (data: any) => {
      showCaptcha.value = JSON.parse(data.LOGIN_CAPTCHA);
      captchaLength.value = JSON.parse(data.CAPTCHA_LENGTH);
    },
  );
}
onConfig();
// 验证码
async function onCaptcha() {
  const data = await getCaptcha();
  captchaKey.value = data.key;
  captchaBase64.value = data.image;
}
onCaptcha();

/**
 * 异步处理登录操作
 * Asynchronously handle the login process
 * @param params 登录表单数据
 */
async function authLogin(
  params: Recordable<any>,
  onSuccess?: () => Promise<void> | void,
) {
  try {
    loginLoading.value = true;
    loginApi(params).then((res) => {
      if (res.success && res.code === 200) {
        return authStore.userByToken(
          res.data.accessToken,
          res.data.refreshToken,
          onSuccess,
        );
      } else {
        ElMessage.error(res.msg);
        onCaptcha();
      }
    });
  } finally {
    loginLoading.value = false;
  }
}

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    // 密码
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    // 验证码
    // {
    //   component: markRaw(SliderCaptcha),
    //   fieldName: 'captcha',
    //   rules: z.boolean().refine((value) => value, {
    //     message: $t('authentication.verifyRequiredTip'),
    //   }),
    // },
  ];
});
</script>

<template>
  <AuthenticationLogin
    :captcha-base64="captchaBase64"
    :captcha-key="captchaKey"
    :show-captcha="showCaptcha"
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="authLogin"
    @on-captcha="onCaptcha"
  />
</template>
