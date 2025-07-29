import { ref, watchEffect } from 'vue'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { projectFirestore } from '@/firebase/config'

const getCollection = (_collection, _query) => {
  const error = ref(null)
  const documents = ref([])

  let collectionRef = query(collection(projectFirestore, _collection), orderBy('createdAt', 'desc'))

  // 如果有查询参数，则引入查询参数
  if (_query) {
    collectionRef = query(
      collection(projectFirestore, _collection),
      where('userId', '==', _query),
      orderBy('createdAt', 'desc'),
    )
  }

  const unsubscribe = onSnapshot(
    collectionRef,
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
