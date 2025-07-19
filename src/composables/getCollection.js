import { ref, watchEffect } from 'vue'
import { projectFirestore } from '@/firebase/config'

const getCollection = (collection) => {
  const error = ref(null)
  const documents = ref([])

  const unsubscribe = projectFirestore
    .collection(collection)
    .orderBy('createdAt')
    .onSnapshot((snap) => {
      console.log('snapshot')
      let results = []
      snap.docs.forEach((doc) => {
        doc.data().createdAt && results.push({ ...doc.data(), id: doc.id })
        documents.value = results
        error.value = null
      })
    }, (err) => {
      console.error(err.message)
      error.value = "获取数据失败"
      documents.value = []
    }
    )

    // 断开snapshot链接
    watchEffect((onInvalidate) => {
      onInvalidate(() => {
        unsubscribe()
      }
      )
    }
    )

  return { error, documents }
}

export default getCollection
