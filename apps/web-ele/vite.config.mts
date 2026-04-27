import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      build: {
        rollupOptions: {
          output: {
            // 手动分割 chunk，将 BPMN 相关依赖打包到单独的 chunk
            manualChunks: {
              // BPMN 流程设计器相关依赖单独打包
              'bpmn-vendor': [
                'bpmn-js',
                'bpmn-js/lib/Modeler',
                'bpmn-js-properties-panel',
                'camunda-bpmn-moddle',
                'bpmn-js-i18n',
                '@bpmn-io/properties-panel',
              ],
            },
            // 自定义 chunk 文件命名规则
            chunkFileNames: (chunkInfo) => {
              const name = chunkInfo.name;
              // BPMN 相关 chunk 使用特定前缀，便于识别
              if (name === 'bpmn-vendor' || name?.includes('bpmn')) {
                return 'js/bpmn/[name]-[hash].js';
              }
              return 'js/[name]-[hash].js';
            },
          },
        },
      },
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
