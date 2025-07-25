<template>
  <div id="MusicPlayer">
    <!-- 专辑封面 -->
    <div class="album-cover">
      <img src="" alt="专辑封面" class="cover-image">
    </div>

    <!-- 歌曲信息 -->
    <div class="song-info">
      <div class="song-title">歌曲名称</div>
      <div class="artist-name">艺术家</div>
    </div>

    <!-- 播放控制区域 -->
    <div class="controls">
      <!-- 播放按钮组 -->
      <div class="control-buttons">
        <button class="control-btn prev-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button class="control-btn play-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" class="play-icon">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" class="pause-icon" style="display: none;">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>

        <button class="control-btn next-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      <!-- 进度条区域 -->
      <div class="progress-area">
        <span class="time current-time">0:00</span>
        <div class="progress-bar">
          <div class="progress-track">
            <div class="progress-fill"></div>
            <div class="progress-thumb"></div>
          </div>
        </div>
        <span class="time total-time">3:45</span>
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

    <audio ref="player" display="none"></audio>
  </div>
</template>

<script setup>

</script>

<style scoped>
/* 主容器样式 */
#MusicPlayer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(20px);
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
  background: linear-gradient(90deg, #ff6b6b, #feca57);
  border-radius: 2px;
  width: 30%;
  transition: width 0.1s ease;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  left: 30%;
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
  width: 36px;
  height: 36px;
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
  background: linear-gradient(90deg, #ff6b6b, #feca57);
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
</style>
