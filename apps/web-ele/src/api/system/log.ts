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

  export interface SysErrorLog {
    id: string;
    errCode: string; // 错误代码
    msg: string; // 错误消息
    stackInfo: string; // 错误栈信息
    errTime: string; // 报错时间
    traceId: string; // 跟踪ID
    createTime: string; // 创建时间
    tenantId: string; // 租户ID
    tenantName: string; // 租户名称
    note: string; // 备注
    score: number; // 队列拥挤程度0-10
    queueSize: number; // 错误队列大小
  }
  export interface SysErrorLogPage {
    total: number; // 总条数
    list: Array<SysErrorLog>; // 日志列表
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

/**
 * 获取错误日志
 */
async function getErrorLogPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemLogApi.SysErrorLogPage>>(
    `/${sysApi}/sys/errorLog/page`,
    {
      params,
    },
  );
}

/**
 * 导出错误日志(下载)
 */
async function errorLogExport(params: Recordable<any>) {
  return requestClient.download<RequestResponse<Blob>>(
    `/${sysApi}/sys/errorLog/export`,
    {
      params,
      responseReturn: 'raw',
    },
  );
}

/**
 * 删除错误日志
 * @param ids 日志 ID
 */
async function deleteErrorLog(ids: string[]) {
  return requestClient.post(`/${sysApi}/sys/errorLog/del`, ids);
}

/**
 * 按日期删除错误日志
 */
async function deleteErrorLogByDate(date: string) {
  return requestClient.get(`/${sysApi}/sys/errorLog/deleteByDate/${date}`);
}

export {
  deleteErrorLog,
  deleteErrorLogByDate,
  deleteLoginByDate,
  deleteLoginLog,
  errorLogExport,
  getErrorLogPage,
  getLoginLogPage,
  getOpLogPage,
  loginLogExport,
  opLogExport,
};
