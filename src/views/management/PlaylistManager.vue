<template>
  <div id="PlaylistManager" class="container">
    <div class="header fade-in-up">
      <h2>歌单管理</h2>
      <p class="subtitle">管理你创建的歌单和歌曲</p>
    </div>

    <!-- 初始加载状态 -->
    <div v-if="isInitialLoading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>正在加载你的歌单...</p>
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
    <div v-else-if="userPlaylists.length" class="playlists-section fade-in-up" style="animation-delay: 0.2s"
      :class="{ reloading: isReloading }">
      <!-- 批量操作工具栏 -->
      <div class="toolbar">
        <div class="selection-info">
          <div class="select-all-container">
            <div class="select-all-checkbox" @click="toggleSelectAll">
              <input type="checkbox" :checked="isAllSelected" @change.stop="toggleSelectAll" />
              <span class="checkmark"></span>
              <span class="checkbox-label">全选 ({{ selectedPlaylists.length }}/{{ userPlaylists.length }})</span>
            </div>
          </div>
        </div>

        <div class="batch-actions">
          <button v-if="selectedPlaylists.length > 0" @click="showBatchDeleteModal = true" class="batch-delete-btn"
            :disabled="deleteLoading">
            <span class="icon">🗑️</span>
            批量删除 ({{ selectedPlaylists.length }})
          </button>
        </div>
      </div>

      <!-- 重新加载指示器 -->
      <div v-if="isReloading" class="reload-overlay">
        <div class="reload-spinner">
          <div class="spinner"></div>
          <p>正在更新数据...</p>
        </div>
      </div>

      <!-- 歌单网格 -->
      <div class="playlists-grid">
        <div v-for="(playlist, index) in userPlaylists" :key="playlist.id" class="playlist-card fade-in-up"
          :style="{ 'animation-delay': `${0.3 + index * 0.05}s` }">
          <!-- 选择框 -->
          <div class="card-checkbox">
            <label class="checkbox-container">
              <input type="checkbox" :value="playlist.id" v-model="selectedPlaylists" />
              <span class="checkmark"></span>
            </label>
          </div>

          <!-- 歌单内容 -->
          <div class="playlist-content">
            <div class="thumbnail">
              <img :src="playlist.coverUrl" :alt="playlist.title" loading="lazy" />
              <div class="overlay">
                <RouterLink :to="{ name: 'playlistDetails', params: { id: playlist.id } }" class="view-link">
                  <span class="view-icon">{{ playlist.title }}</span>
                </RouterLink>
              </div>
            </div>

            <div class="playlist-info">
              <h3 class="playlist-title">{{ playlist.title }}</h3>
              <p class="playlist-description">{{ playlist.description }}</p>
              <div class="playlist-stats">
                <span class="songs-count">{{ playlist.songs.length }} 首歌曲</span>
                <span class="created-date">{{ formatDate(playlist.createdAt) }}</span>
              </div>
            </div>

            <!-- 歌单操作按钮 -->
            <div class="playlist-actions">
              <button @click="openSongManager(playlist)" class="manage-songs-btn">管理歌曲</button>
              <button @click="deleteSinglePlaylist(playlist)" class="delete-btn" :disabled="deleteLoading">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state fade-in-up">
      <div class="empty-content">
        <span class="empty-icon">📝</span>
        <h3>还没有创建歌单</h3>
        <p>创建你的第一个歌单，开始音乐之旅吧！</p>
        <RouterLink :to="{ name: 'createPlaylist' }" class="create-btn"> 创建歌单 </RouterLink>
      </div>
    </div>

    <!-- 批量删除确认模态框 -->
    <div v-if="showBatchDeleteModal" class="modal-overlay" @click="showBatchDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3>确认批量删除</h3>
        <p>你确定要删除选中的 {{ selectedPlaylists.length }} 个歌单吗？</p>
        <p class="warning-text">⚠️ 此操作不可撤销，歌单中的所有歌曲也将被删除。</p>
        <div class="modal-actions">
          <button @click="showBatchDeleteModal = false" class="cancel-btn">取消</button>
          <button @click="confirmBatchDelete" class="confirm-delete-btn" :disabled="deleteLoading">
            <span v-if="deleteLoading" class="loading-spinner-small"></span>
            {{ deleteLoading ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 歌曲管理模态框 -->
    <div v-if="showSongManager" class="modal-overlay" @click="closeSongManager">
      <div class="modal-content song-manager-modal" @click.stop>
        <div class="modal-header">
          <h3>管理歌曲 - {{ currentPlaylist?.title }}</h3>
          <button @click="closeSongManager" class="close-btn">×</button>
        </div>

        <div class="song-manager-content">
          <div v-if="!currentPlaylist?.songs?.length" class="no-songs">
            <p>这个歌单还没有歌曲</p>
          </div>

          <div v-else class="songs-list">
            <!-- 歌曲批量操作 -->
            <div class="songs-toolbar">
              <div class="select-all-container">
                <div class="select-all-checkbox" @click="toggleSelectAllSongs">
                  <input type="checkbox" :checked="isAllSongsSelected" @change.stop="toggleSelectAllSongs" />
                  <span class="checkmark"></span>
                  <span class="checkbox-label">全选歌曲 ({{ selectedSongs.length }}/{{ currentPlaylist.songs.length
                    }})</span>
                </div>
              </div>

              <button v-if="selectedSongs.length > 0" @click="batchDeleteSongs" class="batch-delete-songs-btn"
                :disabled="deleteLoading">
                删除选中 ({{ selectedSongs.length }})
              </button>
            </div>

            <!-- 歌曲列表 -->
            <div class="songs-grid">
              <div v-for="song in currentPlaylist.songs" :key="song.id" class="song-item">
                <label class="checkbox-container">
                  <input type="checkbox" :value="song.id" v-model="selectedSongs" />
                  <span class="checkmark"></span>
                </label>

                <div class="song-info">
                  <h4 class="song-title">{{ song.title }}</h4>
                  <p class="song-artist">{{ song.artist }}</p>
                </div>

                <button @click="deleteSingleSong(song)" class="delete-song-btn" :disabled="deleteLoading">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <Transition name="fade">
      <div v-if="successMessage" class="success-toast">
        {{ successMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { getUser } from '@/composables/getUser'
import getCollection from '@/composables/getCollection'
import useDelete from '@/composables/useDelete'

// 用户状态
const { user } = getUser()

// 获取用户的歌单
const {
  error,
  documents: userPlaylists,
} = getCollection('playlists', user.value?.id)

// 删除功能
const {
  error: deleteError,
  isPending: deleteLoading,
  deletePlaylist,
  batchDeletePlaylists,
  deleteSong: deleteSongWithStorage,
  batchDeleteSongs: batchDeleteSongsWithStorage,
} = useDelete()

// 组件状态
const selectedPlaylists = ref([])
const selectedSongs = ref([])
const showBatchDeleteModal = ref(false)
const showSongManager = ref(false)
const currentPlaylist = ref(null)
const successMessage = ref('')
const isReloading = ref(false)
const isInitialLoading = ref(true)

// 计算属性
const isAllSelected = computed(() => {
  return (
    userPlaylists.value.length > 0 && selectedPlaylists.value.length === userPlaylists.value.length
  )
})

const isAllSongsSelected = computed(() => {
  return (
    currentPlaylist.value?.songs?.length > 0 &&
    selectedSongs.value.length === currentPlaylist.value.songs.length
  )
})

// 权限检查函数
const canManagePlaylist = (playlist) => {
  return user.value && playlist.userId === user.value.id
}

// 重新加载数据的包装函数
const reloadData = async () => {
  isReloading.value = true
  // 实时订阅会自动更新 documents，这里只需短暂显示加载状态
  setTimeout(() => {
    isReloading.value = false
  }, 500)
}

// 全选/取消全选歌单
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedPlaylists.value = []
  } else {
    selectedPlaylists.value = userPlaylists.value
      .filter((playlist) => canManagePlaylist(playlist))
      .map((playlist) => playlist.id)
  }
}

// 全选/取消全选歌曲
const toggleSelectAllSongs = () => {
  if (isAllSongsSelected.value) {
    selectedSongs.value = []
  } else {
    selectedSongs.value = currentPlaylist.value.songs.map((song) => song.id)
  }
}

// 删除单个歌单
const deleteSinglePlaylist = async (playlist) => {
  if (!canManagePlaylist(playlist)) {
    showMessage('你只能删除自己创建的歌单', 'error')
    return
  }

  if (confirm(`确定要删除歌单"${playlist.title}"吗？此操作不可撤销。`)) {
    const success = await deletePlaylist(playlist)
    if (success) {
      showMessage('歌单删除成功')
      // 从选中列表中移除
      selectedPlaylists.value = selectedPlaylists.value.filter((id) => id !== playlist.id)
      // 重新加载数据以显示最新结果
      await reloadData()
    } else {
      showMessage(deleteError.value || '删除失败', 'error')
    }
  }
}

// 批量删除歌单
const confirmBatchDelete = async () => {
  const playlistsToDelete = userPlaylists.value.filter(
    (playlist) => selectedPlaylists.value.includes(playlist.id) && canManagePlaylist(playlist),
  )

  if (playlistsToDelete.length === 0) {
    showMessage('没有可删除的歌单', 'error')
    return
  }

  const success = await batchDeletePlaylists(playlistsToDelete)
  if (success) {
    showMessage(`成功删除 ${playlistsToDelete.length} 个歌单`)
    selectedPlaylists.value = []
    showBatchDeleteModal.value = false
    // 重新加载数据以显示最新结果
    await reloadData()
  } else {
    showMessage(deleteError.value || '批量删除失败', 'error')
  }
}

// 打开歌曲管理器
const openSongManager = (playlist) => {
  if (!canManagePlaylist(playlist)) {
    showMessage('你只能管理自己创建的歌单', 'error')
    return
  }

  currentPlaylist.value = playlist
  selectedSongs.value = []
  showSongManager.value = true
}

// 关闭歌曲管理器
const closeSongManager = () => {
  showSongManager.value = false
  currentPlaylist.value = null
  selectedSongs.value = []
}

// 删除单个歌曲
const deleteSingleSong = async (song) => {
  if (!currentPlaylist.value || !canManagePlaylist(currentPlaylist.value)) {
    showMessage('权限不足', 'error')
    return
  }

  if (confirm(`确定要删除歌曲"${song.title}"吗？此操作将同时删除音频文件。`)) {
    const success = await deleteSongWithStorage(currentPlaylist.value.id, song)

    if (success) {
      showMessage('歌曲删除成功')

      // 从选中列表中移除
      selectedSongs.value = selectedSongs.value.filter((id) => id !== song.id)

      // 重新加载歌单数据以显示最新结果
      await reloadData()

      // 更新当前歌单的引用
      const updatedPlaylist = userPlaylists.value.find((p) => p.id === currentPlaylist.value.id)
      if (updatedPlaylist) {
        currentPlaylist.value = updatedPlaylist
      }
    } else {
      showMessage(deleteError.value || '删除歌曲失败', 'error')
    }
  }
}

// 批量删除歌曲
const batchDeleteSongs = async () => {
  if (!currentPlaylist.value || !canManagePlaylist(currentPlaylist.value)) {
    showMessage('权限不足', 'error')
    return
  }

  const songsToDeleteCount = selectedSongs.value.length
  if (songsToDeleteCount === 0) return

  // 获取要删除的歌曲对象
  const songsToDelete = currentPlaylist.value.songs.filter((song) =>
    selectedSongs.value.includes(song.id),
  )

  if (confirm(`确定要删除选中的 ${songsToDeleteCount} 首歌曲吗？此操作将同时删除音频文件。`)) {
    const success = await batchDeleteSongsWithStorage(currentPlaylist.value.id, songsToDelete)

    if (success) {
      showMessage(`成功删除 ${songsToDeleteCount} 首歌曲`)
      selectedSongs.value = []

      // 重新加载歌单数据以显示最新结果
      await reloadData()

      // 更新当前歌单的引用
      const updatedPlaylist = userPlaylists.value.find((p) => p.id === currentPlaylist.value.id)
      if (updatedPlaylist) {
        currentPlaylist.value = updatedPlaylist
      }
    } else {
      showMessage(deleteError.value || '批量删除歌曲失败', 'error')
    }
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 显示消息
const showMessage = (message, type = 'success') => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// 监听数据加载状态
watch(
  [userPlaylists, error],
  () => {
    // 当数据加载完成（有数据或有错误）时，设置初始加载完成
    if (userPlaylists.value.length > 0 || error.value) {
      isInitialLoading.value = false
    } else {
      // 如果没有数据也没有错误，延迟一点时间再设置加载完成
      // 这样可以避免在数据还在加载时就显示空状态
      setTimeout(() => {
        isInitialLoading.value = false
      }, 2000)
    }
  },
  { immediate: true },
)

// 组件挂载时的处理
onMounted(() => {
  if (!user.value) {
    showMessage('请先登录', 'error')
  }
})
</script>

<style scoped>
#PlaylistManager {
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

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.select-all-container {
  display: inline-block;
}

.batch-actions {
  display: flex;
  gap: 1rem;
}

.batch-delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--warning);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.batch-delete-btn:hover:not(:disabled) {
  background: hsl(from var(--warning) h s calc(l - 10));
  transform: translateY(-1px);
}

.batch-delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 歌单区域 */
.playlists-section {
  position: relative;
}

.playlists-section.reloading {
  pointer-events: none;
}

.playlists-section.reloading .playlists-grid {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

/* 重新加载指示器 */
.reload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.reload-spinner {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.reload-spinner .spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--secondary);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

.reload-spinner p {
  color: var(--primary);
  font-weight: 500;
  margin: 0;
}

/* 歌单网格 */
.playlists-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .playlists-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .playlists-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.playlist-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  opacity: 0;
  animation-fill-mode: forwards;
}

.playlist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-checkbox {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}

.playlist-content {
  padding: 1rem;
  padding-top: 3rem;
}

.thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
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

.playlist-card:hover .overlay {
  opacity: 1;
}

.view-link {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
}

.playlist-info {
  margin-bottom: 1rem;
}

.playlist-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--primary);
  line-height: 1.3;
}

.playlist-description {
  font-size: 0.9rem;
  color: hsl(from var(--primary) h s calc(l + 20));
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.playlist-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: hsl(from var(--primary) h s calc(l + 30));
}

.playlist-actions {
  display: flex;
  gap: 0.5rem;
}

.manage-songs-btn,
.delete-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.manage-songs-btn {
  background: var(--secondary);
  color: var(--primary);
}

.manage-songs-btn:hover {
  background: var(--primary);
  color: white;
}

.delete-btn {
  background: rgba(218, 15, 65, 0.1);
  color: var(--warning);
}

.delete-btn:hover:not(:disabled) {
  background: var(--warning);
  color: white;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 复选框样式 */
.checkbox-container,
.select-all-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input,
.select-all-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  pointer-events: none;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid var(--secondary);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.checkbox-container:hover .checkmark,
.select-all-checkbox:hover .checkmark {
  border-color: var(--primary);
}

.checkbox-container input:checked~.checkmark,
.select-all-checkbox input:checked~.checkmark {
  background-color: var(--primary);
  border-color: var(--primary);
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.checkbox-container input:checked~.checkmark:after,
.select-all-checkbox input:checked~.checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after,
.select-all-checkbox .checkmark:after {
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  cursor: pointer;
  user-select: none;
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

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.song-manager-modal {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--secondary);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: hsl(from var(--primary) h s calc(l + 20));
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--secondary);
  color: var(--primary);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary);
}

.modal-content p {
  margin: 0 0 1rem 0;
  line-height: 1.5;
  color: hsl(from var(--primary) h s calc(l + 10));
}

.warning-text {
  color: var(--warning);
  font-weight: 500;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn,
.confirm-delete-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--secondary);
  color: var(--primary);
}

.cancel-btn:hover {
  background: hsl(from var(--secondary) h s calc(l - 10));
}

.confirm-delete-btn {
  background: var(--warning);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: hsl(from var(--warning) h s calc(l - 10));
}

.confirm-delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 歌曲管理 */
.song-manager-content {
  max-height: 400px;
  overflow-y: auto;
}

.no-songs {
  text-align: center;
  padding: 2rem;
  color: hsl(from var(--primary) h s calc(l + 20));
}

.songs-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--secondary);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.batch-delete-songs-btn {
  background: var(--warning);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.batch-delete-songs-btn:hover:not(:disabled) {
  background: hsl(from var(--warning) h s calc(l - 10));
}

.batch-delete-songs-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.songs-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid var(--secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.song-item:hover {
  background: #f8f9fa;
  border-color: var(--primary);
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

.delete-song-btn {
  background: rgba(218, 15, 65, 0.1);
  color: var(--warning);
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.delete-song-btn:hover:not(:disabled) {
  background: var(--warning);
  color: white;
}

.delete-song-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 成功提示 */
.success-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  font-weight: 500;
}

/* 移动端优化 */
@media (max-width: 640px) {
  #PlaylistManager {
    padding: 1rem 0;
  }

  .header h2 {
    font-size: 2rem;
  }

  .toolbar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .batch-actions {
    justify-content: center;
  }

  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .success-toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
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
