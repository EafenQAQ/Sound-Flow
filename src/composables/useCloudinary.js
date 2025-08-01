import { ref } from 'vue'

const useCloudinary = () => {
  const isUploading = ref(false)
  const error = ref(null)

  // 上传到 Cloudinary
  const uploadToCloudinary = async (file, folder = 'covers') => {
    // 实现上传逻辑
  }

  // 生成优化的图片URL
  const getOptimizedUrl = (publicId, options = {}) => {
    // 实现URL变换逻辑
  }

  return {
    isUploading,
    error,
    uploadToCloudinary,
    getOptimizedUrl,
  }
}

export default useCloudinary
