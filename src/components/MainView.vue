<template>
  <v-main>
    <AppBar />
    <v-divider class="mb-2" />
    <router-view />
    <Footer />
  </v-main>
</template>

<script>
import AppBar from "./AppBar.vue";

import Footer from "./Footer.vue";

export default {
  name: "MainView",
  components: {
    AppBar,
    Footer,
  },
};
</script>
