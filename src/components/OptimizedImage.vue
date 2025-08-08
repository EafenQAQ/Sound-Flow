<template>
  <img :src="optimizedImageUrl || playlist.coverUrl" :class="imageClass" :loading="lazyLoad ? 'lazy' : 'eager'"
    crossorigin="anonymous">

</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  playlist: {
    type: Object,
    required: true
  },
  pixelSize: {
    type: String,
    required: true
  },
  imageClass: {
    type: String,
    default: 'playlist-image'
  },
  lazyLoad: {
    type: Boolean,
    default: false
  },
  preload: {
    type: Boolean,
    default: false
  }
})



// 获取文件名
const fileName = computed(() => {
  if (!props.playlist || !props.playlist.filePath) {
    return '';
  }
  const filePath = props.playlist.filePath;
  const parts = filePath.split('/');
  const lastPart = parts[parts.length - 1]; // "Image_124045434479710.jpg"
  const nameWithoutExtension = lastPart.split('.')[0]; // "Image_124045434479710"
  return nameWithoutExtension;

}
)



// 构造优化图片URL

const optimizedImageUrl = computed(() => {
  if (!props.playlist.userId || !fileName.value || !props.pixelSize) {
    return null;
  }

  return `https://storage.googleapis.com/sound-flow-e1a34.firebasestorage.app/cover/${props.playlist.userId}/optimizedImages/${fileName.value}${props.pixelSize}`
}
)

// 计算好URL后，给图片动态地添加preload属性

watch(optimizedImageUrl, (newUrl) => {
  if (newUrl || props.preload) {
    // 检查是否已有一个preload属性
    if (document.querySelector(`link[rel="preload"][href="${newUrl}"]`)) {
      return
    }

    // 构造link元素
    const link = document.createElement('link')

    link.rel = 'preload'
    link.as = 'image'
    link.href = newUrl
    link.crossOrigin = 'anonymous'

    // 添加到head
    document.head.appendChild(link)
  }
}, { immediate: true }
)

</script>

<style scoped>
.playlist-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  display: block;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
</style>
