<template>
  <div class="playlist-details">
    playlist details ID - {{ props.id }}
  </div>
</template>

<script setup>
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})
</script>

<style lang="scss" scoped></style>
