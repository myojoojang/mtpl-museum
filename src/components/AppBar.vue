<template>
  <v-app-bar color="white" flat class="uppercase">
    <div>
      <router-link to="/">
        <div class="serif bold hover">The Metropolitan Museum of Art</div>
      </router-link>
    </div>
    <v-spacer />

    <router-link class="hover mx-2 d-none d-md-flex" to="/explorer"
      >Collection Explorer</router-link
    >
    <router-link class="hover mx-2 d-none d-md-flex" to="/search">
      Search</router-link
    >

    <router-link
      class="hover mx-2 d-none d-flex d-sm-flex d-md-none"
      to="/explorer"
      ><v-icon>mdi-circle</v-icon></router-link
    >
    <router-link
      class="hover mx-2 d-none d-flex d-sm-flex d-md-none"
      to="/search"
    >
      <v-icon>mdi-magnify</v-icon></router-link
    >
  </v-app-bar>
</template>

<script>
export default {
  name: "AppBar",
};
</script>

<style>
</style>