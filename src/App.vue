<template>
  <v-app>
    <SiteLayout />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SiteLayout from './components/layout/SiteLayout.vue';

export default defineComponent({
  name: 'App',
  components: { SiteLayout },
});
</script>
