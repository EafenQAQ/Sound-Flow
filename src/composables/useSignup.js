import { ref } from 'vue'

const error = ref(null)
const isPending = ref(false)

const signup = async (email, password, displayName) => {
  error.value = null
  isPending.value = true

  try {
    // 动态导入认证模块
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
    const { projectAuth } = await import('@/firebase/config')

    const res = await createUserWithEmailAndPassword(projectAuth, email, password)
    if (!res.user) {
      throw new Error('注册失败')
    }
    await updateProfile(res.user, { displayName })
    error.value = null
    isPending.value = false
  } catch (err) {
    error.value = err.message
    isPending.value = false
  }
}

const useSignup = () => {
  return { error, signup, isPending }
}

export { useSignup }

