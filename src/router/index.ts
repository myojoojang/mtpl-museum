import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => {
        return import('@/views/HomeView.vue');
      },
    },
    {
      path: '/explorer',
      component: () => {
        return import('@/views/ExplorerView.vue');
      },
    },
    {
      path: '/search',
      component: () => {
        return import('@/views/SearchView.vue');
      },
    },
  ],
});
