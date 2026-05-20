<template>
  <img :src="playlist.coverUrl" :class="imageClass" :loading="lazyLoad ? 'lazy' : 'eager'"
    crossorigin="anonymous">
</template>

<script setup>
const props = defineProps({
  playlist: {
    type: Object,
    required: true
  },
  pixelSize: {
    type: String,
    required: false,
    default: '_800x800.webp'
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
