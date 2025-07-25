import { ref } from 'vue'
import { projectAuth } from '@/firebase/config'

const user = ref(projectAuth.currentUser)

projectAuth.onAuthStateChanged((_user) => {
  console.log('the user state has been changed, the user data is :', _user)
  user.value = _user
})

const getUser = () => {
  return { user }
}

export { getUser }
