<template>
  <img :src="optimizedImageUrl || playlist.coverUrl" :class="imageClass" :loading="lazyLoad ? 'lazy' : 'eager'">
</template>

<script setup>
import { computed } from 'vue';

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
  return `https://storage.googleapis.com/sound-flow-e1a34.firebasestorage.app/cover/${props.playlist.userId}/optimizedImages/${fileName.value}${props.pixelSize}`
}
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
