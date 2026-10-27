import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';
import './styles/main.css';

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  render: (h) => {
    return h(App);
  },
}).$mount('#app');
