import { ref } from 'vue'

const useCollection = (_collection) => {
  const error = ref(null)

  const addDocument = async (doc) => {
    try {
      // 动态导入 Firestore 模块
      const { collection, addDoc } = await import('firebase/firestore')
      const { getProjectFirestore } = await import('@/firebase/config')

      const projectFirestore = await getProjectFirestore()
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
