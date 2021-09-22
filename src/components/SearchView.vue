<template>
  <div>
    <v-card color="black" class="pa-8">
      <h2 class="white--text serif mx-4">Search</h2>
      <div style="width: 85vw" class="d-flex align-center">
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
    <results
      v-if="passKeyword"
      :is-search-req="passKeyword"
      :search-keyword="searchKeyword"
    />
    <v-card height="60vh" v-else class="text-center mt-4">
      Search a keyword that you want to see.
    </v-card>
  </div>
</template>

<script>
import Results from "./partial/Results.vue";
export default {
  components: { Results },
  name: "SearchView",
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
