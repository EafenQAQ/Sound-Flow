import { supabase } from '@/supabase/config'
import { ref } from 'vue'

const error = ref(null)
const isPending = ref(false)
const needsEmailConfirmation = ref(false)

const signup = async (email, password, displayName) => {
  error.value = null
  isPending.value = true
  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (signUpError) throw signUpError

    console.log('注册成功:', data.user)
    // Supabase 默认需要邮箱验证，data.session 为 null 表示需要确认邮箱
    if (!data.session) {
      needsEmailConfirmation.value = true
    }
    error.value = null
    isPending.value = false
  } catch (err) {
    console.error(err.message)
    // 友好化错误信息
    if (err.message.includes('already registered')) {
      error.value = '该邮箱已被注册'
    } else if (err.message.includes('password')) {
      error.value = '密码长度至少6位'
    } else {
      error.value = err.message
    }
    isPending.value = false
  }
}

const useSignup = () => {
  return { error, signup, isPending, needsEmailConfirmation }
}

export { useSignup }
