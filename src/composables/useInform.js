import { usePlayerStore } from '@/stores/player'
import { watch, ref } from 'vue'

const useInform = () => {
  const playerStore = usePlayerStore()

  // 用于存储定时器ID，避免内存泄漏
  const timerId = ref(null)

  // 监听 informMessage 的变化
  watch(
    () => playerStore.informMessage,
    (newMessage) => {
      // 如果有新消息
      if (newMessage) {
        // 清除之前的定时器（如果存在）
        if (timerId.value) {
          clearTimeout(timerId.value)
        }

        // 设置新的定时器，1秒后清除消息
        timerId.value = setTimeout(() => {
          playerStore.informMessage = ''
          timerId.value = null
        }, 1000)
      }
    },
    { immediate: true }, // 立即执行一次，处理初始值
  )

  // 清理函数，用于组件卸载时清除定时器
  const cleanup = () => {
    if (timerId.value) {
      clearTimeout(timerId.value)
      timerId.value = null
    }
  }

  return {
    informMessage: playerStore.informMessage,
    cleanup,
  }
}

export default useInform
