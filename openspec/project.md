# Project Context

## Purpose
Sound-Flow is a modern online music streaming platform that makes music sharing simple and elegant. The application provides users with a seamless music listening experience across desktop and mobile devices, featuring playlist management, cloud storage, and user authentication.

## Tech Stack
- **Frontend Framework**: Vue 3 with Composition API
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Build Tool**: Vite 7.0
- **Backend Services**: Firebase (Authentication, Firestore, Storage)
- **Deployment**: Firebase Hosting
- **Development Tools**: ESLint, Prettier, Vue DevTools

## Project Conventions

### Code Style
- Use Vue 3 Composition API with `<script setup>` syntax
- Follow Prettier formatting rules (configured in `.prettierrc.json`)
- Use ESLint for code quality (configured in `eslint.config.js`)
- Component naming: PascalCase for components (e.g., `MusicPlayer.vue`, `NavBar.vue`)
- File naming: kebab-case for composables and utilities (e.g., `useLogin.js`, `getCollection.js`)
- Use `@/` alias for imports from `src/` directory

### Architecture Patterns
- **Component Organization**: Global components in `src/components/global/`, feature-specific components in `src/components/`
- **State Management**: Pinia stores in `src/stores/` (e.g., `player.js` for music player state)
- **Composables**: Reusable logic in `src/composables/` following `use*` pattern for actions and `get*` for data fetching
- **Views**: Page-level components in `src/views/` organized by feature (auth, playlists, management)
- **Firebase Integration**: Configuration in `src/firebase/`, composables for Firebase operations

### Testing Strategy
- Currently no formal testing framework configured
- Manual testing through development server (`npm run dev`)
- Responsive testing using `test-responsive.html`

### Git Workflow
- Main branch for production
- Feature branches for new functionality
- Commit messages should be descriptive and follow conventional format
- Use `npm run lint` and `npm run format` before committing

## Domain Context
- **Music Player**: Core functionality includes play/pause, next/previous, progress control, volume adjustment
- **Playlists**: Users can create, edit, delete playlists with custom covers
- **Song Management**: Upload music files to Firebase Storage, batch delete songs
- **User Authentication**: Email/password registration and login via Firebase Auth
- **Responsive Design**: Mobile-first approach with breakpoints at 640px
- **Cloud Storage**: All user data (playlists, songs) stored in Firebase Firestore and Storage

## Important Constraints
- Firebase is the sole backend provider - no alternative backend services
- All user data must be stored in Firebase (Firestore for metadata, Storage for audio files)
- Application must work offline for cached content
- Mobile responsiveness is critical - touch gestures must be supported
- Audio playback must continue across page navigation (global player component)

## External Dependencies
- **Firebase Authentication**: User authentication and session management
- **Firebase Firestore**: NoSQL database for playlists, songs, and user data
- **Firebase Storage**: Cloud storage for audio files and images
- **Firebase Hosting**: Static site hosting and deployment
- **Firebase Functions**: Server-side functions (configured in `functions/` directory)

## File Structure Conventions
```
src/
├── components/
│   ├── global/          # Global components (NavBar, MusicPlayer)
│   └── [feature]/       # Feature-specific components
├── views/
│   ├── auth/           # Authentication views (Login, Signup)
│   ├── playlists/      # Playlist management views
│   └── management/     # Management views
├── stores/             # Pinia stores
├── composables/        # Reusable composition functions
├── firebase/           # Firebase configuration
└── router/             # Vue Router configuration
```
