import { supabase } from '@/supabase/config'
import { ref } from 'vue'

const error = ref(null)
const isPending = ref(false)

const useDocument = (collection, id) => {
  const updateDocument = async (newData) => {
    try {
      error.value = null
      isPending.value = true

      if (collection === 'playlists') {
        // 处理歌曲数组更新：需要同步到 songs 表
        if (newData.songs) {
          // 获取当前歌曲列表
          const { data: currentSongs, error: songsError } = await supabase
            .from('songs')
            .select('id')
            .eq('playlist_id', id)

          if (songsError) throw songsError

          const currentSongIds = (currentSongs || []).map((s) => s.id)
          const newSongIds = newData.songs.map((s) => s.id)

          // 找出需要新增的歌曲
          const songsToAdd = newData.songs.filter((s) => !currentSongIds.includes(s.id))
          // 找出需要删除的歌曲
          const songsToRemove = currentSongIds.filter((id) => !newSongIds.includes(id))

          // 插入新歌曲
          if (songsToAdd.length > 0) {
            const insertData = songsToAdd.map((song, index) => ({
              playlist_id: id,
              title: song.title,
              artist: song.artist,
              file_path: song.filePath,
              song_url: song.songUrl,
              duration: song.duration || 0,
              sort_order: newData.songs.indexOf(song),
            }))

            const { error: insertError } = await supabase
              .from('songs')
              .insert(insertData)

            if (insertError) throw insertError
          }

          // 删除移除的歌曲
          if (songsToRemove.length > 0) {
            const { error: deleteError } = await supabase
              .from('songs')
              .delete()
              .in('id', songsToRemove)

            if (deleteError) throw deleteError
          }

          // 更新歌曲排序
          for (let i = 0; i < newData.songs.length; i++) {
            const song = newData.songs[i]
            if (song.id && currentSongIds.includes(song.id)) {
              await supabase
                .from('songs')
                .update({ sort_order: i })
                .eq('id', song.id)
            }
          }
        }

        // 更新歌单基本信息
        const updateData = {}
        if (newData.title !== undefined) updateData.title = newData.title
        if (newData.description !== undefined) updateData.description = newData.description
        if (newData.coverUrl !== undefined) updateData.cover_url = newData.coverUrl
        if (newData.filePath !== undefined) updateData.cover_file_path = newData.filePath

        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('playlists')
            .update(updateData)
            .eq('id', id)

          if (updateError) throw updateError
        }
      } else {
        const { error: updateError } = await supabase
          .from(collection)
          .update(newData)
          .eq('id', id)

        if (updateError) throw updateError
      }

      console.log('更新成功', newData)
      isPending.value = false
    } catch (err) {
      console.error(err.message)
      error.value = '无法更新doc'
      isPending.value = false
    }
  }

  return { error, isPending, updateDocument }
}

export default useDocument
