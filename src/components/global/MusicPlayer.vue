<template>
  <div v-if="playerStore.currentSong" id="MusicPlayer">
    <!-- 专辑封面 -->
    <div class="album-cover">
      <OptimizedImage v-if="playerStore.currentDoc" :lazy-load="true" :image-class="'cover-image'"
        :playlist="playerStore.currentDoc" :pixel-size="'_200x200.webp'" />
    </div>

    <!-- 歌曲信息 -->
    <div class="song-info">
      <div class="song-title">{{ playerStore.currentSong.title }}</div>
      <div class="artist-name">{{ playerStore.currentSong.artist }}</div>
    </div>

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
        <div @mousedown.prevent="handleSeekStart" @touchstart.prevent="handleSeekStart" class="progress-bar">
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
      <div @mousedown.prevent="handleVolumeDragStart" @touchstart.prevent="handleVolumeDragStart" class="volume-slider">
        <div class="volume-track">
          <div class="volume-fill" :style="{ width: volumePercent + '%' }"></div>
          <div class="volume-thumb" :style="{ left: volumePercent + '%' }"></div>
        </div>
      </div>
    </div>

    <audio @timeupdate="handleTimeUpdate" @loadedmetadata="handleLoadedMetadata" @play="handleAudioPlay"
      @pause="handleAudioPause" @ended="handleSongEnd" :src="playerStore.songUrl" ref="player"></audio>

    <Teleport to="body">
      <Transition name="inform" mode="out-in">
        <div v-if="playerStore.informMessage" class="inform">
          {{ playerStore.informMessage }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { usePlayerStore } from '@/stores/player';
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import useInform from '@/composables/useInform';

import OptimizedImage from '../OptimizedImage.vue';

const player = ref(null) // 播放器本身


const isSeeking = ref(false) // 是否正在拖动进度条
const wasPlayingBeforeSeek = ref(false) // 拖动前是否在播放
const isDraggingVolume = ref(false) // 是否正在拖动音量条


const playerStore = usePlayerStore()

// 使用 inform 自动消失逻辑
const { cleanup } = useInform()

// 组件卸载时清理定时器
onUnmounted(() => {
  cleanup()
})

// 当音频的播放时间更新时触发
const handleTimeUpdate = (event) => {
  // 如果正在拖动进度条，则不更新 currentTime
  if (isSeeking.value) {
    return
  }

  playerStore.currentTime = event.target.currentTime
}

// 当音频的元数据加载完成后触发
const handleLoadedMetadata = (event) => {
  playerStore.duration = event.target.duration;
  // 同步音量设置
  if (player.value) {
    player.value.volume = playerStore.volume;
  }
}

// 当音频开始播放时触发
const handleAudioPlay = () => {
  playerStore.isPlaying = true;
}

// 当音频暂停时触发
const handleAudioPause = () => {
  playerStore.isPlaying = false;
}

// (可选，但推荐) 当歌曲播放结束时触发
const handleSongEnd = () => {
  // 这里可以添加自动播放下一首的逻辑
  playerStore.isPlaying = false;
  playerStore.nextSong();
}



const handlePlay = async () => {
  if (!player.value || !playerStore.songUrl) {
    return
  }

  try {
    // 直接根据 audio 元素的 paused 状态来决定操作
    if (player.value.paused) {
      await player.value.play()
    } else {
      player.value.pause()
    }
  } catch {
    // 如果播放失败，确保状态正确
    playerStore.isPlaying = false;
  }
}


// 格式化时间显示
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formattedCurrentTime = computed(() => formatTime(playerStore.currentTime))
const formattedDuration = computed(() => formatTime(playerStore.duration))


// 动态更新进度条UI
const progressPercent = computed(() => {
  return playerStore.duration ? (playerStore.currentTime / playerStore.duration) * 100 : 0
})

// 动态更新音量条
const volumePercent = computed(() => {
  return playerStore.volume * 100
})

// 监听歌曲URL的变化，实现自动播放新歌
watch(() => playerStore.songUrl, (newUrl) => {
  if (!player.value) return;

  // 这个 watch 只处理一个核心场景：
  // 当歌曲 URL 变化，并且 Store 的意图是“播放”时，就自动播放新歌。
  if (newUrl && playerStore.isPlaying) {

    // 使用 nextTick 确保 DOM 更新（<audio> 的 src 已改变）
    nextTick(() => {

      // 定义一个一次性的 canplay 事件处理器
      const playOnCanPlay = async () => {
        try {
          await player.value.play();
        } catch {
          // 如果因浏览器策略等原因播放失败，同步状态
          playerStore.isPlaying = false;
        }
      };

      // 为 canplay 事件添加这个一次性监听器
      // { once: true } 是关键，确保它只执行一次然后自动移除，避免内存泄漏和重复执行
      player.value.addEventListener('canplay', playOnCanPlay, { once: true });
    });
  }
});

// 监听音量变化，同步到 audio 元素
watch(() => playerStore.volume, (newVolume) => {
  if (player.value) {
    player.value.volume = newVolume;
  }
});


// 计算点击或拖动位置对应的时间
const calculateTimeFromEvent = (event, progressBar) => {
  const bar = progressBar || event.currentTarget;
  // getBoundingClientRect() 方法返回元素的大小及其相对于视口的位置。
  const rect = bar.getBoundingClientRect();

  // 支持触摸事件和鼠标事件
  let clientX;
  if (event.touches && event.touches.length > 0) {
    // touchstart 和 touchmove 事件
    clientX = event.touches[0].clientX;
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    // touchend 事件
    clientX = event.changedTouches[0].clientX;
  } else {
    // 鼠标事件
    clientX = event.clientX;
  }

  const offsetX = clientX - rect.left; // 计算点击/触摸位置相对于进度条左侧的偏移
  const barWidth = bar.clientWidth;
  const percentage = Math.min(Math.max(0, offsetX / barWidth), 1); // 确保百分比在 0-1 之间

  return percentage
};

// 开始拖动

const handleSeekStart = (e) => {
  e.preventDefault();
  if (!player.value) return;

  isSeeking.value = true;
  wasPlayingBeforeSeek.value = playerStore.isPlaying

  const percentage = calculateTimeFromEvent(e);

  if (playerStore.duration) {
    const seekTime = percentage * playerStore.duration;
    playerStore.currentTime = seekTime;
  }

  // 添加全局事件监听器（支持鼠标和触摸）
  window.addEventListener('mousemove', handleSeekMove, { passive: false });
  window.addEventListener('mouseup', handleSeekEnd);
  window.addEventListener('touchmove', handleSeekMove, { passive: false });
  window.addEventListener('touchend', handleSeekEnd);
}

// 拖动过程
const handleSeekMove = (e) => {
  e.preventDefault();
  if (!isSeeking.value) return;

  // 在拖动时持续更新UI
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    const percentage = calculateTimeFromEvent(e, progressBar);

    if (playerStore.duration) {
      const seekTime = percentage * playerStore.duration;
      playerStore.currentTime = seekTime;
    }
  }
}

// 拖动结束
const handleSeekEnd = (e) => {
  // 移除事件监听器（鼠标和触摸）
  window.removeEventListener('mousemove', handleSeekMove);
  window.removeEventListener('mouseup', handleSeekEnd);
  window.removeEventListener('touchmove', handleSeekMove);
  window.removeEventListener('touchend', handleSeekEnd);

  if (!isSeeking.value) return;

  const progressBar = document.querySelector('.progress-bar')
  if (progressBar) {
    const percentage = calculateTimeFromEvent(e, progressBar);
    if (playerStore.duration) {
      const newTime = percentage * playerStore.duration;
      playerStore.currentTime = newTime;
      player.value.currentTime = newTime;
    }
  }

  isSeeking.value = false

  // 如果拖动前是播放状态，恢复播放
  if (wasPlayingBeforeSeek.value) {
    player.value.play().catch(() => {
      // 恢复播放失败
    })
  }
}

// 拖动音量条

const handleVolumeDragStart = (e) => {
  e.preventDefault();
  if (!player.value) return;

  isDraggingVolume.value = true;

  const percentage = calculateTimeFromEvent(e);
  playerStore.setVolume(percentage)

  // 添加全局事件监听器（支持鼠标和触摸）
  window.addEventListener('mousemove', handleVolumeDragging, { passive: false });
  window.addEventListener('mouseup', handleVolumeDragEnd);
  window.addEventListener('touchmove', handleVolumeDragging, { passive: false });
  window.addEventListener('touchend', handleVolumeDragEnd);
}

const handleVolumeDragging = (e) => {
  e.preventDefault();
  if (!isDraggingVolume.value) return;

  const volumeSlider = document.querySelector('.volume-slider');
  if (volumeSlider) {
    const percentage = calculateTimeFromEvent(e, volumeSlider);
    playerStore.setVolume(percentage)
  }
}

const handleVolumeDragEnd = (e) => {
  if (!isDraggingVolume.value) return;

  // 移除事件监听器（鼠标和触摸）
  window.removeEventListener('mousemove', handleVolumeDragging);
  window.removeEventListener('mouseup', handleVolumeDragEnd);
  window.removeEventListener('touchmove', handleVolumeDragging);
  window.removeEventListener('touchend', handleVolumeDragEnd);

  const volumeSlider = document.querySelector('.volume-slider');
  if (volumeSlider) {
    const percentage = calculateTimeFromEvent(e, volumeSlider);
    playerStore.setVolume(percentage);
    // 音量会通过 watch 自动同步到 audio 元素
  }

  isDraggingVolume.value = false;
}


// 监听isPlaying状态，同步播放器控件行为
watch(() => playerStore.isPlaying, (newIsPlaying) => {
  if (!player.value) return;
  if (newIsPlaying) {
    player.value.play().catch(() => {
      // 播放失败
    })
  } else {
    player.value.pause()
  }
})


</script>

<style scoped>
/* 主容器样式 */
#MusicPlayer {
  background: rgba(149, 149, 149, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  height: 100px;
  position: fixed;
  bottom: 0%;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin-top: auto;
}

/* 专辑封面样式 */
.album-cover {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  min-width: 70px;
}



.cover-image:hover {
  transform: scale(1.05);
}

/* 歌曲信息样式 */
.song-info {
  margin-left: 16px;
  flex-shrink: 1;
  min-width: 120px;
  max-width: 200px;
  overflow: hidden;
}

.song-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-name {
  font-size: 14px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 控制区域样式 */
.controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 16px;
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
  /* 防止触摸时的默认行为 */
  -webkit-touch-callout: none;
  /* 禁用长按菜单 */
  -webkit-user-select: none;
  /* 禁用文本选择 */
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
  transition: width 0.1s ease;
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
  transition: all 0.2s ease;
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
  margin-right: 2rem;
}

.volume-btn {
  background: rgba(255, 255, 255, 0.1);
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
}

.volume-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.volume-btn svg {
  width: 22px;
  height: 22px;
}

.volume-slider {
  width: 60px;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
  touch-action: none;
  /* 防止触摸时的默认行为 */
  -webkit-touch-callout: none;
  /* 禁用长按菜单 */
  -webkit-user-select: none;
  /* 禁用文本选择 */
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

/* 响应式设计 */
/* 大屏幕优化 */
@media (min-width: 1200px) {
  #MusicPlayer {
    padding: 0 40px;
  }

  .progress-area {
    max-width: 800px;
  }

  .volume-slider {
    width: 100px;
  }
}

/* 中等屏幕 */
@media (max-width: 1024px) {
  #MusicPlayer {
    padding: 0 16px;
  }

  .controls {
    margin: 0 12px;
  }

  .progress-area {
    max-width: 500px;
  }
}

/* 平板设备 */
@media (max-width: 768px) {
  #MusicPlayer {
    padding: 0 12px;
    height: 90px;
  }

  .album-cover {
    width: 60px;
    height: 60px;
    min-width: 60px;
  }

  .song-info {
    min-width: 100px;
    max-width: 150px;
    margin-left: 12px;
  }

  .song-title {
    font-size: 14px;
  }

  .artist-name {
    font-size: 12px;
  }

  .controls {
    margin: 0 8px;
  }

  .control-buttons {
    gap: 6px;
    margin-bottom: 8px;
  }

  .prev-btn,
  .next-btn {
    width: 42px;
    height: 42px;
  }

  .prev-btn svg,
  .next-btn svg {
    width: 20px;
    height: 20px;
  }

  .play-btn {
    width: 52px;
    height: 52px;
    margin: 0 6px;
  }

  .play-btn svg {
    width: 26px;
    height: 26px;
  }

  .progress-area {
    max-width: 350px;
    gap: 8px;
  }

  .time {
    font-size: 11px;
    min-width: 30px;
  }

  .progress-bar {
    height: 20px;
    min-width: 60px;
  }

  .progress-track {
    height: 5px;
  }

  .progress-thumb {
    width: 18px;
    height: 18px;
  }

  .volume-control {
    min-width: 80px;
  }

  .volume-slider {
    width: 50px;
  }

  .volume-thumb {
    width: 14px;
    height: 14px;
  }
}

/* 手机设备 */
@media (max-width: 640px) {
  #MusicPlayer {
    height: 80px;
    padding: 0 8px;
  }

  .album-cover {
    width: 50px;
    height: 50px;
    min-width: 50px;
  }

  .song-info {
    min-width: 80px;
    max-width: 120px;
    margin-left: 8px;
  }

  .song-title {
    font-size: 13px;
  }

  .artist-name {
    font-size: 11px;
  }

  .controls {
    margin: 0 6px;
  }

  .control-buttons {
    gap: 4px;
    margin-bottom: 6px;
  }

  .prev-btn,
  .next-btn {
    width: 38px;
    height: 38px;
  }

  .prev-btn svg,
  .next-btn svg {
    width: 18px;
    height: 18px;
  }

  .play-btn {
    width: 48px;
    height: 48px;
    margin: 0 4px;
  }

  .play-btn svg {
    width: 22px;
    height: 22px;
  }

  .progress-area {
    max-width: 250px;
    gap: 6px;
  }

  .time {
    font-size: 10px;
    min-width: 28px;
  }

  .progress-bar {
    height: 18px;
    min-width: 50px;
  }

  .progress-track {
    height: 4px;
  }

  .progress-thumb {
    width: 16px;
    height: 16px;
  }

  .volume-control {
    min-width: 70px;
  }

  .volume-btn {
    width: 38px;
    height: 38px;
  }

  .volume-btn svg {
    width: 18px;
    height: 18px;
  }

  .volume-slider {
    width: 40px;
    height: 20px;
  }

  .volume-track {
    height: 3px;
  }

  .volume-thumb {
    width: 12px;
    height: 12px;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  #MusicPlayer {
    height: 70px;
    padding: 0 6px;
  }

  .album-cover {
    width: 45px;
    height: 45px;
    min-width: 45px;
  }

  .song-info {
    min-width: 70px;
    max-width: 100px;
    margin-left: 6px;
  }

  .song-title {
    font-size: 12px;
  }

  .artist-name {
    font-size: 10px;
  }

  .controls {
    margin: 0 4px;
  }

  .control-buttons {
    gap: 3px;
    margin-bottom: 4px;
  }

  .prev-btn,
  .next-btn {
    width: 34px;
    height: 34px;
  }

  .prev-btn svg,
  .next-btn svg {
    width: 16px;
    height: 16px;
  }

  .play-btn {
    width: 42px;
    height: 42px;
    margin: 0 3px;
  }

  .play-btn svg {
    width: 20px;
    height: 20px;
  }

  .progress-area {
    max-width: 180px;
    gap: 4px;
  }

  .time {
    font-size: 9px;
    min-width: 25px;
  }

  .progress-bar {
    height: 16px;
    min-width: 40px;
  }

  .progress-track {
    height: 3px;
  }

  .progress-thumb {
    width: 10px;
    height: 10px;
  }

  /* 在小屏幕上隐藏音量控制 */
  .volume-control {
    display: none;
  }
}

/* 超小屏幕 */
@media (max-width: 360px) {
  #MusicPlayer {
    height: 65px;
    padding: 0 4px;
  }

  .album-cover {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }

  .song-info {
    min-width: 60px;
    max-width: 80px;
    margin-left: 4px;
  }

  .song-title {
    font-size: 11px;
  }

  .artist-name {
    font-size: 9px;
  }

  .controls {
    margin: 0 2px;
  }

  .progress-area {
    max-width: 140px;
    gap: 3px;
  }

  .time {
    font-size: 8px;
    min-width: 22px;
  }

  .progress-bar {
    min-width: 30px;
  }
}

/* Transition */
.inform-enter-active,
.inform-leave-active {
  transition: all 0.3s ease;
}

.inform-enter-from,
.inform-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.inform-enter-to,
.inform-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
</style>
