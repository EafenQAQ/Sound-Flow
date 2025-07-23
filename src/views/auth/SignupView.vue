<template>
  <form @submit.prevent="handleSubmit">
    <h2>注册</h2>
    <label>用户名</label>
    <input type="text" placeholder="输入用户名" v-model="displayName" required>
    <label>邮箱</label>
    <input type="text" placeholder="输入邮箱" v-model="email" required>
    <label>密码</label>
    <input type="password" placeholder="输入密码" v-model="password" required>
    <label>确认密码</label>
    <input type="password" placeholder="确认密码" v-model="confirmPassword" required>
    <div class="error" v-if="error">{{ error }}</div>
    <div class="success" v-if="success">{{ success }}</div>
    <button v-if="!isPending">注册</button>
    <button v-if="isPending" disabled>Loading...</button>
  </form>
</template>

<script setup>
import { useSignup } from '@/composables/useSignup';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref(null)
const password = ref(null)
const confirmPassword = ref(null)
const displayName = ref(null)
const success = ref(null)
const { error, signup, isPending } = useSignup()

const router = useRouter()

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    console.log('两次输入的密码不一致')
    error.value = '两次输入的密码不一致'
    return
  }

  await signup(email.value, password.value, displayName.value)
  if (!error.value) {
    console.log('注册成功')
    success.value = '注册成功 ✔'
    // 为跳转设定延迟以让“注册成功”停留
    setTimeout(() => {
      success.value = null
      router.push({ name: 'login' })
    }, 2000)

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
