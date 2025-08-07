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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 将 Firebase 核心和各服务进一步细分
            if (id.includes('firebase/app') || id.includes('@firebase/app')) {
              return 'firebase-core'
            }
            if (id.includes('firebase/auth') || id.includes('@firebase/auth')) {
              return 'firebase-auth'
            }
            if (id.includes('firebase/firestore') || id.includes('@firebase/firestore')) {
              return 'firebase-firestore'
            }
            if (id.includes('firebase/storage') || id.includes('@firebase/storage')) {
              return 'firebase-storage'
            }

            // Vue 相关
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vendor-vue'
            }

            // 其他第三方库
            return 'vendor'
          }
        },
      },
    },
  },
})
