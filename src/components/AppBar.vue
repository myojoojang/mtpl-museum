<template>
  <v-app-bar color="white" flat class="uppercase">
    <router-link to="/">
      <div class="serif bold hover">The Metropolitan Museum of Art</div>
    </router-link>

    <v-spacer />
    <router-link class="hover mx-2" to="/explorer">Explorer</router-link>
    <router-link class="hover mx-2" to="/search"> Search</router-link>
  </v-app-bar>
</template>

<script>
export default {
  name: "AppBar",
};
</script>

<style>
</style>