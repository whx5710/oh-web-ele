import { useAccessStore } from '@vben/stores';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    refreshToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<any>(`/${sysApi}/sys/auth/login`, data, {
    responseReturn: 'body',
  });
}

/**
 * 验证码
 */
export async function getCaptcha() {
  return requestClient.get(`/${sysApi}/sys/auth/captcha`);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  const accessStore = useAccessStore();
  return requestClient.post<AuthApi.LoginResult>(
    `/${sysApi}/sys/auth/refresh?refreshToken=${accessStore.refreshToken}`,
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  const accessStore = useAccessStore();
  return requestClient.post(
    `/${sysApi}/sys/auth/logout?refreshToken=${accessStore.refreshToken}`,
    {
      withCredentials: true,
    },
  );
}

// 手工点击退出
export async function handleLogoutApi() {
  const accessStore = useAccessStore();
  return requestClient.post(
    `/${sysApi}/sys/auth/logout?refreshToken=${accessStore.refreshToken}`,
    {
      withCredentials: true,
    },
  );
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>(`/${sysApi}/sys/menu/authority`);
}
