import { ref, computed } from 'vue'
import { supabase } from '@/supabase/config'

// 全局认证状态
const user = ref(null)
const profile = ref(null)

const authState = ref({
  user: null,
  isLoading: true,
  isInitialized: false,
  lastUpdate: 0,
})

let authUnsubscribe = null

// 初始化认证监听器（只执行一次）
const initAuthListener = () => {
  if (authUnsubscribe) return

  // 获取当前会话
  supabase.auth.getSession().then(({ data: { session } }) => {
    const currentUser = session?.user ?? null
    authState.value = {
      user: currentUser,
      isLoading: false,
      isInitialized: true,
      lastUpdate: Date.now(),
    }
    user.value = currentUser

    // 如果已登录，获取用户资料
    if (currentUser) {
      fetchProfile(currentUser.id)
    }
  })

  // 监听认证状态变化
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    const currentUser = session?.user ?? null
    authState.value = {
      user: currentUser,
      isLoading: false,
      isInitialized: true,
      lastUpdate: Date.now(),
    }
    user.value = currentUser
    console.log('认证状态更新:', currentUser?.id || '未登录', '事件:', _event)

    // 登录时获取资料
    if (currentUser) {
      fetchProfile(currentUser.id)
    } else {
      profile.value = null
    }
  })

  authUnsubscribe = subscription
}

// 获取用户资料
const fetchProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    profile.value = data
  } catch (err) {
    console.error('获取用户资料失败:', err.message)
  }
}

// 获取当前认证状态
const getCurrentUser = () => {
  if (authState.value.isInitialized) {
    return Promise.resolve(authState.value.user)
  }

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
    profile,
    isLoading: computed(() => authState.value.isLoading),
    isInitialized: computed(() => authState.value.isInitialized),
  }
}

export { getUser, initAuthListener, getCurrentUser }
