import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace SystemTenantApi {
  export interface SystemTenant {
    [key: string]: any;
    id: string;
    tenantId: string;
    tenantName: string;
    note: string;
    status: 0 | 1;
  }
}

/**
 * 获取租户列表数据
 */
async function getTenantPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemTenantApi.SystemTenant>>(
    `/${sysApi}/tenant/member/page`,
    {
      params,
    },
  );
}

/**
 * 创建租户
 * @param data 数据
 */
async function createTenant(data: Omit<SystemTenantApi.SystemTenant, 'id'>) {
  return requestClient.post(`/${sysApi}/tenant/member/save`, data);
}

/**
 * 更新租户
 *
 * @param id 租户 ID
 * @param data 数据
 */
async function updateTenant(
  id: string,
  data: Omit<SystemTenantApi.SystemTenant, 'id'>,
) {
  data.id = id;
  return requestClient.post(`/${sysApi}/tenant/member/update`, data);
}

/**
 * 删除租户
 * @param id 租户 ID
 */
async function deleteTenant(id: string) {
  return requestClient.post(`/${sysApi}/tenant/member/delById/${id}`);
}

export { createTenant, deleteTenant, getTenantPage, updateTenant };
