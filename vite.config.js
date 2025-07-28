import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), visualizer({ open: true, filename: 'bundle-report.html' })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 在这里添加对chunks的配置
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 将vue相关的库分到一起
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vendor-vue'
            }

            // firebase自己一桌
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            // 其他
            return 'vendor'
          }
        },
      },
    },
  },
})
