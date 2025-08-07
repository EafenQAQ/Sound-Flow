import { ref } from 'vue'
import { getUser } from './getUser'
import { projectStorage } from '@/firebase/config'
const { user } = getUser()

const useStorage = () => {
  const filePath = ref(null)
  const error = ref(null)
  const url = ref(null)

  const uploadImage = async (file) => {
    // 动态导入存储相关模块

    const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage')

    filePath.value = `cover/${user.value.uid}/${file.name}`
    const storageReference = storageRef(projectStorage, filePath.value)

    try {
      const res = await uploadBytes(storageReference, file)
      url.value = await getDownloadURL(res.ref)
    } catch (err) {
      error.value = err.message
    }
  }

  const uploadSong = async (song, playlistId) => {
    const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage')

    filePath.value = `songs/${user.value.uid}/${playlistId}/${song.name}`
    const storageReference = storageRef(projectStorage, filePath.value)

    try {
      const res = await uploadBytes(storageReference, song)
      url.value = await getDownloadURL(res.ref)
    } catch (err) {
      error.value = err.message
    }
  }

  return { url, error, filePath, uploadImage, uploadSong }
}

export default useStorage
