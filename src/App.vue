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
  <MusicPlayer v-if="user" />
</template>

<script setup>
import { RouterView } from 'vue-router';
import NavBar from './components/global/NavBar.vue';
import MusicPlayer from './components/global/MusicPlayer.vue';
import { getUser } from '@/composables/getUser';

const { user } = getUser()

</script>

<style scoped></style>
