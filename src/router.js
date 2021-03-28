import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import('@/components/Home.vue'),
    },
    {
      path: '/explorer',
      component: () => import('@/components/Explorer.vue'),
    },
    {
      path: '/search',
      component: () => import('@/components/Search.vue'),
    },
    // {
    //   path: '/',
    //   component: () => import('@/components/Album.vue'),
    // },
  ],
})
