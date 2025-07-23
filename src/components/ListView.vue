<template>
  <div class="ListView" v-for="playlist in playlists" :key="playlist.id">
    <RouterLink :to="{ name: 'playlistDetails', params: { id: playlist.id } }">
      <div class="single">
        <div class="thumbnail">
          <img :src="playlist.coverUrl" alt="封面加载失败">
        </div>
        <div class="info">
          <h3>{{ playlist.title }}</h3>
          <p>创建者：{{ playlist.userName }}</p>
        </div>
        <!-- 歌曲数量 -->
        <p class="songs-number">{{ playlist.songs.length }}</p>
      </div>
    </RouterLink>
  </div>
</template>

<script setup>
const props = defineProps({
  playlists: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.thumbnail img {

  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.single {
  display: flex;
  align-items: center;
  gap: 2rem;
  border-bottom: 1px solid var(--secondary);
  padding: 2rem 2rem;
  cursor: pointer;
  /* 阴影 */
  box-shadow: 1px 1px 12px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  margin: 1rem 0;
  transition: all 0.2s ease;
}

.single:hover {

  transition: all 0.2s ease;
  transform: scale(1.02)
}

.songs-number {
  margin-left: auto;
}

h3 {
  font-weight: 700;
  font-size: 1.5rem;
}

.single p {
  font-weight: 300;
  font-size: 0.9rem;
}
</style>
