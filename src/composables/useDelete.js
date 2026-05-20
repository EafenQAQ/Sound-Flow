import { supabase } from '@/supabase/config'
import { ref } from 'vue'

const useDelete = () => {
  const error = ref(null)
  const isPending = ref(false)

  // 删除单个文档
  const deleteDocument = async (collection, id) => {
    try {
      error.value = null
      isPending.value = true

      const { error: deleteError } = await supabase
        .from(collection)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

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

      const { error: deleteError } = await supabase
        .from(collection)
        .delete()
        .in('id', docIds)

      if (deleteError) throw deleteError

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
  const deleteStorageFile = async (bucket, filePath) => {
    try {
      if (filePath) {
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([filePath])

        if (deleteError) {
          console.error('删除存储文件失败:', deleteError.message)
        } else {
          console.log('存储文件删除成功:', filePath)
        }
      }
    } catch (err) {
      console.error('删除存储文件失败:', err.message)
    }
  }

  // 删除歌单（包括封面图片和所有歌曲文件）
  const deletePlaylist = async (playlist) => {
    try {
      error.value = null
      isPending.value = true

      // 先删除封面图片
      if (playlist.filePath) {
        await deleteStorageFile('covers', playlist.filePath)
      }

      // 删除所有歌曲文件
      if (playlist.songs && playlist.songs.length > 0) {
        const songFilePaths = playlist.songs
          .filter((song) => song.filePath)
          .map((song) => song.filePath)

        if (songFilePaths.length > 0) {
          const { error: songsDeleteError } = await supabase.storage
            .from('songs')
            .remove(songFilePaths)

          if (songsDeleteError) {
            console.error('删除歌曲文件失败:', songsDeleteError.message)
          }
        }
      }

      // 删除歌单文档（级联删除歌曲记录）
      const success = await deleteDocument('playlists', playlist.id)
      return success
    } catch (err) {
      console.error('删除歌单失败:', err.message)
      error.value = '删除歌单失败'
      isPending.value = false
      return false
    }
  }

  // 批量删除歌单
  const batchDeletePlaylists = async (playlists) => {
    try {
      error.value = null
      isPending.value = true

      // 先删除所有封面图片
      const coverFilePaths = playlists
        .filter((playlist) => playlist.filePath)
        .map((playlist) => playlist.filePath)

      if (coverFilePaths.length > 0) {
        await supabase.storage.from('covers').remove(coverFilePaths)
      }

      // 删除所有歌曲文件
      const songFilePaths = []
      playlists.forEach((playlist) => {
        if (playlist.songs && playlist.songs.length > 0) {
          playlist.songs
            .filter((song) => song.filePath)
            .forEach((song) => {
              songFilePaths.push(song.filePath)
            })
        }
      })

      if (songFilePaths.length > 0) {
        await supabase.storage.from('songs').remove(songFilePaths)
      }

      // 批量删除文档
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
        await deleteStorageFile('songs', song.filePath)
      }

      // 删除歌曲记录
      const { error: deleteError } = await supabase
        .from('songs')
        .delete()
        .eq('id', song.id)

      if (deleteError) throw deleteError

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

  // 批量删除歌曲
  const batchDeleteSongs = async (playlistId, songsToDelete) => {
    try {
      error.value = null
      isPending.value = true

      // 先删除所有音频文件
      const songFilePaths = songsToDelete
        .filter((song) => song.filePath)
        .map((song) => song.filePath)

      if (songFilePaths.length > 0) {
        await supabase.storage.from('songs').remove(songFilePaths)
      }

      // 批量删除歌曲记录
      const songIds = songsToDelete.map((song) => song.id)
      const { error: deleteError } = await supabase
        .from('songs')
        .delete()
        .in('id', songIds)

      if (deleteError) throw deleteError

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
