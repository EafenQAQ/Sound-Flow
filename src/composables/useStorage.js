import { supabase } from '@/supabase/config'
import { getUser } from './getUser'
import { ref } from 'vue'

/**
 * 压缩图片为 WebP 格式
 * @param {Blob} fileBlob - 图片文件 Blob
 * @param {number} multiples - 尺寸缩小的倍数，默认 4
 * @param {number} quality - WebP 质量 0-1，默认 0.6
 * @returns {Promise<Blob>} 压缩后的 WebP Blob
 */
const compressImage = async (fileBlob, multiples = 4, quality = 0.6) => {
  // 参数校验
  if (!fileBlob) {
    throw new Error('压缩失败：未提供图片文件')
  }
  if (!(fileBlob instanceof Blob)) {
    throw new Error('压缩失败：文件格式无效')
  }
  if (!fileBlob.type.startsWith('image/')) {
    throw new Error('压缩失败：仅支持图片文件')
  }

  // 限制参数范围
  const safeMultiples = Math.max(1, Math.min(multiples, 20))
  const safeQuality = Math.max(0.1, Math.min(quality, 1))

  const img = new Image()
  const objectUrl = URL.createObjectURL(fileBlob)

  try {
    // 加载图片（添加超时保护）
    const imgLoadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('图片加载失败'))
      // 超时保护：10秒
      img._timeout = setTimeout(() => {
        reject(new Error('图片加载超时'))
      }, 10000)
    })

    img.src = objectUrl
    await imgLoadPromise
  } finally {
    // 无论成功失败都要清理 ObjectURL
    URL.revokeObjectURL(objectUrl)
    clearTimeout(img._timeout)
  }

  // 防止尺寸缩小到太小（最小 50px）
  const minSize = 50
  let targetWidth = Math.max(minSize, Math.floor(img.width / safeMultiples))
  let targetHeight = Math.max(minSize, Math.floor(img.height / safeMultiples))

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = targetWidth
  canvas.height = targetHeight

  // 使用高质量插值
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  // 导出
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas 导出 Blob 失败'))
          return
        }
        console.log(`图片压缩完成：${(blob.size / 1024).toFixed(2)} KB`)
        resolve(blob)
      },
      'image/webp',
      safeQuality,
    )
  })
}

const useStorage = () => {
  const filePath = ref(null)
  const error = ref(null)
  const url = ref(null)

  const uploadImage = async (file) => {
    const { user } = getUser()

    try {
      // 先压缩图片
      const compressedBlob = await compressImage(file)
      const webpName = file.name.replace(/\.[^.]+$/, '.webp')
      const compressedFile = new File([compressedBlob], webpName, { type: 'image/webp' })

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
