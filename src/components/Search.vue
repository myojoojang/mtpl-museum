<template>
  <div>
    <v-card color="black" class="pa-8">
      <h2 class="white--text serif mx-4">Search</h2>
      <div style="width: 95vw" class="d-flex align-center">
        <v-text-field
          v-model="searchKeyword"
          background-color="white"
          rounded
          flat
          full-width
          dense
          hide-details
          @keyup.enter="search"
          @keydown="passKeyword = false"
        />
        <v-btn color="white" fab small class="mx-1" @click="search"
          ><v-icon color="black">mdi-magnify</v-icon></v-btn
        >
      </div>
    </v-card>
    <department
      v-if="passKeyword"
      :is-search-req="passKeyword"
      :search-keyword="searchKeyword"
    />
  </div>
</template>

<script>
// import Department from "./Department.vue";

import Department from "./Department.vue";
export default {
  components: { Department },
  name: "Search",
  data: () => ({
    searchKeyword: "",
    passKeyword: false,
  }),
  methods: {
    search() {
      this.passKeyword = true;

      // axios
      //   .get(
      //     `${APIURL}/search?isOnView=true&hasImages=true&q=${this.searchKeyword}`
      //   )
      //   .then((res) => {
      //     console.log(res);
      //     // this.ids = res.data.objectIDs;
      //     // if (!res.data.total) {
      //     //   this.isObjReady = true;
      //     //   this.showND = true;
      //     // } else {

      //     //   this.selectIds();
      //     // }
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });
    },
  },
};
</script>

<style>
</style>