import { supabase } from '@/supabase/config'
import { ref } from 'vue'

const error = ref()
const isPending = ref(false)

const login = async (email, password) => {
  error.value = null
  isPending.value = true
  try {
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) throw loginError

    console.log('登录成功:', data.user)
    error.value = null
    isPending.value = false
  } catch (err) {
    console.error(err.message)
    if (err.message.includes('Email not confirmed')) {
      error.value = '邮箱尚未验证，请查收验证邮件后重试'
    } else {
      error.value = '邮箱或密码错误'
    }
    isPending.value = false
  }
}

const useLogin = () => {
  return { error, login, isPending }
}

export { useLogin }
