import { projectAuth } from '@/firebase/config'
import { ref } from 'vue'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

const error = ref(null)
const isPending = ref(false)

const signup = async (email, password, displayName) => {
  error.value = null
  isPending.value = true
  try {
    const res = await createUserWithEmailAndPassword(projectAuth, email, password)
    console.log('注册：返回的res是', res.user)
    if (!res.user) {
      throw new Error('注册失败')
    }
    await updateProfile(res.user, { displayName })
    error.value = null
    isPending.value = false
  } catch (err) {
    console.error(err.message)
    error.value = err.message
    isPending.value = false
  }
}

const useSignup = () => {
  return { error, signup, isPending }
}

export { useSignup }
