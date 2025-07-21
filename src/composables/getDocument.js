import { ref, watchEffect } from 'vue'
import { projectFirestore } from '@/firebase/config'

const getDocument = (collection, id) => {
  const error = ref(null)
  const document = ref(null)

  const unsubscribe = projectFirestore
    .collection(collection)
    .doc(id)
    .onSnapshot(
      (doc) => {
        if (doc.data()) {
          document.value = { ...doc.data(), id: doc.id }
          console.log(`从firebase获取到的${collection}集合的document数据是：`, document.value)
          error.value = null
        } else {
          error.value = '指定的document不存在'
        }
      },
      (err) => {
        console.error(err.message)
        error.value = '获取数据失败'
        document.value = null
      },
    )

  // 断开snapshot链接
  watchEffect((onInvalidate) => {
    onInvalidate(() => {
      unsubscribe()
    })
  })

  return { error, document }
}

export default getDocument
