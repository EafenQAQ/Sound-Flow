import { supabase } from '@/supabase/config'
import { ref } from 'vue'

const useCollection = (_collection) => {
  const error = ref(null)

  const addDocument = async (doc) => {
    try {
      error.value = null

      if (_collection === 'playlists') {
        // 转换字段名以适配 Supabase 表结构
        const supabaseDoc = {
          user_id: doc.userId,
          title: doc.title,
          description: doc.description,
          cover_url: doc.coverUrl,
          cover_file_path: doc.filePath,
        }

        const { data, error: insertError } = await supabase
          .from('playlists')
          .insert(supabaseDoc)
          .select()
          .single()

        if (insertError) throw insertError

        console.log('发送data成功:', doc)
        return { id: data.id }
      } else {
        const { data, error: insertError } = await supabase
          .from(_collection)
          .insert(doc)
          .select()
          .single()

        if (insertError) throw insertError

        console.log('发送data成功:', doc)
        return { id: data.id }
      }
    } catch (err) {
      console.error(err.message)
      error.value = '无法发送消息'
      return null
    }
  }

  return { error, addDocument }
}

export default useCollection
