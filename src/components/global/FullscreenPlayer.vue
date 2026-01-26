<template>
  <Teleport to="body">
    <Transition name="fullscreen" mode="out-in">
      <div v-if="playerStore.isFullscreen && playerStore.currentSong" class="fullscreen-player">
        <!-- 背景图片 -->
        <div class="fullscreen-background">
          <img v-if="playerStore.currentDoc" :src="playerStore.coverUrl" alt="background" />
        </div>

        <!-- 桌面端布局 -->
        <div class="desktop-layout">
          <!-- 左上角退出按钮 -->
          <button @click="playerStore.toggleFullscreen" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
            </svg>
          </button>

          <!-- 顶部信息 -->
          <div class="top-info">
            <div class="song-title">{{ playerStore.currentSong.title }}</div>
            <div class="playlist-info">
              {{ playerStore.currentDoc?.name || '' }} · {{ playerStore.currentSong.artist }}
            </div>
          </div>

          <!-- 主内容区域 -->
          <div class="main-content">
            <!-- 左半边：唱片 -->
            <div class="left-section">
              <div class="vinyl-record" :class="{ rotating: playerStore.isPlaying }">
                <div class="vinyl-inner">
                  <OptimizedImage v-if="playerStore.currentDoc" :lazy-load="false" :image-class="'vinyl-cover'"
                    :playlist="playerStore.currentDoc" :pixel-size="'_600x600.webp'" />
                </div>
              </div>
            </div>

            <!-- 右半边：歌曲列表 -->
            <div class="right-section">
              <div class="song-list">
                <div v-for="(song, index) in playerStore.currentPlaylist" :key="index"
                  @click="playerStore.playSong(index)" class="song-item"
                  :class="{ active: index === playerStore.currentSongIndex }">
                  <div class="song-item-title">{{ song.title }}</div>
                  <div class="song-item-artist">{{ song.artist }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部迷你播放器控件 - 复用 MusicPlayer -->
          <div class="mini-player-controls">
            <!-- 播放控制区域 -->
            <div class="controls">
              <!-- 播放按钮组 -->
              <div class="control-buttons">
                <!-- 上一首 -->
                <button @click="playerStore.previousSong" class="control-btn prev-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>
                <!-- 播放/暂停 -->
                <button @click="handlePlay" class="control-btn play-btn">
                  <svg v-if="!playerStore.isPlaying" viewBox="0 0 24 24" fill="currentColor" class="play-icon">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <svg v-if="playerStore.isPlaying" viewBox="0 0 24 24" fill="currentColor" class="pause-icon">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                </button>
                <!-- 下一首 -->
                <button @click="playerStore.nextSong" class="control-btn next-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              </div>

              <!-- 进度条区域 -->
              <div class="progress-area">
                <span class="time current-time">{{ formattedCurrentTime }}</span>
                <div id="desktop-progress-bar" @mousedown.prevent="handleSeekStart"
                  @touchstart.prevent="handleSeekStart" class="progress-bar">
                  <div class="progress-track">
                    <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                    <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
                  </div>
                </div>
                <span class="time total-time">{{ formattedDuration }}</span>
              </div>
            </div>

            <!-- 音量控制 -->
            <div class="volume-control">
              <button class="volume-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" class="volume-icon">
                  <path
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </button>
              <div @mousedown.prevent="handleVolumeDragStart" @touchstart.prevent="handleVolumeDragStart"
                class="volume-slider">
                <div class="volume-track">
                  <div class="volume-fill" :style="{ width: volumePercent + '%' }"></div>
                  <div class="volume-thumb" :style="{ left: volumePercent + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 移动端布局 -->
        <div class="mobile-layout">
          <!-- 左上角退出按钮 -->
          <button @click="playerStore.toggleFullscreen" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
            </svg>
          </button>

          <!-- 唱片 -->
          <div class="mobile-vinyl">
            <div class="vinyl-record" :class="{ rotating: playerStore.isPlaying }">
              <div class="vinyl-inner">
                <OptimizedImage v-if="playerStore.currentDoc" :lazy-load="false" :image-class="'vinyl-cover'"
                  :playlist="playerStore.currentDoc" :pixel-size="'_600x600.webp'" />
              </div>
            </div>
          </div>

          <!-- 歌曲信息 -->
          <div class="mobile-song-info">
            <div class="song-title">{{ playerStore.currentSong.title }}</div>
            <div class="artist-name">{{ playerStore.currentSong.artist }}</div>
          </div>

          <!-- 进度条 -->
          <div class="mobile-progress">
            <span class="time current-time">{{ formattedCurrentTime }}</span>
            <div id="mobile-progress-bar" @mousedown.prevent="handleSeekStart" @touchstart.prevent="handleSeekStart"
              class="progress-bar">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
              </div>
            </div>
            <span class="time total-time">{{ formattedDuration }}</span>
          </div>

          <!-- 播放控制 -->
          <div class="mobile-controls">
            <button @click="playerStore.previousSong" class="control-btn prev-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button @click="handlePlay" class="control-btn play-btn">
              <svg v-if="!playerStore.isPlaying" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-if="playerStore.isPlaying" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>
            <button @click="playerStore.nextSong" class="control-btn next-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { usePlayerStore } from '@/stores/player'
import { ref, computed } from 'vue'
import OptimizedImage from '../OptimizedImage.vue'

const playerStore = usePlayerStore()

const isSeeking = ref(false)
const wasPlayingBeforeSeek = ref(false)
const isDraggingVolume = ref(false)

const handlePlay = async () => {
  const audio = document.querySelector('audio')
  if (!audio || !playerStore.songUrl) return

  try {
    if (audio.paused) {
      await audio.play()
    } else {
      audio.pause()
    }
  } catch {
    playerStore.isPlaying = false
  }
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formattedCurrentTime = computed(() => formatTime(playerStore.currentTime))
const formattedDuration = computed(() => formatTime(playerStore.duration))

const progressPercent = computed(() => {
  return playerStore.duration ? (playerStore.currentTime / playerStore.duration) * 100 : 0
})

const volumePercent = computed(() => {
  return playerStore.volume * 100
})

const calculateTimeFromEvent = (event, progressBar) => {
  const bar = progressBar || event.currentTarget
  const rect = bar.getBoundingClientRect()

  let clientX
  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    clientX = event.changedTouches[0].clientX
  } else {
    clientX = event.clientX
  }

  const offsetX = clientX - rect.left
  const barWidth = bar.clientWidth
  const percentage = Math.min(Math.max(0, offsetX / barWidth), 1)

  return percentage
}

const handleSeekStart = (e) => {
  e.preventDefault()
  const audio = document.querySelector('audio')
  if (!audio) return

  isSeeking.value = true
  wasPlayingBeforeSeek.value = playerStore.isPlaying

  const percentage = calculateTimeFromEvent(e)

  if (playerStore.duration) {
    const seekTime = percentage * playerStore.duration
    playerStore.currentTime = seekTime
  }

  window.addEventListener('mousemove', handleSeekMove, { passive: false })
  window.addEventListener('mouseup', handleSeekEnd)
  window.addEventListener('touchmove', handleSeekMove, { passive: false })
  window.addEventListener('touchend', handleSeekEnd)
}

const handleSeekMove = (e) => {
  e.preventDefault()
  if (!isSeeking.value) return

  // 判断在哪个进度条上操作，根据条件选取正确的进度条

  let progressBar
  if (window.innerWidth <= 768) {
    // 移动端
    progressBar = document.querySelector('#mobile-progress-bar')
  } else if (window.innerWidth > 768) {
    // 桌面端
    progressBar = document.querySelector('#desktop-progress-bar')
  }

  if (progressBar) {
    const percentage = calculateTimeFromEvent(e, progressBar)

    if (playerStore.duration) {
      const seekTime = percentage * playerStore.duration
      playerStore.currentTime = seekTime
    }
  }
}

const handleSeekEnd = (e) => {
  window.removeEventListener('mousemove', handleSeekMove)
  window.removeEventListener('mouseup', handleSeekEnd)
  window.removeEventListener('touchmove', handleSeekMove)
  window.removeEventListener('touchend', handleSeekEnd)

  if (!isSeeking.value) return

  // 判断在哪个进度条上操作，根据条件选取正确的进度条

  let progressBar
  if (window.innerWidth <= 768) {
    // 移动端
    progressBar = document.querySelector('#mobile-progress-bar')
  } else if (window.innerWidth > 768) {
    // 桌面端
    progressBar = document.querySelector('#desktop-progress-bar')
  }

  if (progressBar) {
    const percentage = calculateTimeFromEvent(e, progressBar)
    if (playerStore.duration) {
      const newTime = percentage * playerStore.duration
      playerStore.currentTime = newTime
      const audio = document.querySelector('audio')
      if (audio) {
        audio.currentTime = newTime
      }
    }
  }

  isSeeking.value = false

  if (wasPlayingBeforeSeek.value) {
    const audio = document.querySelector('audio')
    if (audio) {
      audio.play().catch(() => { })
    }
  }
}

const handleVolumeDragStart = (e) => {
  e.preventDefault()
  isDraggingVolume.value = true

  const percentage = calculateTimeFromEvent(e)
  playerStore.setVolume(percentage)

  window.addEventListener('mousemove', handleVolumeDragging, { passive: false })
  window.addEventListener('mouseup', handleVolumeDragEnd)
  window.addEventListener('touchmove', handleVolumeDragging, { passive: false })
  window.addEventListener('touchend', handleVolumeDragEnd)
}

const handleVolumeDragging = (e) => {
  e.preventDefault()
  if (!isDraggingVolume.value) return

  const volumeSlider = document.querySelector('.fullscreen-player .volume-slider')
  if (volumeSlider) {
    const percentage = calculateTimeFromEvent(e, volumeSlider)
    playerStore.setVolume(percentage)
  }
}

const handleVolumeDragEnd = (e) => {
  if (!isDraggingVolume.value) return

  window.removeEventListener('mousemove', handleVolumeDragging)
  window.removeEventListener('mouseup', handleVolumeDragEnd)
  window.removeEventListener('touchmove', handleVolumeDragging)
  window.removeEventListener('touchend', handleVolumeDragEnd)

  const volumeSlider = document.querySelector('.fullscreen-player .volume-slider')
  if (volumeSlider) {
    const percentage = calculateTimeFromEvent(e, volumeSlider)
    playerStore.setVolume(percentage)
  }

  isDraggingVolume.value = false
}
</script>

<style scoped>
.fullscreen-player {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1002;
  overflow: hidden;
  touch-action: none;
}

.fullscreen-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background-color: rgb(142, 142, 142);
}

.fullscreen-background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(10px);
  opacity: 0.5;
}

/* 桌面端布局 */
.desktop-layout {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
}

.close-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.close-btn svg {
  width: 24px;
  height: 24px;
}

.top-info {
  padding: 20px 20px 10px;
  text-align: center;
}

.top-info .song-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: white;
}

.playlist-info {
  font-size: 16px;
  opacity: 0.8;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
}

.left-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 唱片样式 */
.vinyl-record {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.vinyl-record::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #333;
  border-radius: 50%;
  border: 2px solid #555;
}

.vinyl-inner {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.vinyl-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vinyl-record.rotating {
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 歌曲列表 */
.song-list {
  flex: 1;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px;
  backdrop-filter: blur(10px);
}

.song-list::-webkit-scrollbar {
  width: 6px;
}

.song-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.song-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.song-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.song-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.song-item.active {
  background: rgba(255, 255, 255, 0.25);
}

.song-item-title {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
}

.song-item-artist {
  font-size: 14px;
  opacity: 0.7;
  color: white;
}

/* 迷你播放器控件 - 复用 MusicPlayer 样式 */
.mini-player-controls {
  padding: 20px;
  background: rgba(149, 149, 149, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 控制区域样式 - 复用 MusicPlayer */
.controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}

/* 控制按钮组 */
.control-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.control-btn:active {
  transform: scale(0.95);
}

.prev-btn,
.next-btn {
  width: 48px;
  height: 48px;
}

.prev-btn svg,
.next-btn svg {
  width: 24px;
  height: 24px;
}

.play-btn {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 8px;
}

.play-btn svg {
  width: 30px;
  height: 30px;
}

.play-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* 进度条区域 */
.progress-area {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
  gap: 12px;
  min-width: 0;
}

.time {
  font-size: 12px;
  opacity: 0.8;
  min-width: 35px;
  text-align: center;
  color: white;
}

.progress-bar {
  flex: 1;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  min-width: 80px;
  padding: 8px 0;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #808080;
  border-radius: 3px;
  transition: width 0s ease;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: all 0s ease;
  cursor: grab;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

.progress-bar:active .progress-thumb {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.1);
}

/* 音量控制样式 */
.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  flex-shrink: 0;
  margin-right: 3rem;
}

.volume-btn {
  background: rgba(255, 255, 255, 0);
  border: none;
  border-radius: 50%;
  color: rgb(255, 255, 255);
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.volume-btn svg {
  width: 22px;
  height: 22px;
}

.volume-slider {
  width: 100px;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.volume-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.volume-fill {
  height: 100%;
  background: #808080;
  border-radius: 2px;
  transition: width 0.1s ease;
}

.volume-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: all 0.2s ease;
  cursor: grab;
}

.volume-slider:hover .volume-thumb {
  opacity: 1;
}

.volume-slider:active .volume-thumb {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.1);
}

/* 移动端布局 */
.mobile-layout {
  display: none;
  position: relative;
  z-index: 1002;
  width: 100%;
  height: 100%;
  flex-direction: column;
  backdrop-filter: blur(20px);
  padding: 20px;
}

.mobile-vinyl {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-vinyl .vinyl-record {
  width: 80vw;
  height: 80vw;
  max-width: 300px;
  max-height: 300px;
}

.mobile-vinyl .vinyl-inner {
  width: 70%;
  height: 70%;
}

.mobile-song-info {
  text-align: center;
  padding: 20px 0;
}

.mobile-song-info .song-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: white;
}

.mobile-song-info .artist-name {
  font-size: 18px;
  opacity: 0.8;
  color: white;
}

.mobile-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  position: relative;
}

.mobile-progress .progress-bar {
  flex: 1;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  min-width: 80px;
  padding: 8px 0;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.mobile-progress .progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}

.mobile-progress .progress-fill {
  height: 100%;
  background: #808080;
  border-radius: 3px;
  transition: width 0.1s ease;
}

.mobile-progress .progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  opacity: 1;
  transition: all 0.2s ease;
  cursor: grab;
}

.mobile-progress .progress-bar:hover .progress-thumb,
.mobile-progress .progress-bar:active .progress-thumb {
  opacity: 1;
}

.mobile-progress .progress-bar:active .progress-thumb {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.1);
}

.mobile-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 20px 0;
}

.mobile-controls .control-btn {
  width: 64px;
  height: 64px;
}

.mobile-controls .control-btn svg {
  width: 32px;
  height: 32px;
}

/* 响应式 */
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: flex;
  }
}

/* 过渡动画 */
.fullscreen-enter-active,
.fullscreen-leave-active {
  transition: all 300ms ease;
}

.fullscreen-enter-from {
  transform: translateY(100%);
}

.fullscreen-leave-to {
  transform: translateY(100%);
}

.fullscreen-enter-to,
.fullscreen-leave-from {
  transform: translateY(0);
}
</style>
