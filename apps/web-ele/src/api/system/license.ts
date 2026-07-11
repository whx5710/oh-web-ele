import { requestClient } from '#/api/request';
import { sysApi } from '#/config/env';

export namespace LicenseApi {
  export interface LicenseInfo {
    /** 过期时间 */
    expireAt?: string;
    /** 签发时间 */
    issuedAt?: string;
    /** 绑定机器码，为空表示不绑定 */
    machineCode?: string;
    /** 最大在线用户数，0 或不填表示不限制 */
    maxUsers?: number;
    /** 授权模块列表 */
    modules?: string[];
    /** 数字签名 */
    signature?: string;
    /** 授权主体（客户标识） */
    subject?: string;
  }

  export interface InstallResult {
    code?: number;
    msg?: string;
    success?: boolean;
  }
}

/**
 * 获取当前 License 授权信息
 */
export async function getLicenseInfo() {
  return requestClient.get<LicenseApi.LicenseInfo>(`/${sysApi}/license/info`, {
    responseReturn: 'body',
  });
}

/**
 * 安装 License 证书
 * @param data License JSON 对象
 */
export async function installLicense(data: Record<string, any>) {
  return requestClient.post<LicenseApi.InstallResult>(
    `/${sysApi}/license/install`,
    data,
    {
      responseReturn: 'body',
    },
  );
}
