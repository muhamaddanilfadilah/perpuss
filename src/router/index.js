import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
  },
   {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/members',
    name: 'members',
    component: () => import('../views/MemberView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/buku',
    name: 'Buku',
    component: () => import('../views/Buku.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/peminjaman',
    name: 'Peminjaman',
    component: () => import('../views/Peminjaman.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pengembalian',
    name: 'Pengembalian',
    component: () => import('../views/Pengembalian.vue'),
    meta: { requiresAuth: true }
  },
    {
    path: '/RiwayatPeminjaman',
    name: 'RiwayatPeminjaman',
    component: () => import('../views/RiwayatPeminjaman.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chart',
    name: 'Chart',
    component: () => import('../views/Chart.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { requiresAuth: true }
  },
  
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ✅ Navigation Guard
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/') // redirect ke login
  } else if (to.path === '/' && isLoggedIn) {
    next('/members') // kalau udah login, langsung ke home
  } else {
    next()
  }
})

export default router
