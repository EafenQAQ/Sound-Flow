import { ref, watchEffect } from 'vue'

const getCollection = (_collection, _query) => {
  const error = ref(null)
  const documents = ref([])
  const unsubscribe = ref(null)

  const startFirebaseListener = async () => {
    // 动态导入
    const { collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore')
    const { getProjectFirestore } = await import('@/firebase/config')

    const projectFirestore = await getProjectFirestore()

    let collectionRef = query(
      collection(projectFirestore, _collection),
      orderBy('createdAt', 'desc'),
    )

    // 如果有查询参数，则引入查询参数
    if (_query) {
      collectionRef = query(
        collection(projectFirestore, _collection),
        where('userId', '==', _query),
        orderBy('createdAt', 'desc'),
      )
    }

    unsubscribe.value = onSnapshot(
      collectionRef,
      (snap) => {
        console.log('触发firebase快照') // 用来观察snap触发次数

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
  }
  // 断开snapshot链接
  watchEffect((onInvalidate) => {
    onInvalidate(() => {
      console.log('销毁firebase快照')
      if (unsubscribe.value) {
        unsubscribe.value()
      }
    })
  })

  return { error, documents, startFirebaseListener }
}

export default getCollection
