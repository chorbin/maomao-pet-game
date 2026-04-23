import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
  },
  {
    path: '/fish-pond',
    name: 'FishPond',
    component: () => import('@/views/FishPond/index.vue'),
  },
  {
    path: '/street',
    name: 'Street',
    component: () => import('@/views/Street/index.vue'),
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('@/views/Shop/index.vue'),
  },
  {
    path: '/backpack',
    name: 'Backpack',
    component: () => import('@/views/Backpack/index.vue'),
  },
  {
    path: '/wardrobe',
    name: 'Wardrobe',
    component: () => import('@/views/Wardrobe/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
