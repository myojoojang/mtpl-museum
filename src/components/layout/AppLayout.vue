<template>
  <v-main>
    <AppHeader />
    <v-divider class="mb-2" />
    <router-view />
    <AppFooter />
  </v-main>
</template>

<script>
import AppHeader from "./AppHeader.vue";
import AppFooter from "./AppFooter.vue";

export default {
  name: "AppLayout",
  components: {
    AppHeader,
    AppFooter,
  },
};
</script>
