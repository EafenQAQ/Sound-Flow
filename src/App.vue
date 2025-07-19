<template>
  <nav>
    <NavBar />
  </nav>
  <div class="content">
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import NavBar from './components/NavBar.vue';


</script>

<style scoped></style>
