import { supabase } from '@/supabase/config'
import { ref, watchEffect } from 'vue'

const getDocument = (collection, id) => {
  const error = ref(null)
  const document = ref(null)
  let channel = null

  const fetchDocument = async () => {
    try {
      if (collection === 'playlists') {
        // 使用视图查询，包含歌曲和用户名
        const { data, error: fetchError } = await supabase
          .from('playlist_details')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError

        if (data) {
          document.value = {
            id: data.id,
            title: data.title,
            description: data.description,
            userId: data.user_id,
            userName: data.user_name || '',
            coverUrl: data.cover_url || '',
            filePath: data.cover_file_path || '',
            songs: (data.songs || []).map((song) => ({
              id: song.id,
              title: song.title,
              artist: song.artist,
              filePath: song.filePath,
              songUrl: song.songUrl,
              duration: song.duration,
            })),
            createdAt: data.created_at,
          }
          console.log(`从Supabase获取到的${collection}的document数据是：`, document.value)
          error.value = null
        } else {
          error.value = '指定的document不存在'
        }
      } else {
        const { data, error: fetchError } = await supabase
          .from(collection)
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError

        if (data) {
          document.value = { ...data, id: data.id }
          error.value = null
        } else {
          error.value = '指定的document不存在'
        }
      }
    } catch (err) {
      console.error(err.message)
      error.value = '获取数据失败'
      document.value = null
    }
  }

  fetchDocument()

  // 设置实时监听
  channel = supabase
    .channel(`${collection}-${id}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: collection,
        filter: `id=eq.${id}`,
      },
      () => {
        fetchDocument()
      },
    )
    .subscribe()

  // 组件卸载时取消订阅
  watchEffect((onInvalidate) => {
    onInvalidate(() => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    })
  })

  return { error, document, refresh: fetchDocument }
}

export default getDocument
