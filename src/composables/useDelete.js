import { ref } from 'vue'
import { projectFirestore, projectStorage } from '@/firebase/config'

const useDelete = () => {
  const error = ref(null)
  const isPending = ref(false)

  // 删除单个文档
  const deleteDoc = async (collection, id) => {
    try {
      error.value = null
      isPending.value = true
      await projectFirestore.collection(collection).doc(id).delete()
      console.log('文档删除成功:', id)
      isPending.value = false
      return true
    } catch (err) {
      console.error('删除文档失败:', err.message)
      error.value = '删除失败'
      isPending.value = false
      return false
    }
  }

  // 批量删除文档
  const batchDeleteDocs = async (collection, docIds) => {
    try {
      error.value = null
      isPending.value = true
      
      const batch = projectFirestore.batch()
      
      docIds.forEach(id => {
        const docRef = projectFirestore.collection(collection).doc(id)
        batch.delete(docRef)
      })
      
      await batch.commit()
      console.log('批量删除成功:', docIds)
      isPending.value = false
      return true
    } catch (err) {
      console.error('批量删除失败:', err.message)
      error.value = '批量删除失败'
      isPending.value = false
      return false
    }
  }

  // 删除存储文件
  const deleteStorageFile = async (filePath) => {
    try {
      if (filePath) {
        const fileRef = projectStorage.ref(filePath)
        await fileRef.delete()
        console.log('存储文件删除成功:', filePath)
      }
    } catch (err) {
      console.error('删除存储文件失败:', err.message)
      // 不抛出错误，因为文档删除更重要
    }
  }

  // 删除歌单（包括封面图片）
  const deletePlaylist = async (playlist) => {
    try {
      error.value = null
      isPending.value = true
      
      // 先删除存储中的封面图片
      if (playlist.filePath) {
        await deleteStorageFile(playlist.filePath)
      }
      
      // 再删除文档
      const success = await deleteDoc('playlists', playlist.id)
      return success
    } catch (err) {
      console.error('删除歌单失败:', err.message)
      error.value = '删除歌单失败'
      isPending.value = false
      return false
    }
  }

  // 批量删除歌单（包括封面图片）
  const batchDeletePlaylists = async (playlists) => {
    try {
      error.value = null
      isPending.value = true
      
      // 先删除所有封面图片
      const deleteFilePromises = playlists
        .filter(playlist => playlist.filePath)
        .map(playlist => deleteStorageFile(playlist.filePath))
      
      await Promise.all(deleteFilePromises)
      
      // 再批量删除文档
      const playlistIds = playlists.map(playlist => playlist.id)
      const success = await batchDeleteDocs('playlists', playlistIds)
      return success
    } catch (err) {
      console.error('批量删除歌单失败:', err.message)
      error.value = '批量删除歌单失败'
      isPending.value = false
      return false
    }
  }

  return { 
    error, 
    isPending, 
    deleteDoc, 
    batchDeleteDocs, 
    deleteStorageFile,
    deletePlaylist,
    batchDeletePlaylists
  }
}

export default useDelete
