import { ref } from 'vue'

const error = ref(null)

const logout = async () => {
  error.value = null
  try {
    // 动态导入认证模块
    const { signOut } = await import('firebase/auth')
    const { getProjectAuth } = await import('@/firebase/config')

    const projectAuth = await getProjectAuth()
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
