export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

const userLocalStorageExists = Boolean(localStorage.getItem('user'))
// let isAdmin = userLocalStorageExists ? Boolean(JSON.parse(localStorage.getItem('user') as string).profile === 'admin') : false
const isAdmin = true
let routes = [] as INavigationRoute[]

if (isAdmin) {
  routes = [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'load-info',
      displayName: 'menu.load',
      meta: {
        icon: 'vuestic-iconset-load',
      },
      // children: [
      //   {
      //     name: 'load-info',
      //     displayName: 'menu.loadInfo',
      //   },
      //   // {
      //   //   name: 'new-load',
      //   //   displayName: 'menu.newLoad',
      //   // },
      // ],
    },
    // {
    //   name: 'order',
    //   displayName: 'menu.order',
    //   meta: {
    //     icon: 'vuestic-iconset-notepad',
    //   },
    //   children: [
    //     {
    //       name: 'order-info',
    //       displayName: 'menu.orderInfo',
    //     },
    //     // {
    //     //   name: 'new-order',
    //     //   displayName: 'menu.newOrder',
    //     // },
    //   ],
    // },
    {
      name: 'product-info',
      displayName: 'menu.product',
      meta: {
        icon: 'vuestic-iconset-components',
      },
      // children: [
      //   {
      //     name: 'product-info',
      //     displayName: 'menu.productInfo',
      //   },
      //   // {
      //   //   name: 'new-product',
      //   //   displayName: 'menu.newProduct',
      //   // },
      // ],
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
  ] as INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: routes,
}
