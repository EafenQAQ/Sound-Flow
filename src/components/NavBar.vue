<template>
  <div id="NavBar" class="nav-container">
    <div class="logo">
      <img src="@/assets/logo/logo.webp" width="100" alt="logo加载失败">
      <RouterLink :to="{ name: 'home' }">
        <h1>Sound FLow</h1>
      </RouterLink>
    </div>

    <div class="btn-container">
      <RouterLink :to="{ name: 'login' }"><button>登录</button></RouterLink>
      <RouterLink :to="{ name: 'signup' }"><button>注册</button></RouterLink>

      <div class="logout-group">
        <button @click="handleLogout">登出</button>
        <Transition name="fade" mode="out-in">
          <p v-if="success" class="success">{{ success }}</p>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLogout } from '@/composables/useLogout';
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const { error, logout } = useLogout()
const success = ref(null)
const router = useRouter()

const handleLogout = async () => {
  await logout()
  if (!error.value) {
    success.value = '登出成功！'
    setTimeout(() => {
      success.value = null
      router.push({ name: 'home' })

    }, 2000
    )
  }
}


</script>

<style scoped>
.nav-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 1.5rem 3rem;
  box-shadow: -8px 4px 10px rgba(0, 0, 0, 0.05);
}

.btn-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-container button {
  padding: 1rem 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

img {
  border-radius: 50%;
}



.logout-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  height: 100%;
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
</style>
