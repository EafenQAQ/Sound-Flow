-- =============================================
-- Sound-Flow 数据库初始 Schema
-- 在 Supabase SQL Editor 中执行此文件
-- =============================================

-- 1. 用户资料表 (替代 Firestore users 集合)
-- Supabase Auth 自带 auth.users 表，此表存储额外用户信息
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 歌单表 (替代 Firestore playlists 集合)
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_url TEXT,
  cover_file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 歌曲表 (将 Firestore 中 playlists.songs 数组拆分为独立表)
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  file_path TEXT,
  song_url TEXT,
  duration NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security (RLS) 策略
-- =============================================

-- profiles: 用户只能读写自己的资料，公开读取
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- playlists: 公开读取，仅所有者可创建/更新/删除
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Playlists are viewable by everyone" ON public.playlists FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update own playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete own playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id);

-- songs: 公开读取，仅歌单所有者可创建/更新/删除
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Songs are viewable by everyone" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Playlist owners can create songs" ON public.songs FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.playlists WHERE id = playlist_id)
);
CREATE POLICY "Playlist owners can update songs" ON public.songs FOR UPDATE USING (
  auth.uid() = (SELECT user_id FROM public.playlists WHERE id = playlist_id)
);
CREATE POLICY "Playlist owners can delete songs" ON public.songs FOR DELETE USING (
  auth.uid() = (SELECT user_id FROM public.playlists WHERE id = playlist_id)
);

-- =============================================
-- 数据库触发器
-- =============================================

-- 自动创建用户资料（注册时触发）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 同步 displayName 更新到 profiles
CREATE OR REPLACE FUNCTION public.sync_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'display_name' IS DISTINCT FROM OLD.raw_user_meta_data->>'display_name' THEN
    UPDATE public.profiles
    SET display_name = NEW.raw_user_meta_data->>'display_name',
        updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_display_name();

-- 自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- 视图：歌单详情（包含用户名和歌曲数量）
-- =============================================
CREATE OR REPLACE VIEW public.playlist_details AS
SELECT
  p.*,
  pr.display_name AS user_name,
  COALESCE(json_agg(
    json_build_object(
      'id', s.id,
      'title', s.title,
      'artist', s.artist,
      'filePath', s.file_path,
      'songUrl', s.song_url,
      'duration', s.duration,
      'sort_order', s.sort_order
    ) ORDER BY s.sort_order
  ) FILTER (WHERE s.id IS NOT NULL), '[]'::json) AS songs
FROM public.playlists p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
LEFT JOIN public.songs s ON s.playlist_id = p.id
GROUP BY p.id, pr.display_name;

-- =============================================
-- Storage 存储桶 RLS 策略
-- =============================================
-- 路径结构: covers = cover/{userId}/{file}, songs = songs/{userId}/{playlistId}/{file}
-- 文件夹路径中 userId 始终在 index 1 (foldername 的第二层)

-- covers bucket: 已认证用户可上传，所有者可更新/删除
CREATE POLICY "Authenticated users can upload covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- songs bucket: 已认证用户可上传，所有者可更新/删除
CREATE POLICY "Authenticated users can upload songs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'songs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own songs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'songs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own songs" ON storage.objects
  FOR DELETE USING (bucket_id = 'songs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- avatars bucket: 已认证用户可上传，所有者可更新/删除
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
