import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          // 系统接口地址代理
          '/api/sysApi': {
            changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
            secure: false, // 如果是https接口，需要配置这个参数
            rewrite: (path) => path.replace(/^\/api\/sysApi/, ''),
            // 代理目标地址
            target: 'http://localhost:8080',
            ws: true,
          },
          // 扩展接口地址代理
          '/api/externalApi': {
            changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
            secure: false, // 如果是https接口，需要配置这个参数
            rewrite: (path) => path.replace(/^\/api\/externalApi/, ''),
            // 代理目标地址
            target: 'http://localhost:8080',
            ws: true,
          },
        },
      },
    },
  };
});
