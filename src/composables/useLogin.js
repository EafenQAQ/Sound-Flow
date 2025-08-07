import { ref } from 'vue'

const error = ref()
const isPending = ref(false)

const login = async (email, password) => {
  error.value = null
  isPending.value = true

  try {
    // 动态导入认证模块
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    const { projectAuth } = await import('@/firebase/config')

    const res = await signInWithEmailAndPassword(projectAuth, email, password)
    if (!res.user) {
      throw new Error('登录失败')
    }
    error.value = null
    isPending.value = false
  } catch (err) {
    error.value = '邮箱或密码错误'
    isPending.value = false
  }
}

const useLogin = () => {
  return { error, login, isPending }
}

export { useLogin }

