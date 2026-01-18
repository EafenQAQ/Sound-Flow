# Project Context

## Purpose
Sound-Flow 是一个现代化的在线音乐播放平台，让音乐分享变得简单而优雅。用户可以创建个人歌单、上传音乐文件、自定义歌单封面，并通过流畅的播放器享受音乐体验。

## Tech Stack
- **前端框架**: Vue 3.5.17 + Composition API
- **状态管理**: Pinia 3.0.3
- **路由管理**: Vue Router 4.5.1
- **构建工具**: Vite 7.0.0
- **后端服务**: Firebase 10.13.1 (Authentication, Firestore, Storage)
- **部署平台**: Firebase Hosting
- **开发工具**: ESLint 9.29.0, Prettier 3.5.3, Vue DevTools

## Project Conventions

### Code Style
- **格式化**: Prettier 配置
  - 无分号 (`semi: false`)
  - 单引号 (`singleQuote: true`)
  - 行宽 100 字符 (`printWidth: 100`)
- **Linting**: ESLint with Vue plugin
  - 使用 `eslint.config.js` 扁平配置
  - 忽略 `dist/`, `dist-ssr/`, `coverage/` 目录
- **模块系统**: ES Modules (`type: "module"`)
- **导入别名**: `@` 指向 `src/` 目录
- **文件命名**:
  - 组件: PascalCase (如 `MusicPlayer.vue`)
  - Composables: camelCase (如 `useCollection.js`)
  - 视图: PascalCase (如 `LoginView.vue`)

### Architecture Patterns
- **Composition API**: 使用组合式函数 (`composables/`) 封装可复用逻辑
  - Firebase 操作: `useCollection`, `useStorage`, `useLogin`, `useSignup`, `useLogout`, `useDelete`
  - 数据获取: `getCollection`, `getDocument`, `getUser`
- **状态管理**: Pinia stores (`stores/`)
  - `player.js`: 音乐播放器全局状态（当前歌曲、播放状态、音量等）
- **路由守卫**: 使用 `router.beforeEach` 进行认证检查
  - `requireAuth` meta 字段标记需要认证的路由
- **动态导入**: Firebase 模块按需动态导入以优化包大小
- **组件结构**:
  - `components/global/`: 全局组件（NavBar, MusicPlayer）
  - `components/`: 可复用组件（ListView, AddSongs, OptimizedImage）
  - `views/`: 页面视图组件
- **代码分割**: Vite 配置将 Vue 相关库和其他第三方库分离到不同的 chunks

### Testing Strategy
- 当前项目没有配置测试框架
- 暂无添加测试的计划

### Git Workflow
- **分支策略**: Git Flow
- **提交约定**: 未指定具体约定

## Domain Context
- **歌单 (Playlist)**: 用户创建的音乐集合，包含标题、封面、歌曲列表
- **歌曲 (Song)**: 音频文件，包含标题、URL、上传时间
- **用户认证**: 基于邮箱的注册/登录系统
- **权限控制**: 用户只能访问和操作自己的资源
- **播放器**: 全局音乐播放器，支持播放/暂停、上一首/下一首、进度控制、音量调节

## Important Constraints
- **Firebase Storage 限制**:
  - 歌曲文件: 最大 15MB，仅限音频格式 (`audio/*`)
  - 封面图片: 最大 10MB，仅限图片格式 (`image/*`)
- **认证要求**: 创建歌单、上传文件、管理歌单等功能需要用户登录
- **文件路径结构**:
  - 歌曲: `songs/{userId}/{playlistId}/{songName}`
  - 封面: `cover/{userId}/{imageName}`
- **Firestore 规则**: 仅允许已认证用户读写 playlists 集合

## External Dependencies
- **Firebase Authentication**: 用户邮箱注册/登录
- **Firebase Firestore**: 存储歌单和用户数据
- **Firebase Storage**: 存储音频文件和封面图片
- **Firebase Hosting**: 静态网站托管和部署
