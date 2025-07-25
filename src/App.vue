<template>
  <nav>
    <NavBar />
  </nav>
  <div class="content">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>

  <MusicPlayer />
</template>

<script setup>
import { RouterView } from 'vue-router';
import NavBar from './components/global/NavBar.vue';
import MusicPlayer from './components/global/MusicPlayer.vue';


</script>

<style scoped></style>
