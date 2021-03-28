<template>
  <v-main>
    <AppBar />
    <router-view />
  </v-main>
</template>

<script>
import AppBar from "./AppBar.vue";

export default {
  name: "MainView",
  components: {
    AppBar,
  },
};
</script>
