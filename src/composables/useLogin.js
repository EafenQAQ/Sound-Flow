import { ref } from 'vue'
import { projectAuth } from '@/firebase/config'

const error = ref()
const isPending = ref(false)

const login = async (email, password) => {
  error.value = null
  isPending.value = true
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    const res = await signInWithEmailAndPassword(projectAuth, email, password)
    console.log('登录：返回的res是', res.user)
    if (!res.user) {
      throw new Error('登录失败')
    }
    error.value = null
    isPending.value = false
  } catch (err) {
    console.error(err.message)
    error.value = '邮箱或密码错误'
    isPending.value = false
  }
}

const useLogin = () => {
  return { error, login, isPending }
}

export { useLogin }
