<template>
  <Teleport to="body">
    <div class="toast-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="toast-item"
        :class="notification.type"
      >
        <span class="toast-icon">{{ iconMap[notification.type] }}</span>
        <span class="toast-message">{{ notification.message }}</span>
        <button class="toast-close" @click="remove(notification.id)">×</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
const { remove } = notificationStore

const iconMap = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  font-size: 0.95rem;
  color: white;
  pointer-events: auto;
  animation: toastSlideIn 0.35s ease forwards;
  max-width: 360px;
}

.toast-item.success {
  background: #10b981;
}

.toast-item.error {
  background: #ef4444;
}

.toast-item.info {
  background: #3b82f6;
}

.toast-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0 0 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.toast-close:hover {
  color: white;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 640px) {
  .toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .toast-item {
    max-width: 100%;
  }
}
</style>
