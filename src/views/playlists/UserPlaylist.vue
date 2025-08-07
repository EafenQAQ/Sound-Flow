<template>
  <div class="UserPlaylist container">
    <div class="header fade-in-up">
      <h2 v-if="documents.length && !isInitialLoading">「{{ documents[0]?.userName }}」的歌单</h2>
      <h2 v-else-if="!isInitialLoading">用户歌单</h2>
    </div>

    <!-- 初始加载状态 -->
    <div v-if="isInitialLoading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>正在加载歌单...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container fade-in-up">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <p class="error-message">{{ error }}</p>
      </div>
    </div>

    <!-- 歌单列表 -->
    <div v-else-if="documents.length" class="playlists-container fade-in-up" style="animation-delay: 0.2s">
      <ListView :playlists="documents" />
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state fade-in-up">
      <div class="empty-content">
        <span class="empty-icon">📝</span>
        <h3>还没有创建歌单</h3>
        <p>该用户还没有创建任何歌单</p>
        <RouterLink :to="{ name: 'createPlaylist' }" class="create-btn">
          创建歌单
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import getCollection from '@/composables/getCollection';
import ListView from '@/components/ListView.vue';
import { RouterLink } from 'vue-router';
import { ref, watch } from 'vue';

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
})

const { error, documents } = getCollection('playlists', props.userId)
const isInitialLoading = ref(true)

// 监听数据加载状态
watch([documents, error], () => {
  console.log('获取并筛选到的数据是：', documents.value)

  // 当数据加载完成（有数据或有错误）时，设置初始加载完成
  if (documents.value.length > 0 || error.value) {
    isInitialLoading.value = false
  } else {
    // 如果没有数据也没有错误，延迟一点时间再设置加载完成
    // 这样可以避免在数据还在加载时就显示空状态
    setTimeout(() => {
      isInitialLoading.value = false
    }, 2000)
  }
}, { immediate: true })

</script>

<style scoped>
.UserPlaylist {
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

/* 加载和错误状态 */
.loading-container,
.error-container {
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

.loading-spinner p {
  color: var(--primary);
  font-weight: 500;
  margin: 0;
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
  margin: 0;
}

/* 歌单容器 */
.playlists-container {
  opacity: 0;
  animation-fill-mode: forwards;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  opacity: 0;
  animation-fill-mode: forwards;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1.5rem;
}

.empty-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--primary);
}

.empty-content p {
  font-size: 1rem;
  color: hsl(from var(--primary) h s calc(l + 20));
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.create-btn {
  display: inline-block;
  background: var(--primary);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.create-btn:hover {
  background: hsl(from var(--primary) h s calc(l - 10));
  transform: translateY(-1px);
}

/* 移动端优化 */
@media (max-width: 640px) {
  .UserPlaylist {
    padding: 1rem 0;
  }

  .header h2 {
    font-size: 2rem;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
