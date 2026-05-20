import { supabase } from '@/supabase/config'
import { getUser } from './getUser'
import { ref } from 'vue'
import imageCompression from 'browser-image-compression'

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.2, // 最大 200KB
    maxWidthOrHeight: 800, // 最大尺寸 800x800
    useWebWorker: true,
    fileType: 'image/webp', // 输出 WebP 格式
  }

  const compressedFile = await imageCompression(file, options)

  // 生成新的 File 对象，扩展名改为 .webp
  const webpName = file.name.replace(/\.[^.]+$/, '.webp')
  return new File([compressedFile], webpName, { type: 'image/webp' })
}

const useStorage = () => {
  const filePath = ref(null)
  const error = ref(null)
  const url = ref(null)

  const uploadImage = async (file) => {
    const { user } = getUser()

    try {
      // 先压缩图片
      const compressedFile = await compressImage(file)

      // 生成唯一文件名
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.webp`
      filePath.value = `cover/${user.value.id}/${fileName}`

      const { data, error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath.value, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/webp',
        })

      if (uploadError) throw uploadError

      // 获取公开 URL
      const { data: urlData } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath.value)

      url.value = urlData.publicUrl
    } catch (err) {
      error.value = err.message
    }
  }

  const uploadSong = async (song, playlistId) => {
    const { user } = getUser()

    const ext = song.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    filePath.value = `songs/${user.value.id}/${playlistId}/${fileName}`

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('songs')
        .upload(filePath.value, song, {
          cacheControl: '3600',
          upsert: false,
          contentType: song.type || 'audio/mpeg',
        })

      if (uploadError) throw uploadError

      // 获取公开 URL
      const { data: urlData } = supabase.storage
        .from('songs')
        .getPublicUrl(filePath.value)

      url.value = urlData.publicUrl
    } catch (err) {
      error.value = err.message
    }
  }

  return { url, error, filePath, uploadImage, uploadSong }
}

export default useStorage
