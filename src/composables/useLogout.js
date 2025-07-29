import { ref } from 'vue'
import { signOut } from 'firebase/auth'
import { projectAuth } from '@/firebase/config'

const error = ref(null)

const logout = async () => {
  error.value = null
  try {
    await signOut(projectAuth)
    error.value = null
  } catch (err) {
    console.error(err.message)
    error.value = '用户登出失败'
  }
}

const useLogout = () => {
  return { error, logout }
}

export { useLogout }
