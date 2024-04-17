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
        name: 'profile',
        path: 'profile',

        component: () => import('../pages/admin/profile/Profile.vue'),
      },
      {
        name: 'order',
        path: 'order',

        children: [
          {
            name: 'order-info',
            path: 'order-info/:id?',

            component: () => import('../pages/admin/order/order-informations/OrderInformations.vue'),
            props: (route) => ({
              id: route.params.id
                ? Array.isArray(route.params.id)
                  ? parseInt(route.params.id[0])
                  : parseInt(route.params.id)
                : null,
            }),
          },

          {
            name: 'new-order',
            path: 'new-order',

            component: () => import('../pages/admin/order/new-order/NewOrder.vue'),
          },
          {
            name: 'list-products',
            path: 'list-products/:id?/:code?',

            component: () => import('../pages/admin/order/list-products/ListProducts.vue'),
            props: true,
          },
          {
            name: 'add-product-to-order',
            path: 'add-product-to-order/:id/:code?',

            component: () => import('../pages/admin/order/list-products/add-products/AddProducts.vue'),
            props: true,
          },
        ],
      },
      {
        name: 'load',
        path: 'load',

        children: [
          {
            name: 'load-info',
            path: 'load-info',

            component: () => import('../pages/admin/load/load-informations/LoadInformations.vue'),
          },
          {
            name: 'new-load',
            path: 'new-load',

            component: () => import('../pages/admin/load/new-load/NewLoad.vue'),
          },
        ],
      },
      {
        name: 'product',
        path: 'product',

        children: [
          {
            name: 'product-info',
            path: 'product-info',

            component: () => import('../pages/admin/product/product-informations/ProductInformations.vue'),
          },
          {
            name: 'new-product',
            path: 'new-product',

            component: () => import('../pages/admin/product/new-product/NewProduct.vue'),
          },
        ],
      },
      {
        name: 'user',
        path: 'user',

        children: [
          {
            name: 'user-info',
            path: 'user-info',

            component: () => import('../pages/admin/user/user-info/UserInformations.vue'),
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
