import { ref } from 'vue'
import { projectFirestore } from '@/firebase/config'

const useCollection = (_collection) => {
  const error = ref(null)

  const addDocument = async (doc) => {
    // 动态导入fireStore
    const { collection, addDoc } = await import('firebase/firestore')

    try {
      error.value = null
      const res = await addDoc(collection(projectFirestore, _collection), doc)
      return res
    } catch (err) {
      error.value = '无法发送消息'
    }
  }

  return { error, addDocument }
}

export default useCollection
