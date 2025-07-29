import { projectStorage } from '@/firebase/config'
import { ref } from 'vue'
import { getUser } from './getUser'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const { user } = getUser()

const useStorage = () => {
  const filePath = ref(null)
  const error = ref(null)
  const url = ref(null)

  const uploadImage = async (file) => {
    filePath.value = `cover/${user.value.uid}/${file.name}`
    console.log('文件路径:', filePath.value)
    const storageReference = storageRef(projectStorage, filePath.value)

    try {
      const res = await uploadBytes(storageReference, file)
      url.value = await getDownloadURL(res.ref)
      console.log('获取到的图片的URL是', url.value)
    } catch (err) {
      console.error(err.message)
      error.value = err.message
    }
  }

  const uploadSong = async (song, playlistId) => {
    filePath.value = `songs/${user.value.uid}/${playlistId}/${song.name}`
    console.log('上传的歌曲的路径为：', filePath.value)
    const storageReference = storageRef(projectStorage, filePath.value)

    try {
      const res = await uploadBytes(storageReference, song)
      url.value = await getDownloadURL(res.ref)
      console.log('获取到的mp3的URL是：', url.value)
    } catch (err) {
      console.error(err.message)
      error.value = err.message
    }
  }

  return { url, error, filePath, uploadImage, uploadSong }
}

export default useStorage
