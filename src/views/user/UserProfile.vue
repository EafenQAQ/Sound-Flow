<template>
  <div class="profile-container">
    <div class="profile-card fade-in-up">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-wrapper" @click="triggerAvatarUpload">
          <img :src="user.avatar || defaultAvatar" alt="用户头像" class="avatar-img" />
          <div class="avatar-overlay">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>更换头像</span>
          </div>
        </div>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="avatar-input"
          @change="handleAvatarChange"
        />
      </div>

      <!-- 用户信息区域 -->
      <div class="user-info-section">
        <div class="info-header">
          <h1 class="username">{{ user.nickname || '未设置昵称' }}</h1>
          <span class="user-id">ID: {{ user.id || '000000' }}</span>
        </div>

        <div class="bio-section">
          <p class="bio-text">{{ user.bio || '这个人很懒，还没有写简介~' }}</p>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <div class="stat-item" v-for="stat in stats" :key="stat.label">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section fade-in-up" style="animation-delay: 0.1s">
      <h3 class="section-title">个人设置</h3>
      <div class="menu-list">
        <div class="menu-item" v-for="item in menuItems" :key="item.label" @click="item.action">
          <div class="menu-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path :d="item.iconPath" />
            </svg>
          </div>
          <span class="menu-label">{{ item.label }}</span>
          <svg
            class="menu-arrow"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 默认头像
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'

// 用户信息（mock 数据）
const user = reactive({
  id: '884567',
  nickname: '音乐爱好者',
  avatar: '',
  bio: '热爱音乐，热爱生活。喜欢听各种风格的音乐，尤其喜欢独立音乐和电子音乐。',
})

// 统计数据
const stats = ref([
  { label: '创建歌单', value: 12 },
  { label: '收藏歌曲', value: 328 },
  { label: '关注', value: 56 },
  { label: '粉丝', value: 23 },
])

// 菜单项
const menuItems = ref([
  {
    label: '编辑资料',
    iconPath: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
    action: () => console.log('编辑资料'),
  },
  {
    label: '修改密码',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    action: () => console.log('修改密码'),
  },
  {
    label: '通知设置',
    iconPath: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9',
    action: () => console.log('通知设置'),
  },
  {
    label: '退出登录',
    iconPath: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    action: () => console.log('退出登录'),
  },
])

// --------------------
// 压缩用户上传的头像图片
// --------------------

const avatarInput = ref(null)

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0]
  if (file) {
    console.log('选择的文件:', file)

    const buffer = await file.arrayBuffer()

    console.log(`原始文件大小: ${buffer.byteLength} 字节`)

    // 压缩图片
    const resultUrl = await compressImage(file)
    // 预览图片

    user.avatar = resultUrl
  }
}

const compressImage = async (fileBlob, multiples = 4) => {
  const img = new Image()
  img.src = URL.createObjectURL(fileBlob)

  // 等图片加载之后再压缩
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = () => reject(new Error('图片加载失败，请检查文件格式'))
  })
  // 清除强引用防止内存泄露
  URL.revokeObjectURL(img.src)

  // ---**压缩关键逻辑**---
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = img.width / multiples
  canvas.height = img.height / multiples
  // 将图片画到画布上
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // 获取内存中的像素数组 (Uint8ClampedArray)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  console.log('当前内存中的像素字节流:', imageData.data)

  // 重编码
  return await exportBlob(canvas)
}

const exportBlob = (canvas) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas 导出 Blob 失败'))
          return
        }
        console.log(`压缩完成：${(blob.size / 1024).toFixed(2)} KB`)
        const previewUrl = URL.createObjectURL(blob)
        resolve(previewUrl)
      },
      'image/webp',
      0.6,
    )
  })
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 100px 20px 40px;
  min-height: 100vh;
}

/* 主卡片 */
.profile-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

/* 头像区域 */
.avatar-section {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 12px;
  gap: 4px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-input {
  display: none;
}

/* 用户信息区域 */
.user-info-section {
  flex: 1;
  min-width: 0;
}

.info-header {
  margin-bottom: 12px;
}

.username {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.user-id {
  font-size: 13px;
  color: #999;
}

.bio-section {
  margin-bottom: 24px;
}

.bio-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 统计信息 */
.stats-section {
  display: flex;
  gap: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--secondary);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* 菜单区域 */
.menu-section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 16px;
  padding-left: 8px;
}

.menu-list {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid var(--secondary);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #fafafa;
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  color: var(--primary);
}

.menu-label {
  flex: 1;
  font-size: 15px;
  color: var(--primary);
  font-weight: 500;
}

.menu-arrow {
  color: #ccc;
}

/* 响应式适配 */
@media (max-width: 640px) {
  .profile-container {
    padding: 80px 16px 24px;
  }

  .profile-card {
    flex-direction: column;
    align-items: center;
    padding: 32px 24px;
    gap: 24px;
  }

  .avatar-wrapper {
    width: 100px;
    height: 100px;
  }

  .user-info-section {
    text-align: center;
  }

  .username {
    font-size: 24px;
  }

  .bio-section {
    margin-bottom: 20px;
  }

  .stats-section {
    justify-content: center;
    gap: 24px;
    padding-top: 16px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 11px;
  }

  .section-title {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .menu-item {
    padding: 14px 16px;
  }

  .menu-icon {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }

  .menu-label {
    font-size: 14px;
  }
}
</style>
