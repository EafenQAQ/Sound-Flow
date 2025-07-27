<template>
  <div v-if="playerStore.currentSong" id="MusicPlayer">
    <!-- 专辑封面 -->
    <div class="album-cover">
      <img :src="playerStore.coverUrl || defaultCover" alt="专辑封面" class="cover-image">
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
        <div class="progress-bar">
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
      <div class="volume-slider">
        <div class="volume-track">
          <div class="volume-fill"></div>
          <div class="volume-thumb"></div>
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
import logo from '@/assets/logo/logo.webp'

const player = ref(null) // 播放器本身
const defaultCover = ref(logo)

const playerStore = usePlayerStore()

// 使用 inform 自动消失逻辑
const { cleanup } = useInform()

// 组件卸载时清理定时器
onUnmounted(() => {
  cleanup()
})

// 当音频的播放时间更新时触发
const handleTimeUpdate = (event) => {
  playerStore.currentTime = event.target.currentTime
}

// 当音频的元数据加载完成后触发
const handleLoadedMetadata = (event) => {
  playerStore.duration = event.target.duration
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
  console.log("歌曲播放结束");
  playerStore.isPlaying = false;
  playerStore.nextSong();
}



const handlePlay = async () => {
  if (!player.value || !playerStore.songUrl) {
    console.error('播放器实例或歌曲URL为空！')
    return
  }

  try {
    // 直接根据 audio 元素的 paused 状态来决定操作
    if (player.value.paused) {
      await player.value.play()
    } else {
      player.value.pause()
    }
  } catch (err) {
    console.error('播放/暂停操作失败', err)
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
          console.log('新歌曲已自动播放');
        } catch (error) {
          console.error("新歌曲自动播放失败:", error);
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
  bottom: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 专辑封面样式 */
.album-cover {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-image:hover {
  transform: scale(1.05);
}

/* 歌曲信息样式 */
.song-info {
  margin-left: 16px;
  flex-shrink: 0;
  min-width: 200px;
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
  margin: 0 20px;
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
  width: 40px;
  height: 40px;
}

.prev-btn svg,
.next-btn svg {
  width: 20px;
  height: 20px;
}

.play-btn {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 8px;
}

.play-btn svg {
  width: 24px;
  height: 24px;
}

.play-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* 进度条区域 */
.progress-area {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 500px;
  gap: 12px;
}

.time {
  font-size: 12px;
  opacity: 0.8;
  min-width: 35px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #808080;
  border-radius: 2px;
  /* width: 60%; */
  transition: width 0.1s ease;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  /* left: 30%; */
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

/* 音量控制样式 */
.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  flex-shrink: 0;
}

.volume-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  width: 64px;
  height: 64px;
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
  width: 18px;
  height: 18px;
}

.volume-slider {
  width: 80px;
  height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.volume-track {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1.5px;
  position: relative;
  overflow: hidden;
}

.volume-fill {
  height: 100%;
  background: #808080;
  border-radius: 1.5px;
  width: 70%;
  transition: width 0.1s ease;
}

.volume-thumb {
  position: absolute;
  top: 50%;
  left: 70%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.volume-slider:hover .volume-thumb {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #MusicPlayer {
    padding: 0 12px;
  }

  .song-info {
    min-width: 150px;
    margin-left: 12px;
  }

  .song-title {
    font-size: 14px;
  }

  .artist-name {
    font-size: 12px;
  }

  .controls {
    margin: 0 12px;
  }

  .progress-area {
    max-width: 300px;
  }

  .volume-control {
    min-width: 100px;
  }

  .volume-slider {
    width: 60px;
  }
}

@media (max-width: 480px) {
  .volume-control {
    display: none;
  }

  .song-info {
    min-width: 120px;
  }

  .progress-area {
    max-width: 200px;
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
