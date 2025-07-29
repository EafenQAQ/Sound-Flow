import { ref } from 'vue'
import { collection, addDoc } from 'firebase/firestore'
import { projectFirestore } from '@/firebase/config'

const useCollection = (_collection) => {
  const error = ref(null)

  const addDocument = async (doc) => {
    try {
      error.value = null
      const res = await addDoc(collection(projectFirestore, _collection), doc)
      if (!error.value) {
        console.log('发送data成功:', doc)
      }
      return res
    } catch (err) {
      console.error(err.message)
      error.value = '无法发送消息'
    }
  }
  return { error, addDocument }
}

export default useCollection
