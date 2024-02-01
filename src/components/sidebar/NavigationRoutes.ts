export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'user',
      displayName: 'menu.user',
      meta: {
        icon: 'vuestic-iconset-user',
      },
      children: [
        {
          name: 'user-info',
          displayName: 'menu.userInfo',
        },
        {
          name: 'new-user',
          displayName: 'menu.newUser',
        },
      ],
    },
    {
      name: 'product',
      displayName: 'menu.product',
      meta: {
        icon: 'vuestic-iconset-components',
      },
      children: [
        {
          name: 'product-info',
          displayName: 'menu.productInfo',
        },
        {
          name: 'new-product',
          displayName: 'menu.newProduct',
        },
      ],
    },
  ] as INavigationRoute[],
}
