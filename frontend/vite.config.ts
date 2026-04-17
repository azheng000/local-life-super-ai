import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    // API代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // 重写路径，去掉/api前缀
        rewrite: (path) => path,
        // 开发环境日志
        logLevel: 'debug',
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  // 环境变量
  envDir: './',
  envPrefix: 'VITE_',
})
