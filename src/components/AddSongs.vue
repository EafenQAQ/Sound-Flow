<template>
  <Teleport to="body">
    <Transition name="modal">
      <div @click.self="$emit('close')" class="modal-overlay">
        <div class="modal-content">
          <form @submit.prevent="handleSubmit" class="song-form">
            <button type="button" @click="$emit('close')" class="close-btn">X</button>
            <input type="text" placeholder="歌曲名" required v-model="title" />
            <input type="text" placeholder="歌手名" required v-model="artist" />
            <input @change="handleChange" type="file" accept="audio/*" required />
            <div class="error">{{ fileError }}</div>
            <div class="button-group">
              <button v-if="!isPending" type="submit" class="submit-btn">添加歌曲</button>
              <button v-if="isPending" disabled style="cursor: not-allowed">Loading...</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import useDocument from '@/composables/useDocument'
import useStorage from '@/composables/useStorage'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  document: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])

// ESC 键关闭
const handleKeydown = (e) => {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

const title = ref(null)
const artist = ref(null)

const fileError = ref(null)
const song = ref(null)

const { error, isPending, updateDocument } = useDocument('playlists', props.document.id)
const { filePath, url, uploadSong } = useStorage()

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
  if (!song.value) return
  isPending.value = true
  await uploadSong(song.value, props.document.id) //上传歌曲文件到Storage

  // 上传歌曲信息到数据库
  const newSong = {
    title: title.value,
    artist: artist.value,
    id: Math.floor(Math.random() * 1000000),
    filePath: filePath.value,
    songUrl: url.value,
  }
  await updateDocument({
    songs: [...props.document.songs, newSong],
  })

  isPending.value = false
  if (!error.value) {
    emit('close')
    title.value = null
    artist.value = null
    console.log('updateDocument方法，修改的数据是：', props.document.songs)
  }
}
</script>

<style scoped>
/* Transition 动画 */
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from .modal-content {
  transform: translateY(-20px);
  opacity: 0;
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to .modal-content {
  transform: translateY(-20px);
  opacity: 0;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 80vh;
  overflow-y: auto;
}
.modal-overlay h2 {
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
  padding: 4px 10px;
  font-size: 1.1rem;
  font-weight: 600;
  background: var(--secondary);
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 1px 2px 3px rgba(50, 50, 50, 0.05);
  scale: 1.1;
}

.add-song-btn:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 1px 4px 8px rgba(50, 50, 50, 0.15);
}

/* 表单样式 */
.song-form {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 1px 2px 3px rgba(50, 50, 50, 0.05);
  border: 1px solid var(--secondary);
  background: white;
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
.song-form .submit-btn {
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
.song-form .close-btn {
  background: var(--secondary);
  color: var(--primary);
  position: absolute;
  right: 4px;
  top: 4px;
  padding: 4px 10px;
}

.close-btn:hover {
  background: var(--warning);
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-overlay {
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
