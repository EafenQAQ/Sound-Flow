import {ref} from 'vue';
import { projectFirestore } from '@/firebase/config';

const useCollection = (collection) => {
  const error = ref(null)

  const addDoc = async (doc) => {

    try {
      error.value = null;
      await projectFirestore.collection(collection).add(doc)
      if (!error.value) {
        console.log('发送data成功:', doc)
      }
    } catch(err) {
      console.error(err.message)
      error.value = '无法发送消息'
    }

  }
  return {error, addDoc}
}

export default useCollection
