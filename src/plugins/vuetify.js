import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);


const theme = {
  primary:'#000',
  secondary:'#ffe018',
  accent:'#bcbcbc'
}


export default new Vuetify({
  theme: {
    themes: {
      //dark: darkTheme,
      light: theme,
    },
  },
})