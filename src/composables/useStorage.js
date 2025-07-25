import { projectStorage } from '@/firebase/config'
import { ref } from 'vue'
import { getUser } from './getUser'

const { user } = getUser()

const useStorage = () => {
  const filePath = ref(null)
  const error = ref(null)
  const url = ref(null)

  const uploadImage = async (file) => {
    filePath.value = `cover/${user.value.uid}/${file.name}`
    console.log('文件路径:', filePath.value)
    const storageRef = projectStorage.ref(filePath.value)

    try {
      const res = await storageRef.put(file)
      url.value = await res.ref.getDownloadURL()
      console.log('获取到的图片的URL是', url.value)
    } catch (err) {
      console.error(err.message)
      error.value = err.message
    }
  }

  const uploadSong = async (song, playlistId) => {
    filePath.value = `songs/${user.value.uid}/${playlistId}/${song.name}`
    console.log('上传的歌曲的路径为：', filePath.value)
    const storageRef = projectStorage.ref(filePath.value)

    try {
      const res = await storageRef.put(song)
      url.value = await res.ref.getDownloadURL()
      console.log('获取到的mp3的URL是：', url.value)
    } catch (err) {
      console.error(err.message)
      error.value = err.message
    }
  }

  return { url, error, filePath, uploadImage, uploadSong }
}

export default useStorage
