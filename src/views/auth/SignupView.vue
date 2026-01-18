<template>
  <div class="signup-container container">
    <div class="auth-container">
      <div class="logo-section">
        <img src="@/assets/logo/logo.webp" alt="Sound-Flow Logo" class="logo" />
        <div class="welcome-text">欢迎!</div>
      </div>
      <div class="form-section">
        <form @submit.prevent="handleSubmit">
          <h2>注册</h2>
          <div class="form-group">
            <label>用户名</label>
            <input type="text" placeholder="输入用户名" v-model="displayName" required />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input type="text" placeholder="输入邮箱" v-model="email" required />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" placeholder="输入密码" v-model="password" required />
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <input type="password" placeholder="确认密码" v-model="confirmPassword" required />
          </div>
          <div class="error" v-if="error">{{ error }}</div>
          <div class="success" v-if="success">{{ success }}</div>
          <button v-if="!isPending" class="submit-btn">注册</button>
          <button v-if="isPending" disabled class="submit-btn loading">
            <span class="loading-spinner"></span>
            Loading...
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSignup } from '@/composables/useSignup'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 5rem;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-width: 1000px;
  width: 100%;
}

.form-section {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--secondary);
  padding: 2rem;
  gap: 1.5rem;
}

.logo {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 10px;
}

.welcome-text {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 0.3s forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
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

/* 响应式布局 */
@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .logo-section {
    padding: 2rem 1.5rem;
    min-height: 200px;
  }

  .logo {
    width: 150px;
    height: 150px;
  }

  .welcome-text {
    font-size: 2.5rem;
  }

  .form-section {
    padding: 2rem 1.5rem;
  }

  h2 {
    display: none;
  }

  .form-group label {
    display: none;
  }
}

/* 移动端优化 */
@media (max-width: 640px) {
  .signup-container {
    padding: 1rem;
  }

  .auth-container {
    background-color: #fafafa;
    overflow: hidden;
    max-width: 1000px;
    width: 100%;
    box-shadow: 0 0 0 0;
  }

  .logo-section {
    padding: 1.5rem 1rem;
    min-height: 150px;
    background-color: #fafafa;
  }

  .logo {
    width: 120px;
    height: 120px;
  }

  .welcome-text {
    font-size: 2rem;
  }

  .form-section {
    padding: 1.5rem 1rem;
  }

  form {
    padding: 0;
  }

  h2 {
    display: none;
  }

  .form-group label {
    display: none;
  }
}
</style>
