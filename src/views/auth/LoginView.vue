<template>
  <div class="login-container container">
    <form @submit.prevent="handleSubmit" class="fade-in-up">
      <h2>登录</h2>
      <div class="form-group">
        <label>邮箱</label>
        <input type="email" placeholder="输入邮箱" v-model="email" required>
      </div>
      <div class="form-group">
        <label>密码</label>
        <input type="password" placeholder="输入密码" v-model="password" required>
      </div>

      <Transition name="fade" mode="out-in">
        <div class="error" v-if="error">{{ error }}</div>
      </Transition>

      <Transition name="fade" mode="out-in">
        <div class="success" v-if="success">{{ success }}</div>
      </Transition>

      <button v-if="!isPending" type="submit" class="submit-btn">登录</button>
      <button v-if="isPending" disabled class="submit-btn loading">
        <span class="loading-spinner"></span>
        登录中...
      </button>
    </form>
  </div>
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 0;
}

form {
  width: 100%;
  max-width: 400px;
  opacity: 0;
  animation-fill-mode: forwards;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--primary);
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--secondary);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-group input:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 81, 90, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  margin: 2rem 0 0 0;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: hsl(from var(--primary) h s calc(l - 10));
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error,
.success {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
  font-weight: 500;
}

.error {
  background: rgba(218, 15, 65, 0.1);
  color: var(--warning);
  border: 1px solid rgba(218, 15, 65, 0.2);
}

.success {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

/* 移动端优化 */
@media (max-width: 640px) {
  .login-container {
    padding: 1rem;
  }

  form {
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.75rem;
  }
}
</style>
