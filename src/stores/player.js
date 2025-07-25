import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  //State
  const currentDoc = ref(null)
  const currentPlaylist = ref(null)
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(50)

  //Getters
  // Actions
  const initPlaylist = (playlist) => {
    if (playlist) {
      currentDoc.value = playlist
    }

    if (playlist && playlist.songs) {
      currentPlaylist.value = [...playlist.songs]

      if (playlist.songs.length > 0) {
        currentSong.value = playlist.songs[0]
      } else {
        currentSong.value = null
      }
    }
  }

  const changeSong = () => {
    isPlaying.value = true
  }

  return {
    currentDoc,
    currentPlaylist,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,

    initPlaylist,
    changeSong,
  }
})
