<template>
  <div id="NavBar" class="nav-container">
    <div class="logo">
      <img src="@/assets/logo/logo.webp" width="100" alt="logo加载失败">
      <RouterLink :to="{ name: 'home' }">
        <h1>Sound FLow</h1>
      </RouterLink>
    </div>

    <!-- 移动端汉堡菜单按钮 -->
    <button class="mobile-menu-btn" @click="toggleMobileMenu">
      <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
      <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
      <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
    </button>

    <!-- 桌面端导航菜单 -->
    <div class="btn-container" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
      <template v-if="!user">
        <RouterLink :to="{ name: 'login' }" @click="closeMobileMenu"><button>登录</button></RouterLink>
        <RouterLink :to="{ name: 'signup' }" @click="closeMobileMenu"><button>注册</button></RouterLink>
      </template>

      <template v-else>
        <RouterLink :to="{ name: 'createPlaylist' }" @click="closeMobileMenu">创建歌单</RouterLink>
        <RouterLink :to="{ name: 'userPlaylist', params: { userId: user.uid } }" @click="closeMobileMenu">我的歌单
        </RouterLink>
        <RouterLink :to="{ name: 'playlistManager' }" @click="closeMobileMenu">歌单管理</RouterLink>
        <div class="greeting">
          <p>Hi! {{ user.displayName }}</p>
        </div>
      </template>
      <button v-if="user" @click="handleLogout">登出</button>

      <Transition name="fade" mode="out-in">
        <p v-if="success" class="success">{{ success }}</p>
      </Transition>
    </div>

    <!-- 移动端菜单遮罩 -->
    <div v-if="isMobileMenuOpen" class="mobile-menu-overlay" @click="closeMobileMenu"></div>
  </div>
</template>

<script setup>
import { getUser } from '@/composables/getUser';
import { useLogout } from '@/composables/useLogout';
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const { error, logout } = useLogout()
const success = ref(null)
const router = useRouter()

// user state
const { user } = getUser()

// 移动端菜单状态
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogout = async () => {
  await logout()
  closeMobileMenu() // 登出时关闭移动端菜单
  if (!error.value) {
    success.value = '登出成功！'
    setTimeout(() => {
      success.value = null
      router.push({ name: 'login' })
    }, 2000)
  }
}

</script>

<style scoped>
.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1.5rem 3rem;
  box-shadow: -8px 4px 10px rgba(0, 0, 0, 0.05);
  position: relative;
}

@media (max-width: 767px) {
  .nav-container {
    padding: 1rem 1.5rem;
  }
}

.btn-container {
  display: none;
  align-items: center;
  gap: 1rem;
  position: relative;
}

@media (min-width: 768px) {
  .btn-container {
    display: flex;
  }
}

/* 移动端菜单样式 */
@media (max-width: 767px) {
  .btn-container.mobile-menu-open {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;
    height: 100vh;
    background: white;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    padding: 2rem 1.5rem;
    z-index: 1000;
    transform: translateX(0);
    transition: transform 0.3s ease-in-out;
    align-items: flex-start;
    gap: 1.5rem;
    padding-top: 4rem;
  }

  .btn-container:not(.mobile-menu-open) {
    transform: translateX(100%);
  }
}

.btn-container button {
  padding: 1rem 2rem;
}

@media (max-width: 767px) {
  .btn-container button {
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 767px) {
  .logo img {
    width: 60px;
  }

  .logo h1 {
    font-size: 1.25rem;
  }
}

img {
  border-radius: 50%;
}

/* 汉堡菜单按钮 */
.mobile-menu-btn {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

@media (min-width: 768px) {
  .mobile-menu-btn {
    display: none;
  }
}

.hamburger-line {
  width: 2rem;
  height: 0.25rem;
  background: var(--primary);
  border-radius: 10px;
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
}

.hamburger-line.active:nth-child(1) {
  transform: rotate(45deg);
}

.hamburger-line.active:nth-child(2) {
  opacity: 0;
  transform: translateX(20px);
}

.hamburger-line.active:nth-child(3) {
  transform: rotate(-45deg);
}

/* 移动端菜单遮罩 */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease-in-out;
}

@media (min-width: 768px) {
  .mobile-menu-overlay {
    display: none;
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

.success {
  /* 让success标语出现在logout键下面 */
  position: absolute;
  bottom: 0%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.9rem;
  width: 100%;
}

@media (max-width: 767px) {
  .success {
    position: static;
    transform: none;
    width: auto;
    margin-top: 1rem;
  }
}

.greeting {
  border-left: 1px solid hsl(from var(--secondary) h s calc(l - 20));
  padding-left: 1rem;
  margin-left: 1rem;
}

@media (max-width: 767px) {
  .greeting {
    border-left: none;
    border-top: 1px solid hsl(from var(--secondary) h s calc(l - 20));
    padding-left: 0;
    padding-top: 1rem;
    margin-left: 0;
    margin-top: 1rem;
    width: 100%;
  }
}

/* 移动端链接样式 */
@media (max-width: 767px) {
  .btn-container a {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .btn-container a:hover {
    background: var(--secondary);
  }
}
</style>
