<template>
  <div class="playlist-details">
    <div v-if="error" class="error">{{ error }}</div>

    <template v-else>
      <div class="profile">
        <img :src="document.coverUrl" alt="图片加载失败">
        <h2 class="title">{{ document.title }}</h2>
        <p class="created-by">{{ document.userName }}</p>
        <p class="description">{{ document.description }}</p>
      </div>
      <div class="songs-list">
        songs here
        <AddSongs :document="document" />
      </div>
    </template>
  </div>
</template>

<script setup>
import AddSongs from '@/components/AddSongs.vue';
import getDocument from '@/composables/getDocument';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const { error, document } = getDocument('playlists', props.id)
</script>

<style scoped>
.playlist-details {
  display: flex;
  gap: 5rem;

  padding: 2rem 3rem;
  min-height: 100vh;
  align-items: center;
}

.playlist-details img {

  width: 400px;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.profile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

}

.created-by {
  font-size: 0.9rem;
  color: hsl(from var(--primary) h s calc(l + 30))
}

.title {
  font-size: 2rem;
  font-weight: 600;
}

.songs-list {
  width: 100%;

}

.description {
  align-self: flex-start;
}
</style>
