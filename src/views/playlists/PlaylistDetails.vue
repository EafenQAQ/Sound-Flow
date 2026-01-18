<template>
  <div class="playlist-details container">
    <div v-if="error" class="error">{{ error }}</div>

    <template v-else-if="document">
      <div class="content-wrapper">
        <div class="profile fade-in-up">
          <div class="cover-container">
            <OptimizedImage :playlist="document" :pixel-size="'_800x800.webp'" :preload="true" />
          </div>
          <div class="info-container">
            <h2 class="title">{{ document.title }}</h2>
            <p @click="gotoUserPlaylist" class="created-by">{{ document.userName }}</p>
            <p class="description" v-if="document.description">{{ document.description }}</p>
            <div class="stats">
              <span class="song-count">{{ document.songs.length }} 首歌曲</span>
            </div>
          </div>
        </div>

        <div class="songs-section fade-in-up" style="animation-delay: 0.2s">
          <h3 class="section-title">歌曲列表</h3>
          <div class="songs-list">
            <div class="no-songs" v-if="!document.songs.length">
              <div class="empty-state">
                <span class="empty-icon">🎵</span>
                <p>还没有歌曲哦~赶快添加吧</p>
              </div>
            </div>
            <div v-else class="songs-grid">
              <div v-for="(song, index) in document.songs" :key="song.id" class="song-item fade-in-up"
                :style="{ 'animation-delay': `${0.3 + index * 0.05}s` }">
                <div class="song-info">
                  <h4 class="song-title">{{ song.title }}</h4>
                  <p class="song-artist">{{ song.artist }}</p>
                </div>
                <div class="song-actions">
                  <button @click="handlePlay(index)" class="play-btn">▶</button>
                </div>
              </div>
            </div>
            <AddSongs v-if="user?.uid === document.userId" :document="document" class="add-songs-component" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import AddSongs from '@/components/AddSongs.vue'
import OptimizedImage from '@/components/OptimizedImage.vue'
import getDocument from '@/composables/getDocument'
import { getUser } from '@/composables/getUser'
import { usePlayerStore } from '@/stores/player'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const { user } = getUser()
const { error, document } = getDocument('playlists', props.id)
const router = useRouter()

// 跳转到用户歌单页面
const gotoUserPlaylist = () => {
  router.push({ name: 'userPlaylist', params: { userId: document.value.userId } })
}

// 将歌单数据注入Pinia

const playerStore = usePlayerStore()
watch(
  document,
  (newDoc) => {
    playerStore.initPlaylist(newDoc)
  },
  { immediate: true },
)

// 播放歌曲
const handlePlay = (index) => {
  playerStore.playSong(index)
}
</script>

<style scoped>
.playlist-details {
  padding: 2rem 0;
  min-height: 100vh;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

@media (min-width: 1024px) {
  .content-wrapper {
    flex-direction: row;
    gap: 4rem;
  }
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .profile {
    flex-direction: row;
    text-align: left;
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .profile {
    flex-direction: column;
    text-align: center;
    max-width: 400px;
  }
}

.cover-container {
  flex-shrink: 0;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .cover-container {
    margin-bottom: 0;
  }
}

@media (min-width: 1024px) {
  .cover-container {
    margin-bottom: 1.5rem;
  }
}

.cover-container img {
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

@media (min-width: 640px) {
  .cover-container img {
    width: 300px;
    height: 300px;
  }
}

@media (min-width: 1024px) {
  .cover-container img {
    width: 350px;
    height: 350px;
  }
}

.info-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--primary);
  line-height: 1.2;
}

@media (min-width: 640px) {
  .title {
    font-size: 2.25rem;
  }
}

.created-by {
  font-size: 1rem;
  color: hsl(from var(--primary) h s calc(l + 20));
  transition: all 0.2s ease;
  cursor: pointer;
  margin: 0;
  display: inline-block;
}

.created-by:hover {
  color: var(--primary);
  transform: scale(1.02);
}

.description {
  font-size: 0.95rem;
  color: hsl(from var(--primary) h s calc(l + 10));
  line-height: 1.5;
  margin: 0;
}

.stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.song-count {
  background: var(--secondary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--primary);
  margin: 0 auto;
}

.songs-section {
  flex-grow: 1;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: var(--primary);
}

.songs-list {
  width: 100%;
}

.no-songs {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.empty-state {
  text-align: center;
  opacity: 0.6;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.1rem;
  color: var(--primary);
  margin: 0;
}

.songs-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.song-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  opacity: 0;
  animation-fill-mode: forwards;
}

.song-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.song-info {
  flex-grow: 1;
}

.song-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--primary);
}

.song-artist {
  font-size: 0.875rem;
  color: hsl(from var(--primary) h s calc(l + 20));
  margin: 0;
}

.song-actions {
  flex-shrink: 0;
}

.play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.play-btn:hover {
  background: hsl(from var(--primary) h s calc(l - 10));
  transform: scale(1.05);
}

.add-songs-component {
  margin-top: 2rem;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .playlist-details {
    padding: 1rem 0;
  }

  .content-wrapper {
    gap: 2rem;
  }

  .song-item {
    padding: 0.75rem 1rem;
  }

  .song-title {
    font-size: 0.9rem;
  }

  .song-artist {
    font-size: 0.8rem;
  }

  .play-btn {
    width: 36px;
    height: 36px;
    font-size: 0.75rem;
  }
}
</style>
