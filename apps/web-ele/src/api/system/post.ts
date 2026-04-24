import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace SystemPostApi {
  export interface SystemPost {
    [key: string]: any;
    id: string;
    postCode: string;
    postName: string;
    sort: number;
    menuIdList: string[];
    tenantId: string;
    tenantName: string;
    createTime: string;
    status: 0 | 1;
  }
}

/**
 * 获取岗位列表数据
 */
async function getPostPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemPostApi.SystemPost>>(
    `/${sysApi}/sys/post/page`,
    {
      params,
    },
  );
}
/**
 * 获取岗位列表数据
 */
async function getPostList() {
  return requestClient.get(`/${sysApi}/sys/post/list`);
}

/**
 * 创建岗位信息
 * @param data 角色数据
 */
async function createPost(data: Omit<SystemPostApi.SystemPost, 'id'>) {
  return requestClient.post(`/${sysApi}/sys/post`, data);
}

/**
 * 更新岗位
 *
 * @param id 岗位ID
 * @param data 岗位数据
 */
async function updatePost(
  id: string,
  data: Omit<SystemPostApi.SystemPost, 'id'>,
) {
  data.id = id;
  return requestClient.post(`/${sysApi}/sys/post/update`, data);
}

/**
 * 删除岗位
 * @param id 岗位 ID
 */
async function deletePost(id: string) {
  return requestClient.post(`/${sysApi}/sys/post/del`, [id]);
}

export { createPost, deletePost, getPostList, getPostPage, updatePost };
