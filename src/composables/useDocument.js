import { ref } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { projectFirestore } from '@/firebase/config'

const error = ref(null)
const isPending = ref(false)

const useDocument = (collection, id) => {
  const updateDocument = async (newData) => {
    try {
      error.value = null
      isPending.value = true
      await updateDoc(doc(projectFirestore, collection, id), newData)
      console.log('更新成功', newData)
      isPending.value = false
    } catch (err) {
      console.error(err.message)
      error.value = '无法更新doc'
      isPending.value = false
    }
  }

  return { error, isPending, updateDocument }
}

export default useDocument
