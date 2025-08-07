<template>
  <div class="UserPlaylist">
    <!-- 初始加载状态 -->
    <div v-if="isInitialLoading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>正在加载歌单...</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!documents.length" class="empty-state fade-in-up">
      <div class="empty-content">
        <span class="empty-icon">📝</span>
        <h3>还没有创建歌单</h3>
        <p>创建你的第一个歌单，开始音乐之旅吧！</p>
        <RouterLink :to="{ name: 'createPlaylist' }" class="create-btn">
          创建歌单
        </RouterLink>
      </div>
    </div>

    <h2 v-if="documents.length">「{{ documents[0]?.userName }}」的歌单</h2>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="documents.length" class="playlists-container">
      <ListView :playlists="documents" />
    </div>
  </div>
</template>

<script setup>
import getCollection from '@/composables/getCollection';
import ListView from '@/components/ListView.vue';
import { onMounted, onUpdated, watch, ref } from 'vue';
const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
})

// 添加初始加载状态
const isInitialLoading = ref(true)

const { error, documents, startFirebaseListener } = getCollection('playlists', props.userId)

watch(documents, () => {
  console.log('获取并筛选到的数据是：', documents.value)
})

// 监听数据加载完成
watch([documents, error], () => {
  if (documents.value.length > 0 || error.value) {
    isInitialLoading.value = false
  } else {
    setTimeout(() => {
      isInitialLoading.value = false
    }, 2000)
  }
}, { immediate: true })

onUpdated(() => {
  if (!documents.value.length) {
    error.value = '该用户还没有创建歌单'
  }
})

onMounted(async () => {
  await startFirebaseListener()
})
</script>

<style scoped>
h2 {
  margin: 2rem 0;
}
</style>
