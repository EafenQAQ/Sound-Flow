import { supabase } from '@/supabase/config'
import { ref } from 'vue'

const error = ref(null)

const logout = async () => {
  error.value = null
  try {
    const { error: logoutError } = await supabase.auth.signOut()
    if (logoutError) throw logoutError
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
