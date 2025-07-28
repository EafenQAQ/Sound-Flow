import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { getCurrentUser } from '@/composables/getUser'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignupView.vue'),
    },
    {
      path: '/playlists/create',
      name: 'createPlaylist',
      component: () => import('@/views/playlists/CreatePlaylist.vue'),
      meta: {
        requireAuth: true,
      },
    },
    {
      path: '/playlists/:id',
      name: 'playlistDetails',
      component: () => import('@/views/playlists/PlaylistDetails.vue'),
      meta: {
        requireAuth: true,
      },
      props: true,
    },
    {
      path: '/playlists/user/:userId',
      name: 'userPlaylist',
      component: () => import('@/views/playlists/UserPlaylist.vue'),
      meta: {
        requireAuth: true,
      },
      props: true,
    },
    {
      path: '/playlist/manager',
      name: 'playlistManager',
      component: () => import('@/views/management/playlistManager.vue'),
      meta: {
        requireAuth: true,
      },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const requireAuth = to.matched.some((record) => record.meta.requireAuth)

  if (requireAuth) {
    const user = await getCurrentUser()
    if (!user) {
      next({ name: 'login' })
      return
    }
  }

  next()
})

export default router
