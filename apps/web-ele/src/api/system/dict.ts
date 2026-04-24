import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace SystemDictApi {
  export interface SystemType {
    [key: string]: any;
    id: string;
    dictType: string;
    dictName: string;
    sort: number;
    createTime: string;
    status: 0 | 1;
  }
  export interface SystemData {
    [key: string]: any;
    id: string;
    dictTypeId: number | string;
    dictLabel: string;
    dictValue: string;
    labelClass: string;
    remark: string;
    sort: number;
    createTime: string;
  }
}

/**
 * 新建字典类型
 * @param params 参数
 */
async function createDictType(params: Recordable<any>) {
  return requestClient.post(`/${sysApi}/sys/dict/type`, params);
}

/**
 * 修改字典类型
 * @param id ID
 * @param params 参数
 */
async function updateDictType(id: number | string, params: Recordable<any>) {
  params.id = id;
  return requestClient.post(`/${sysApi}/sys/dict/type/update`, params);
}

/**
 * 获取字典列表数据
 */
async function getDictPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemDictApi.SystemType>>(
    `/${sysApi}/sys/dict/type/page`,
    {
      params,
    },
  );
}

/**
 * 删除字典类型
 * @param id ID
 */
async function deleteDictType(id: string) {
  return requestClient.post(`/${sysApi}/sys/dict/type/del`, [id]);
}
/**
 * 删除字典数据
 * @param id 字典数据ID
 */
async function deleteDictData(id: string) {
  return requestClient.post(`/${sysApi}/sys/dict/data/del`, [id]);
}

// 获取数据字典列表
async function getDictDataPage(params: Recordable<any>) {
  return requestClient.get(`/${sysApi}sys/dict/data/page`, { params });
}
async function createDictData(params: Recordable<any>) {
  return requestClient.post(`/${sysApi}/sys/dict/data`, params);
}

async function updateDictData(id: number | string, params: Recordable<any>) {
  params.id = id;
  return requestClient.post(`/${sysApi}sys/dict/data/update`, params);
}

export {
  createDictData,
  createDictType,
  deleteDictData,
  deleteDictType,
  getDictDataPage,
  getDictPage,
  updateDictData,
  updateDictType,
};
