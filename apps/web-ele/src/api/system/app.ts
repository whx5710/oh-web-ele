import type { RequestResponse } from '@vben/request';
import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace SystemAppApi {
  export interface App {
    [key: string]: any;
    id: string;
    name: string;
    clientId: string;
    secretKey?: string;
    remark: string;
    dbStatus: 0 | 1 | 2;
  }
  export interface Func {
    id: string;
    name: string;
    isAsync: false | true;
    funcCode: string;
    remark: string;
    dbStatus: 0 | 1 | 2;
    checkedFunc: boolean;
  }
  export interface FuncAuthority {
    id: string;
    funcCode: string;
    clientId: string;
    dbStatus: 0 | 1;
  }
  export interface Log {
    id: string;
    clientId: string;
    clientName: string;
    funcCode: string;
    funcCodeName: string;
    jsonStr: string;
    resultMsg: string;
    state: string;
    createTime: string;
  }
}

/**
 * 获取客户端列表数据
 */
export async function getAppPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemAppApi.App>>(`/${sysApi}/sys/app/page`, {
    params,
  });
}

/**
 * 创建客户端
 * @param data 数据
 */
export async function createApp(data: Omit<SystemAppApi.App, 'id'>) {
  return requestClient.post(`/${sysApi}/sys/app`, data);
}

/**
 * 更新客户端
 *
 * @param id ID
 * @param data 数据
 */
export async function updateApp(
  id: string,
  data: Omit<SystemAppApi.App, 'id'>,
) {
  data.id = id;
  return requestClient.post(`/${sysApi}/sys/app/update`, data);
}

/**
 * 删除客户端
 * @param id ID
 */
export async function deleteApp(id: string) {
  return requestClient.post(`/${sysApi}/sys/app/del`, [id]);
}

export async function getAppList() {
  return requestClient.get(`/${sysApi}/sys/app/list`);
}

/**
 * 获取函数列表数据
 */
export async function getFuncPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemAppApi.Func>>(
    `/${sysApi}/sys/function/page`,
    {
      params,
    },
  );
}

/**
 * 创建接口
 * @param data 数据
 */
export async function createFunc(data: Omit<SystemAppApi.Func, 'id'>) {
  return requestClient.post(`/${sysApi}/sys/function`, data);
}
/**
 * 更新接口
 *
 * @param id ID
 * @param data 数据
 */
export async function updateFunc(id: string, data: SystemAppApi.Func) {
  data.id = id;
  return requestClient.post(`/${sysApi}/sys/function/update`, data);
}

/**
 * 删除接口
 * @param id ID
 */
export async function deleteFunc(id: string) {
  return requestClient.post(`/${sysApi}/sys/function/del`, [id]);
}

/**
 * 根据客户端获取分页数据
 */
export async function pageByClientId(params: Recordable<any>) {
  return requestClient.get<Array<SystemAppApi.Func>>(
    `/${sysApi}/sys/function/pageByClientId`,
    {
      params,
    },
  );
}
/**
 * 客户端接口授权
 */
export async function authority(params: SystemAppApi.FuncAuthority) {
  return requestClient.post(`/${sysApi}/sys/authority/make`, params);
}
/**
 * 接口请求日志
 */
export async function getLogPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemAppApi.Log>>(
    `/${sysApi}/sys/app/logPage`,
    {
      params,
    },
  );
}
// 导出日志
export async function logExport(params: Recordable<any>) {
  return requestClient.download<RequestResponse<Blob>>(
    `/${sysApi}/sys/app/logExport`,
    {
      params,
      responseReturn: 'raw',
    },
  );
}
/**
 * 删除日志
 * @param ids 日志 ID
 */
export async function deleteLog(ids: string[]) {
  return requestClient.post(`/${sysApi}/sys/app/deleteLog`, ids);
}

// 根据时间删除日志
export async function deleteByDate(date: string) {
  return requestClient.get(`/${sysApi}/sys/app/deleteByDate/${date}`);
}
// 开启监听
export async function startListener(id: string) {
  return requestClient.get(`/${sysApi}/openApi/startListener/${id}`);
}
// 关闭监听
export async function stopListener(id: string) {
  return requestClient.get(`/${sysApi}/openApi/stopListener/${id}`);
}
