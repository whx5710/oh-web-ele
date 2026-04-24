import type { RequestResponse } from '@vben/request';
import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace SystemLogApi {
  export interface SysLoginLog {
    id: string;
    username: string;
    ip: string;
    address: string;
    userAgent: string;
    status: number;
    statusLabel: string;
    operation: number;
    operationLabel: string;
    createTime: string;
  }
  export interface SysOpLog {
    id: string;
    userId: string;
    realName: string;
    module: string;
    name: string; // 操作名
    reqUri: string;
    reqMethod: string;
    reqParams: string;
    ip: string;
    address: string;
    userAgent: string;
    operateType: string; // 操作类型
    duration: number; // 执行时长
    status: number; // 操作状态
    resultMsg: string; // 返回消息
    createTime: string;
  }
}

/**
 * 获取登录日志
 */
async function getLoginLogPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemLogApi.SysLoginLog>>(
    `/${sysApi}/sys/log/login/page`,
    {
      params,
    },
  );
}

/**
 * 导出登录日志(下载)
 */
async function loginLogExport(params: Recordable<any>) {
  return requestClient.download<RequestResponse<Blob>>(
    `/${sysApi}/sys/log/login/export`,
    {
      params,
      responseReturn: 'raw',
    },
  );
}

/**
 * 获取操作日志
 */
async function getOpLogPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemLogApi.SysOpLog>>(
    `/${sysApi}/sys/log/operate/page`,
    {
      params,
    },
  );
}

/**
 * 导出操作日志(下载)
 */
async function opLogExport(params: Recordable<any>) {
  return requestClient.download<RequestResponse<Blob>>(
    `/${sysApi}/sys/log/operate/export`,
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
async function deleteLoginLog(ids: string[]) {
  return requestClient.post(`/${sysApi}/sys/log/login/del`, ids);
}

// 按日期删除登录日志
async function deleteLoginByDate(date: string) {
  return requestClient.get(`/${sysApi}/sys/log/login/deleteByDate/${date}`);
}

export {
  deleteLoginByDate,
  deleteLoginLog,
  getLoginLogPage,
  getOpLogPage,
  loginLogExport,
  opLogExport,
};
