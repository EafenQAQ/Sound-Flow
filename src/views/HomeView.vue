<template>
  <div id="HomeView" class="container">
    <div class="header fade-in-up">
      <h2>歌单广场</h2>
      <p class="subtitle">发现精彩音乐，分享美好时光</p>
    </div>



    <div v-if="!playlists.length && !error" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>正在加载歌单...</p>
      </div>
    </div>

    <!-- 歌单列表 -->
    <div v-else-if="playlists.length" class="playlists-container fade-in-up" style="animation-delay: 0.2s">
      <ListView :playlists="playlists" />
    </div>
    <!-- 错误状态 -->
    <div v-if="error" class="error-container fade-in-up">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <p class="error-message">{{ error }}</p>
        <button @click="retryLoad" class="retry-btn">重试</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import ListView from '@/components/ListView.vue';
import getCollection from '@/composables/getCollection';
import { onMounted } from 'vue';



const { error, documents: playlists, startFirebaseListener } = getCollection('playlists')



// 重试加载函数
const retryLoad = () => {
  window.location.reload()
}

onMounted(async () => {
  await startFirebaseListener()
}
)
</script>

<style scoped>
#HomeView {
  padding: 2rem 0;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--primary);
}

.subtitle {
  font-size: 1.1rem;
  color: hsl(from var(--primary) h s calc(l + 20));
  margin: 0;
}

@media (max-width: 640px) {
  .header h2 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--secondary);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-spinner p {
  color: hsl(from var(--primary) h s calc(l + 20));
  font-size: 1rem;
  margin: 0;
}

.playlists-container {
  opacity: 0;
  animation-fill-mode: forwards;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  opacity: 0;
  animation-fill-mode: forwards;
}

.error-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.error-message {
  color: var(--warning);
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.retry-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: hsl(from var(--primary) h s calc(l - 10));
  transform: translateY(-1px);
}
</style>
