import { supabase } from '@/supabase/config'
import { getUser } from './getUser'
import { ref } from 'vue'

const useStorage = () => {
  const filePath = ref(null)
  const error = ref(null)
  const url = ref(null)

  const uploadImage = async (file) => {
    const { user } = getUser()

    // 生成唯一文件名
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    filePath.value = `cover/${user.value.id}/${fileName}`

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath.value, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
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
