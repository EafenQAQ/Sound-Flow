import { ref, computed } from 'vue'

const user = ref(null)

// 缓存用户登录状态

// 全局认证状态缓存
const authState = ref({
  user: null,
  isLoading: true,
  isInitialized: false,
  lastUpdate: 0,
})

let authUnsubscribe = null

// 初始化认证监听器（只执行一次）
const initAuthListener = async () => {
  if (authUnsubscribe) return

  // 动态导入firebase auth
  const { getProjectAuth } = await import('@/firebase/config')
  const { onAuthStateChanged } = await import('firebase/auth')

  const projectAuth = await getProjectAuth()

  authUnsubscribe = onAuthStateChanged(projectAuth, (_user) => {
    authState.value = {
      user: _user,
      isLoading: false,
      isInitialized: true,
      lastUpdate: Date.now(),
    }
    console.log('认证状态更新:', _user?.uid || '未登录')
    user.value = _user
  })
  user.value = projectAuth.currentUser
}

// 获取当前认证状态
const getCurrentUser = () => {
  // 如果已初始化，直接返回缓存的状态
  if (authState.value.isInitialized) {
    return Promise.resolve(authState.value.user)
  }

  // 如果未初始化，等待初始化完成
  return new Promise((resolve) => {
    const checkAuth = () => {
      if (authState.value.isInitialized) {
        resolve(authState.value.user)
      } else {
        setTimeout(checkAuth, 50)
      }
    }
    checkAuth()
  })
}

const getUser = () => {
  return {
    user,
    isLoading: computed(() => authState.value.isLoading),
    isInitialized: computed(() => authState.value.isInitialized),
  }
}

export { getUser, initAuthListener, getCurrentUser }
