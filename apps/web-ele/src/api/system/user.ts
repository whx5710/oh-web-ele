import type { RequestResponse } from '@vben/request';
import type { Recordable, UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace SystemUserApi {
  export interface SystemUser {
    id: string;
    status: 0 | 1;
    createTime: string;
    email: string;
    gender: 0 | 1 | 2;
    mobile: string;
    deptId: string;
    deptName: string;
    realName: string;
    superAdmin: 0 | 1;
    tenantId: string;
    userKey: string;
    username: string;
    roleIdList: string[];
    postIdList: string[];
  }
  export interface UserToken {
    id: string;
    username: string;
    realName: string;
    accessToken: string;
    loginTime: string;
  }
}

/**
 * 创建用户
 * @param data 用户数据
 */
export async function createUser(data: Omit<Recordable<any>, 'id'>) {
  return requestClient.post(`/${sysApi}/sys/user`, data);
}

/**
 * 更新用户
 *
 * @param id 用户 ID
 * @param data 用户数据
 */
export async function updateUser(id: string, data: Recordable<any>) {
  data.id = id;
  return requestClient.post(`/${sysApi}/sys/user/update`, data);
}

/**
 * 删除用户
 *
 * @param id 用户 ID
 */
export async function deleteUser(id: string) {
  const data = [id];
  return requestClient.post(`/${sysApi}/sys/user/del`, data);
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>(`/${sysApi}/sys/user/info`);
}

/**
 * 根据用户ID获取用户信息
 */
export async function getUserById(userId: number | string) {
  return requestClient.get<SystemUserApi.SystemUser>(
    `/${sysApi}/sys/user/${userId}`,
  );
}
/**
 * 获取用户列表数据
 */
export async function getUserPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    `/${sysApi}/sys/user/page`,
    {
      params,
    },
  );
}

/**
 * 获取用户列表数据
 */
export async function pageByRole(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    `/${sysApi}/sys/user/pageByRole`,
    {
      params,
    },
  );
}

/**
 * 绑定租户的管理用户
 * @param tenantId 租户ID
 */
export async function bindTenantUser(tenantId: string, userIdList: string[]) {
  return requestClient.post(
    `/${sysApi}/sys/user/bindTenantUser/${tenantId}`,
    userIdList
  );
}

/**
 * 解绑租户的管理用户
 * @param tenantId 租户ID
 */
export async function unBindTenantUser(tenantId: string, userIdList: string[]) {
  return requestClient.post(
    `/${sysApi}/sys/user/unBindTenantUser/${tenantId}`,
    userIdList
  );
}

/**
 * 导出用户(下载)
 */
export async function userExport(params: Recordable<any>) {
  return requestClient.download<RequestResponse<Blob>>(
    `/${sysApi}/sys/user/export`,
    {
      params,
      responseReturn: 'raw',
    },
  );
}
/**
 * 在线用户
 * @param params 参数
 * @returns l
 */
export async function onlineUserPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    `/${sysApi}/monitor/user/page`,
    {
      params,
    },
  );
}
/**
 * 下线用户所有token
 * @returns l
 */
export async function forceLogoutAll(userId: string) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    `/${sysApi}/monitor/user/forceLogoutAll/${userId}`,
  );
}
/**
 * 下线token
 * @returns l
 */
export async function forceLogout(accessToken: string) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    `/${sysApi}/monitor/user/forceLogout/${accessToken}`,
  );
}
/**
 * 用户token列表
 * @param userId 用户ID
 * @returns s
 */
export async function tokenList(userId: string) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    `/${sysApi}/monitor/user/tokenList/${userId}`,
  );
}
