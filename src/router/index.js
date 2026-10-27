import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/explorer',
      component: () => import('@/views/ExplorerView.vue'),
    },
    {
      path: '/search',
      component: () => import('@/views/SearchView.vue'),
    },
    { path: '*', redirect: '/' },
  ],
})
