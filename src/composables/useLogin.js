import { ref } from 'vue'
import { projectAuth } from '@/firebase/config'

const error = ref()

const login = async (email, password) => {
  error.value = null
  try {
    const res = await projectAuth.signInWithEmailAndPassword(email, password)
    console.log('登录：返回的res是', res.user)
    if (!res.user) {
      throw new Error('登录失败')
    }
    error.value = null
  } catch (err) {
    console.error(err.message)
    error.value = '邮箱或密码错误'
  }
}

const useLogin = () => {
  return { error, login }
}

export { useLogin }
