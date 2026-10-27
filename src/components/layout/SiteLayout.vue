<template>
  <v-main>
    <SiteHeader />
    <v-divider class="mb-2" />
    <router-view />
    <SiteFooter />
  </v-main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';

export default defineComponent({
  name: 'SiteLayout',
  components: {
    SiteHeader,
    SiteFooter,
  },
});
</script>
