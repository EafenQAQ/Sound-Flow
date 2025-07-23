<template>
  <div class="UserPlaylist">
    <h2 v-if="documents.length">「{{ documents[0]?.userName }}」的歌单</h2>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="documents.length" class="playlists-container">
      <ListView :playlists="documents" />
    </div>
  </div>
</template>

<script setup>
import getCollection from '@/composables/getCollection';
import ListView from '@/components/ListView.vue';
import { onMounted, onUpdated, watch } from 'vue';
const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
})

const { error, documents } = getCollection('playlists', props.userId)
watch(documents, () => {
  console.log('获取并筛选到的数据是：', documents.value)

}
)
onUpdated(() => {
  if (!documents.value.length) {
    error.value = '该用户还没有创建歌单'
  }
}
)

</script>

<style scoped>
h2 {
  margin: 2rem 0;
}
</style>
