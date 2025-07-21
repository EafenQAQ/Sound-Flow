import { ref } from 'vue'
import { projectFirestore } from '@/firebase/config'

const error = ref(null)
const isPending = ref(false)

const useDocument = (collection, id) => {
  const updateDoc = async (newData) => {
    try {
      error.value = null
      isPending.value = true
      await projectFirestore.collection(collection).doc(id).update(newData)
      console.log('更新成功', newData)
      isPending.value = false
    } catch (err) {
      console.error(err.message)
      error.value = '无法更新doc'
      isPending.value = false
    }
  }

  return { error, isPending, updateDoc }
}

export default useDocument
