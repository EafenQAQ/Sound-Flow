import { ref } from 'vue'
import { doc, deleteDoc, writeBatch, getDoc, updateDoc } from 'firebase/firestore'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import { projectFirestore, projectStorage } from '@/firebase/config'

const useDelete = () => {
  const error = ref(null)
  const isPending = ref(false)

  // 删除单个文档
  const deleteDocument = async (collection, id) => {
    try {
      error.value = null
      isPending.value = true
      await deleteDoc(doc(projectFirestore, collection, id))
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

      const batch = writeBatch(projectFirestore)

      docIds.forEach((id) => {
        const docRef = doc(projectFirestore, collection, id)
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
        const fileRef = storageRef(projectStorage, filePath)
        await deleteObject(fileRef)
        console.log('存储文件删除成功:', filePath)
      }
    } catch (err) {
      console.error('删除存储文件失败:', err.message)
      // 不抛出错误，因为文档删除更重要
    }
  }

  // 删除歌单（包括封面图片和所有歌曲文件）
  const deletePlaylist = async (playlist) => {
    try {
      error.value = null
      isPending.value = true

      // 先删除存储中的封面图片
      if (playlist.filePath) {
        await deleteStorageFile(playlist.filePath)
      }

      // 删除歌单中的所有歌曲文件
      if (playlist.songs && playlist.songs.length > 0) {
        const deleteSongFilePromises = playlist.songs
          .filter((song) => song.filePath)
          .map((song) => deleteStorageFile(song.filePath))

        await Promise.all(deleteSongFilePromises)
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

  // 批量删除歌单（包括封面图片和所有歌曲文件）
  const batchDeletePlaylists = async (playlists) => {
    try {
      error.value = null
      isPending.value = true

      // 先删除所有封面图片
      const deleteCoverPromises = playlists
        .filter((playlist) => playlist.filePath)
        .map((playlist) => deleteStorageFile(playlist.filePath))

      await Promise.all(deleteCoverPromises)

      // 删除所有歌单中的歌曲文件
      const deleteSongPromises = []
      playlists.forEach((playlist) => {
        if (playlist.songs && playlist.songs.length > 0) {
          playlist.songs
            .filter((song) => song.filePath)
            .forEach((song) => {
              deleteSongPromises.push(deleteStorageFile(song.filePath))
            })
        }
      })

      await Promise.all(deleteSongPromises)

      // 再批量删除文档
      const playlistIds = playlists.map((playlist) => playlist.id)
      const success = await batchDeleteDocs('playlists', playlistIds)
      return success
    } catch (err) {
      console.error('批量删除歌单失败:', err.message)
      error.value = '批量删除歌单失败'
      isPending.value = false
      return false
    }
  }

  // 删除单个歌曲（包括音频文件）
  const deleteSong = async (playlistId, song) => {
    try {
      error.value = null
      isPending.value = true

      // 先删除存储中的音频文件
      if (song.filePath) {
        await deleteStorageFile(song.filePath)
      }

      // 获取当前歌单数据
      const playlistDoc = await getDoc(doc(projectFirestore, 'playlists', playlistId))
      if (!playlistDoc.exists) {
        throw new Error('歌单不存在')
      }

      const playlistData = playlistDoc.data()
      const updatedSongs = playlistData.songs.filter((s) => s.id !== song.id)

      // 更新歌单文档
      await updateDoc(doc(projectFirestore, 'playlists', playlistId), {
        songs: updatedSongs,
      })

      console.log('歌曲删除成功:', song.title)
      isPending.value = false
      return true
    } catch (err) {
      console.error('删除歌曲失败:', err.message)
      error.value = '删除歌曲失败'
      isPending.value = false
      return false
    }
  }

  // 批量删除歌曲（包括音频文件）
  const batchDeleteSongs = async (playlistId, songsToDelete) => {
    try {
      error.value = null
      isPending.value = true

      // 先删除所有音频文件
      const deleteFilePromises = songsToDelete
        .filter((song) => song.filePath)
        .map((song) => deleteStorageFile(song.filePath))

      await Promise.all(deleteFilePromises)

      // 获取当前歌单数据
      const playlistDoc = await getDoc(doc(projectFirestore, 'playlists', playlistId))
      if (!playlistDoc.exists) {
        throw new Error('歌单不存在')
      }

      const playlistData = playlistDoc.data()
      const songIdsToDelete = songsToDelete.map((song) => song.id)
      const updatedSongs = playlistData.songs.filter((song) => !songIdsToDelete.includes(song.id))

      // 更新歌单文档
      await updateDoc(doc(projectFirestore, 'playlists', playlistId), {
        songs: updatedSongs,
      })

      console.log('批量删除歌曲成功:', songsToDelete.length)
      isPending.value = false
      return true
    } catch (err) {
      console.error('批量删除歌曲失败:', err.message)
      error.value = '批量删除歌曲失败'
      isPending.value = false
      return false
    }
  }

  return {
    error,
    isPending,
    deleteDocument,
    batchDeleteDocs,
    deleteStorageFile,
    deletePlaylist,
    batchDeletePlaylists,
    deleteSong,
    batchDeleteSongs,
  }
}

export default useDelete
