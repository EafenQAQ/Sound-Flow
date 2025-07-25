# 歌曲删除功能实现文档

## 🎯 功能概述

本次更新为 Sound-Flow 项目添加了完整的歌曲删除功能，包括删除 Firebase Storage 中的音频文件和 Firestore 中的歌曲数据。

## ✨ 新增功能

### 1. 删除单个歌曲
- **功能**：删除歌单中的单个歌曲
- **包含**：删除 Storage 中的音频文件 + 从歌单中移除歌曲数据
- **位置**：歌单管理器 → 管理歌曲 → 单个删除按钮

### 2. 批量删除歌曲
- **功能**：批量删除歌单中的多个歌曲
- **包含**：批量删除 Storage 中的音频文件 + 批量从歌单中移除歌曲数据
- **位置**：歌单管理器 → 管理歌曲 → 选择多个歌曲 → 批量删除

### 3. 增强的歌单删除
- **功能**：删除歌单时自动清理所有相关文件
- **包含**：删除封面图片 + 删除所有歌曲音频文件 + 删除歌单数据
- **位置**：歌单管理器 → 删除歌单

## 🔧 技术实现

### 核心文件修改

#### 1. `src/composables/useDelete.js`
新增了以下函数：

```javascript
// 删除单个歌曲（包括音频文件）
const deleteSong = async (playlistId, song) => {
  // 1. 删除 Storage 中的音频文件
  // 2. 从歌单中移除歌曲数据
  // 3. 更新 Firestore 文档
}

// 批量删除歌曲（包括音频文件）
const batchDeleteSongs = async (playlistId, songsToDelete) => {
  // 1. 批量删除 Storage 中的音频文件
  // 2. 批量从歌单中移除歌曲数据
  // 3. 更新 Firestore 文档
}
```

#### 2. `src/views/management/playlistManager.vue`
更新了删除逻辑：

```javascript
// 使用新的删除函数
const { deleteSong: deleteSongWithStorage, batchDeleteSongs: batchDeleteSongsWithStorage } = useDelete()

// 更新单个删除逻辑
const deleteSingleSong = async (song) => {
  const success = await deleteSongWithStorage(currentPlaylist.value.id, song)
  // 处理结果...
}

// 更新批量删除逻辑
const batchDeleteSongs = async () => {
  const success = await batchDeleteSongsWithStorage(currentPlaylist.value.id, songsToDelete)
  // 处理结果...
}
```

### 数据流程

#### 删除单个歌曲
1. 用户点击删除按钮
2. 显示确认对话框
3. 调用 `deleteSongWithStorage(playlistId, song)`
4. 删除 Storage 中的音频文件 (`song.filePath`)
5. 从歌单的 songs 数组中移除该歌曲
6. 更新 Firestore 中的歌单文档
7. 重新加载数据并更新 UI

#### 批量删除歌曲
1. 用户选择多个歌曲
2. 点击批量删除按钮
3. 显示确认对话框
4. 调用 `batchDeleteSongsWithStorage(playlistId, songsToDelete)`
5. 并行删除所有选中歌曲的音频文件
6. 从歌单的 songs 数组中移除所有选中歌曲
7. 更新 Firestore 中的歌单文档
8. 重新加载数据并更新 UI

## 🛡️ 错误处理

### Storage 文件删除失败
- 不会阻止数据库操作
- 记录错误日志但继续执行
- 确保数据一致性

### 权限检查
- 只有歌单创建者可以删除歌曲
- 在删除前验证用户权限
- 显示相应的错误提示

### 数据验证
- 检查歌单是否存在
- 验证歌曲 ID 的有效性
- 处理网络错误和超时

## 🎨 用户体验

### 确认对话框
- 删除单个歌曲：`确定要删除歌曲"${song.title}"吗？此操作将同时删除音频文件。`
- 批量删除：`确定要删除选中的 ${count} 首歌曲吗？此操作将同时删除音频文件。`

### 加载状态
- 删除过程中显示加载指示器
- 禁用相关按钮防止重复操作

### 成功反馈
- 删除成功后显示成功消息
- 自动刷新歌单数据
- 清空选择状态

## 📱 使用方法

### 删除单个歌曲
1. 进入歌单管理页面
2. 点击"管理歌曲"按钮
3. 在歌曲列表中点击单个歌曲的删除按钮 🗑️
4. 确认删除操作

### 批量删除歌曲
1. 进入歌单管理页面
2. 点击"管理歌曲"按钮
3. 勾选要删除的歌曲
4. 点击"删除选中"按钮
5. 确认批量删除操作

## 🔄 兼容性

### 向后兼容
- 保持原有的歌单删除功能
- 不影响现有的歌曲上传功能
- 兼容现有的数据结构

### 数据结构
歌曲对象包含以下字段：
```javascript
{
  id: Number,           // 歌曲 ID
  title: String,        // 歌曲标题
  artist: String,       // 艺术家
  filePath: String,     // Storage 中的文件路径
  songUrl: String       // 下载 URL
}
```

## 🚀 部署注意事项

### Firebase 权限
确保 Storage 规则允许删除操作：
```javascript
// storage.rules
service firebase.storage {
  match /b/{bucket}/o {
    match /songs/{userId}/{playlistId}/{fileName} {
      allow read, write, delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 性能优化
- 使用 Promise.all() 并行删除多个文件
- 批量操作减少网络请求
- 错误处理不阻塞主流程

## 🧪 测试建议

### 功能测试
1. 测试删除单个歌曲
2. 测试批量删除歌曲
3. 测试删除歌单（包含歌曲）
4. 测试权限验证
5. 测试网络错误处理

### 边界情况
1. 删除不存在的歌曲
2. 删除已被删除的文件
3. 网络中断时的删除操作
4. 权限不足的删除尝试

---

**更新时间**: 2025-01-25  
**版本**: v1.0.0  
**作者**: Augment Agent
