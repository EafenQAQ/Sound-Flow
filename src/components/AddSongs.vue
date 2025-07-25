<template>
  <div class="add-songs-container">


    <button v-if="!showForm" @click="showForm = true" class="add-song-btn">添加新歌曲</button>
    <form v-if="showForm" @submit.prevent="handleSubmit" class="song-form">
      <input type="text" placeholder="歌曲名" required v-model="title">
      <input type="text" placeholder="歌手名" required v-model="artist">
      <input @change="handleChange" type="file" accept="audio/*" required>
      <div class="error">{{ fileError }}</div>
      <div class="button-group">
        <button v-if="!isPending" type="submit" class="submit-btn">添加歌曲</button>
        <button v-if="isPending" disabled style="cursor: not-allowed;">Loading...</button>
        <button type="button" @click="showForm = false" class="close-btn">关闭</button>
      </div>

    </form>

  </div>
</template>

<script setup>

import useDocument from '@/composables/useDocument';
import useStorage from '@/composables/useStorage';
import { ref } from 'vue';

const props = defineProps({
  document: {
    type: Object,
    required: true,

  }
})

const showForm = ref(false)
const title = ref(null)
const artist = ref(null)

const fileError = ref(null)
const song = ref(null)

const { error, isPending, updateDoc } = useDocument('playlists', props.document.id)
const { filePath, url, error: uploadSongError, uploadSong } = useStorage()

const handleChange = (e) => {
  console.log('songFile:', e.target.files[0])
  const selected = e.target.files[0]
  if (selected && selected.type == 'audio/mpeg') {
    fileError.value = null
    song.value = selected
  } else {
    fileError.value = '请上传.mp3文件'
  }
}

const handleSubmit = async () => {
  if (!song.value) return;
  isPending.value = true
  await uploadSong(song.value, props.document.id) //上传歌曲文件到Storage

  // 上传歌曲信息到firestore
  const newSong = {
    title: title.value,
    artist: artist.value,
    id: Math.floor(Math.random() * 1000000),
    filePath: filePath.value,
    songUrl: url.value
  }
  await updateDoc({
    songs: [...props.document.songs, newSong]
  })

  isPending.value = false
  if (!error.value) {
    showForm.value = false
    title.value = null
    artist.value = null
    console.log('updateDoc方法，修改的数据是：', props.document.songs)
  }

}




</script>

<style scoped>
.add-songs-container {
  max-width: 600px;
  width: 100%;
  padding: 2rem;
}

.add-songs-container h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 700;
  font-size: 1.8rem;
  color: var(--primary);
}

/* 添加新歌曲按钮样式 */
.add-song-btn {
  display: block;
  margin: 0 auto 2rem auto;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: var(--secondary);
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 1px 2px 3px rgba(50, 50, 50, 0.05);
}

.add-song-btn:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 1px 4px 8px rgba(50, 50, 50, 0.15);
}

/* 表单样式 */
.song-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 1px 2px 3px rgba(50, 50, 50, 0.05);
  border: 1px solid var(--secondary);
  background: white;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 输入框样式 */
.song-form input {
  border: 0;
  border-bottom: 1px solid var(--secondary);
  padding: 12px 0;
  outline: none;
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin: 20px 0;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.song-form input:focus {
  border-bottom-color: var(--primary);
}

.song-form input::placeholder {
  color: #999;
  font-weight: 300;
}

/* 按钮容器 */
.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

/* 表单按钮样式 */
.song-form button {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

/* 添加歌曲按钮 */
.submit-btn {
  background: var(--primary);
  color: white;
}

.submit-btn:hover {
  background: #3a3c43;
  transform: translateY(-1px);
}

/* 关闭按钮 */
.close-btn {
  background: var(--secondary);
  color: var(--primary);
}

.close-btn:hover {
  background: var(--warning);
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .add-songs-container {
    padding: 1rem;
    margin: 1rem;
  }

  .song-form {
    padding: 1.5rem;
  }

  .button-group {
    flex-direction: column;
    gap: 0.5rem;
  }

  .song-form button {
    width: 100%;
  }
}

input[type='file'] {
  border: 1px dashed var(--secondary);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
}

input[type='file']:hover {
  border-color: var(--primary);
  background: #f0f0f0;
}

.forbid {
  /* 鼠标指针显示禁止 */
  cursor: not-allowed;
}
</style>
