<template>
  <v-app>
    <AppLayout />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppLayout from './components/layout/AppLayout.vue';

export default defineComponent({
  name: 'App',
  components: { AppLayout },
});
</script>
