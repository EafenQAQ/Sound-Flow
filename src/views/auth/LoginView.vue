<template>
  <form @submit.prevent="handleSubmit">
    <h2>登录</h2>
    <label>邮箱</label>
    <input type="email" placeholder="输入邮箱" v-model="email" required>
    <label>密码</label>
    <input type="password" placeholder="输入密码" v-model="password" required>
    <div class="error" v-if="error">{{ error }}</div>
    <div class="success" v-if="success">{{ success }}</div>
    <button v-if="!isPending">登录</button>
    <button v-if="isPending" disabled>Loading...</button>
  </form>
</template>

<script setup>
import { useLogin } from '@/composables/useLogin';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref(null)
const password = ref(null)
const success = ref(null)
const router = useRouter()
const { error, login, isPending } = useLogin()

const handleSubmit = async () => {
  await login(email.value, password.value)
  if (!error.value) {
    console.log('登录成功')
    success.value = '登录成功 ✔'
    router.push({ name: 'home' })
  }
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
</style>
