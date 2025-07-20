<template>
  <div id="CreatePlaylist">
    <form @submit.prevent="handleSubmit">
      <h2>创建歌单</h2>
      <label>标题</label>
      <input type="text" placeholder="请输入歌单标题" required v-model="title">
      <label>歌单介绍</label>
      <textarea placeholder="请输入歌单介绍" required v-model="description"></textarea>
      <label>上传封面图</label>
      <input @change="handleChange" type="file" accept="image/*" required>
      <p class="error">{{ fileError }}</p>
      <button v-if="!isPending" type="submit">创建歌单</button>
      <button v-if="isPending" disabled>Loading...</button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
    </form>
  </div>
</template>

<script setup>
import { getUser } from '@/composables/getUser';
import useCollection from '@/composables/useCollection';
import useStorage from '@/composables/useStorage';
import { timestamp } from '@/firebase/config';
import { ref, watch } from 'vue';

// 获取用户登录状态
const { user } = getUser()

const title = ref('')
const description = ref('')
const cover = ref(null)
const allowedTypes = ref(['image/png', 'image/jpeg', 'image/gif'])
const fileError = ref(null)
const isPending = ref(false)
const success = ref('')

const handleChange = (e) => {
  const selected = e.target.files[0]
  if (selected && allowedTypes.value.includes(selected.type)) {
    fileError.value = null
    console.log(selected)
    cover.value = selected
  } else {
    cover.value = null
    fileError.value = '文件类型不符合要求! 请上传png/jpeg/gif格式的图片'
    console.error(fileError.value)
  }

}

const { url, filePath, uploadImage } = useStorage()
const { error, addDoc } = useCollection('playlists')

const handleSubmit = async () => {
  if (cover.value) {
    isPending.value = true
    await uploadImage(cover.value)
    await addDoc({
      title: title.value,
      description: description.value,
      userId: user.value.uid,
      userName: user.value.displayName,
      coverUrl: url.value,
      filePath: filePath.value,
      songs: [],
      createdAt: timestamp(),
    })


  } else {
    fileError.value = "请上传图片文件！"
    console.error('没有按要求上传文件')
  }

  if (!error.value) {
    console.log('歌单创建成功')
    success.value = '创建成功！'
  }
  isPending.value = false
}


</script>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 2rem;
}

form button {
  padding: 1rem 6rem;
  font-size: 1rem;
  /* 居中 */
  margin: 2rem auto 0 auto;
  display: block;
}

/* 文件上传输入框的特殊样式 */
input[type="file"] {
  border: 1px dashed var(--secondary);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
}

input[type="file"]:hover {
  border-color: var(--primary);
  background: #f0f0f0;
}

/* 调整textarea的高度 */
textarea {
  min-height: 100px;
  resize: vertical;
}

/* 标签样式 */
label {
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
  color: var(--primary);
}
</style>
