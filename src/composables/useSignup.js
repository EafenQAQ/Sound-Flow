import { projectAuth } from '@/firebase/config'
import { ref } from 'vue'

const error = ref(null)

const signup = async (email, password, displayName) => {
  error.value = null
  try {
    const res = await projectAuth.createUserWithEmailAndPassword(email, password)
    console.log('注册：返回的res是', res.user)
    if (!res.user) {
      throw new Error('注册失败')
    }
    await projectAuth.currentUser.updateProfile({ displayName })
    error.value = null
  } catch (err) {
    console.error(err.message)
    error.value = err.message
  }
}

const useSignup = () => {
  return { error, signup }
}

export { useSignup }
