<template>
  <div id="HomeView">
    <h2>歌单广场</h2>
    <div v-if="playlists.length" class="playlists-container">
      <ListView :playlists="playlists" />
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import ListView from '@/components/ListView.vue';
import getCollection from '@/composables/getCollection';




const { error, documents: playlists } = getCollection('playlists')


</script>

<style scoped>
h2 {
  margin: 2rem 0;
}
</style>
