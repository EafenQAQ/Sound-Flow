import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { projectAuth } from '@/firebase/config'

const requireAuth = (to, from, next) => {
  const user = projectAuth.currentUser
  console.log('currnet user: ', user)
  if (!user) {
    next({ name: 'login' })
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: requireAuth,
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
      beforeEnter: requireAuth,
    },
  ],
})

export default router
