import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  let nextId = 0

  const show = (message, type = 'success', duration = 3000) => {
    const id = nextId++
    notifications.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  const remove = (id) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  const success = (message, duration) => show(message, 'success', duration)
  const error = (message, duration) => show(message, 'error', duration)
  const info = (message, duration) => show(message, 'info', duration)

  return { notifications, show, remove, success, error, info }
})
