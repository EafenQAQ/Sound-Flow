<template>
  <div class="ListView">
    <div class="playlists-grid">
      <div v-for="(playlist, index) in playlists" :key="playlist.id" class="playlist-card fade-in-up"
        :style="{ 'animation-delay': `${index * 0.1}s` }">
        <RouterLink :to="{ name: 'playlistDetails', params: { id: playlist.id } }">
          <div class="single">
            <div class="thumbnail">
              <OptimizedImage :playlist="playlist" :pixel-size="'_800x800.webp'" />
              <div class="overlay">
                <span class="play-icon">▶</span>
              </div>
            </div>
            <div class="info">
              <h3>{{ playlist.title }}</h3>
              <p class="creator">创建者：{{ playlist.userName }}</p>
              <p class="songs-count">{{ playlist.songs.length }} 首歌曲</p>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import OptimizedImage from './OptimizedImage.vue';

defineProps({
  playlists: {
    type: Array,
    required: true,
  },
})


</script>

<style scoped>
.ListView {
  width: 100%;
  min-height: calc(100vh - 348px);
}

.playlists-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1rem 0;
}

@media (min-width: 640px) {
  .playlists-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .playlists-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.playlist-card {
  opacity: 0;
  animation-fill-mode: forwards;
}

.single {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.single:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}



.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.single:hover .overlay {
  opacity: 1;
}

.play-icon {
  color: white;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.info {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info h3 {
  font-weight: 700;
  font-size: 1.25rem;
  margin: 0;
  line-height: 1.3;
  color: var(--primary);
}

.creator {
  font-weight: 400;
  font-size: 0.9rem;
  color: hsl(from var(--primary) h s calc(l + 20));
  margin: 0;
}

.songs-count {
  font-weight: 300;
  font-size: 0.85rem;
  color: hsl(from var(--primary) h s calc(l + 30));
  margin: 0;
  margin-top: auto;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .playlists-grid {
    gap: 1rem;
    padding: 0.5rem 0;
  }

  .info {
    padding: 1rem;
  }

  .info h3 {
    font-size: 1.1rem;
  }
}

/* 平板端优化 */
@media (min-width: 641px) and (max-width: 1023px) {
  .playlists-grid {
    gap: 1.5rem;
  }
}

/* 加载状态 */
.playlist-card.loading {
  opacity: 0.6;
}

.playlist-card.loading .single {
  pointer-events: none;
}

.thumbnail :deep(.playlist-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.single:hover .thumbnail :deep(.playlist-image) {
  transform: scale(1.05);
}

.playlist-card.loading .thumbnail :deep(.playlist-image) {
  filter: blur(2px);
}
</style>
