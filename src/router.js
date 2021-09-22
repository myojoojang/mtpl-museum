import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import('@/components/HomeView.vue'),
    },
    {
      path: '/explorer',
      component: () => import('@/components/ExplorerView.vue'),
    },
    {
      path: '/search',
      component: () => import('@/components/SearchView.vue'),
    },
    // {
    //   path: '/',
    //   component: () => import('@/components/Album.vue'),
    // },
  ],
})
