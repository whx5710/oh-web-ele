import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace SystemParamsApi {
  export interface SystemParam {
    [key: string]: any;
    id: string;
    paramName: string;
    paramKey: string;
    paramValue: string;
    paramType: 0 | 1;
    remark?: string;
  }
}

/**
 * 获取参数列表数据
 */
async function getParamsPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemParamsApi.SystemParam>>(
    `/${sysApi}/sys/params/page`,
    {
      params,
    },
  );
}

/**
 * 新建参数
 * @param data 参数数据
 */
async function createParams(data: Omit<SystemParamsApi.SystemParam, 'id'>) {
  return requestClient.post(`/${sysApi}/sys/params`, data);
}

/**
 * 更新参数
 *
 * @param id 参数 ID
 * @param data 角色数据
 */
async function updateParams(
  id: string,
  data: Omit<SystemParamsApi.SystemParam, 'id'>,
) {
  data.id = id;
  return requestClient.post(`/${sysApi}/sys/params/update`, data);
}

/**
 * 删除参数
 * @param id 参数 ID
 */
async function deleteParams(id: string) {
  return requestClient.post(`/${sysApi}/sys/params/delById/${id}`);
}

/**
 * 获取多个参数
 * @param keys 参数数据
 */
async function getParamsByKeys(keys: string[]) {
  return requestClient.post(`/${sysApi}/sys/params/getByKeys`, keys);
}

export {
  createParams,
  deleteParams,
  getParamsByKeys,
  getParamsPage,
  updateParams,
};
