import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  //State
  const currentDoc = ref(null)
  const currentSongIndex = ref(0)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.7) // 0-1之间
  const isMuted = ref(false)

  //Getters
  const currentPlaylist = computed(() => currentDoc.value?.songs || [])
  const currentSong = computed(() => currentPlaylist.value[currentSongIndex.value] || null)
  const coverUrl = computed(() => currentDoc.value?.coverUrl || '')
  const songUrl = computed(() => currentSong.value?.songUrl || '')

  // Actions
  const initPlaylist = (doc) => {
    currentDoc.value = doc
    currentSongIndex.value = 0
    console.log('初始化歌单:', doc?.title)
  }

  const playSong = (songIndex) => {
    if (songIndex >= 0 && songIndex < currentPlaylist.value.length) {
      currentSongIndex.value = songIndex
      isPlaying.value = true
    }
  }
  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }

  const nextSong = () => {
    if (currentSongIndex.value < currentPlaylist.value.length - 1) {
      currentSongIndex.value++
    }
  }

  const previousSong = () => {
    if (currentSongIndex.value > 0) {
      currentSongIndex.value--
    }
  }
 
  return {
    currentDoc,
    currentSongIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    currentPlaylist,
    currentSong,
    coverUrl,
    songUrl,
    initPlaylist,
    playSong,
    togglePlay,
    nextSong,
    previousSong,
  }
})
