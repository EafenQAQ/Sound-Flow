import '../src/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initAuthListener } from '@/composables/getUser'

// 初始化认证监听器
initAuthListener()

createApp(App).use(createPinia()).use(router).mount('#app')
