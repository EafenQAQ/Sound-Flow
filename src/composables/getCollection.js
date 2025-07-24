import { ref, watchEffect } from 'vue'
import { projectFirestore } from '@/firebase/config'
import { getUser } from '@/composables/getUser'

const getCollection = (collection, query) => {
  const error = ref(null)
  const documents = ref([])
  const { user } = getUser()

  let collectionRef = projectFirestore.collection(collection).orderBy('createdAt', 'desc')

  // 如果有查询参数，则引入查询参数
  if (query) {
    collectionRef = projectFirestore
      .collection(collection)
      .where('userId', '==', query)
      .orderBy('createdAt', 'desc')
  }

  const unsubscribe = collectionRef.onSnapshot(
    (snap) => {
      let results = []
      snap.docs.forEach((doc) => {
        doc.data().createdAt && results.push({ ...doc.data(), id: doc.id })
        documents.value = results
        error.value = null
      })
    },
    (err) => {
      console.error(err.message)
      error.value = '获取数据失败'
      documents.value = []
    },
  )

  // 断开snapshot链接
  watchEffect((onInvalidate) => {
    onInvalidate(() => {
      unsubscribe()
    })
  })

  return { error, documents }
}

export default getCollection
