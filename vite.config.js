import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    plugins: [
      vue(),
      // 仅开发环境启用
      isDev && vueDevTools(),
      // 生产构建不生成报告
      isDev && visualizer({ open: true, filename: 'bundle-report.html' }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    esbuild: {
      drop: isDev ? [] : ['console'],
    },
    build: {
      rollupOptions: {
        output: {
          // 在这里添加对chunks的配置
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
                return 'vendor-vue'
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase'
              }
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
