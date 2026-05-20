import { supabase } from '@/supabase/config'
import { ref, watchEffect } from 'vue'

const getCollection = (_collection, _query) => {
  const error = ref(null)
  const documents = ref([])

  let channel = null

  const transformPlaylist = (item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    userId: item.user_id,
    userName: item.user_name || '',
    coverUrl: item.cover_url || '',
    coverFilePath: item.cover_file_path || '',  // 统一命名
    songs: (item.songs || []).map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      filePath: song.filePath || song.file_path || '',  // 兼容两种格式
      songUrl: song.songUrl,
      duration: song.duration,
    })),
    createdAt: item.created_at,
  })

  const fetchData = async () => {
    try {
      let query

      if (_collection === 'playlists') {
        // 使用视图查询，包含歌曲和用户名
        query = supabase
          .from('playlist_details')
          .select('*')
          .order('created_at', { ascending: false })

        if (_query) {
          query = query.eq('user_id', _query)
        }
      } else {
        query = supabase
          .from(_collection)
          .select('*')
          .order('created_at', { ascending: false })

        if (_query) {
          query = query.eq('user_id', _query)
        }
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        error.value = '获取数据失败'
        documents.value = []
        return
      }

      if (_collection === 'playlists') {
        documents.value = (data || []).map(transformPlaylist)
      } else {
        documents.value = (data || []).map((item) => ({ ...item, id: item.id }))
      }
      error.value = null
    } catch (err) {
      console.error(err.message)
      error.value = '获取数据失败'
      documents.value = []
    }
  }

  fetchData()

  // 设置实时监听
  channel = supabase
    .channel(`${_collection}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: _collection },
      () => {
        fetchData()
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

  return { error, documents, refresh: fetchData }
}

export default getCollection
