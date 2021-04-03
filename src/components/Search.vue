<template>
  <v-card color="black" height="100vh" class="pa-8">
    <div style="width: 500px" class="d-flex align-center">
      <v-text-field
        v-model="searchKeyword"
        background-color="white"
        rounded
        flat
      />
      <v-icon color="white" class="mx-2">mdi-magnify</v-icon>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "Search",
  data: () => ({
    searchKeyword: "",
  }),
};
</script>

<style>
</style>