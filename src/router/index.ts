import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useGlobalStore } from '../stores/global-store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:catchAll(.*)',
    redirect: { name: 'dashboard' },
  },
  {
    name: 'admin',
    path: '/admin',
    component: AppLayout,
    meta: {
      auth: true,
    },
    children: [
      {
        name: 'user',
        path: 'user',

        children: [
          {
            name: 'user-info',
            path: 'user-info',

            component: () => import('../pages/admin/user/user-info/UserInfo.vue'),
          },
          {
            name: 'new-user',
            path: 'new-user',

            component: () => import('../pages/admin/user/new-user/NewUser.vue'),
          },
        ],
      },
      {
        name: 'dashboard',
        path: 'dashboard',

        component: () => import('../pages/admin/dashboard/Dashboard.vue'),
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'login',
        path: 'login',

        component: () => import('../pages/auth/login/Login.vue'),
      },
      {
        name: 'signup',
        path: 'signup',

        component: () => import('../pages/auth/signup/Signup.vue'),
      },
      {
        name: 'recover-password',
        path: 'recover-password',

        component: () => import('../pages/auth/recover-password/RecoverPassword.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // For some reason using documentation example doesn't scroll on page navigation.
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      document.querySelector('.app-layout__page')?.scrollTo(0, 0)
    }
  },
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.meta?.auth) {
    const isAuth = await useGlobalStore().checkToken()
    isAuth ? next() : next({ name: 'login' })
  } else {
    next()
  }
})

export default router
