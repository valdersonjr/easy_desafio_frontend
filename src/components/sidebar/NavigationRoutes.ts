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
      name: 'load',
      displayName: 'menu.load',
      meta: {
        icon: 'vuestic-iconset-load',
      },
      children: [
        {
          name: 'load-info',
          displayName: 'menu.loadInfo',
        },
        {
          name: 'new-load',
          displayName: 'menu.newLoad',
        },
      ],
    },
    {
      name: 'order',
      displayName: 'menu.order',
      meta: {
        icon: 'vuestic-iconset-notepad',
      },
      children: [
        {
          name: 'order-info',
          displayName: 'menu.orderInfo',
        },
        {
          name: 'new-order',
          displayName: 'menu.newOrder',
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
  ] as INavigationRoute[],
}
