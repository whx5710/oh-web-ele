import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    id: string;
    name: string;
    note?: string;
    status: 0 | 1;
  }
}

/**
 * 获取部门列表数据
 */
async function getDeptPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemDeptApi.SystemDept>>(
    `/${sysApi}/sys/dept/page`,
    {
      params,
    },
  );
}
/**
 * 获取部门树数据
 */
async function getDeptTreeList(params: Recordable<any>) {
  return requestClient.post<Array<SystemDeptApi.SystemDept>>(
    `/${sysApi}/sys/dept/list`,
    params,
  );
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function createDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.post(`/${sysApi}/sys/dept`, data);
}

/**
 * 更新部门
 *
 * @param id 部门 ID
 * @param data 部门数据
 */
async function updateDept(
  id: string,
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  data.id = id;
  return requestClient.post(`/${sysApi}/sys/dept/update`, data);
}

/**
 * 删除部门
 * @param id 部门 ID
 */
async function deleteDept(id: string) {
  return requestClient.post(`/${sysApi}/sys/dept/delById/${id}`);
}

export { createDept, deleteDept, getDeptPage, getDeptTreeList, updateDept };
