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
      <RouterLink :to="{ name: 'home' }"><button>登出</button></RouterLink>



    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';


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
</style>
