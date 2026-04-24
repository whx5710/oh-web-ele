import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace SystemAttachApi {
  export interface SysAttach {
    id: string;
    name: string;
    url: string;
    size: number;
    platform: string;
    createTime: string;
  }
}

/**
 * 获取附件列表数据
 */
async function getAttachPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemAttachApi.SysAttach>>(
    `/${sysApi}/sys/attachment/page`,
    {
      params,
    },
  );
}

/**
 * 删除附件
 * @param ids 附件 ID
 */
async function deleteAttach(ids: string[]) {
  return requestClient.post(`/${sysApi}/sys/attachment/del`, ids);
}
export { deleteAttach, getAttachPage };
