<template>
  <div>
    <v-card color="black" class="pa-8">
      <h2 class="white--text serif mx-4">Search</h2>
      <form class="d-flex align-center" @submit.prevent="search">
        <v-text-field
          v-model="searchKeyword"
          label="Search the collection"
          background-color="white"
          rounded flat dense hide-details
        />
        <v-btn type="submit" color="white" fab small class="mx-1"
          aria-label="Search" :disabled="!searchKeyword.trim()">
          <v-icon color="black">mdi-magnify</v-icon>
        </v-btn>
      </form>
    </v-card>
    <Displays v-if="submittedKeyword" is-search-req :search-keyword="submittedKeyword" />
    <v-card v-else height="60vh" class="text-center mt-4">
      Search a keyword that you want to see.
    </v-card>
  </div>
</template>

<script>
import Displays from "./partial/Displays.vue";

export default {
  name: "SearchView",
  components: { Displays },
  data: () => ({ searchKeyword: "", submittedKeyword: "" }),
  methods: {
    search() {
      this.submittedKeyword = this.searchKeyword.trim();
    },
  },
};
</script>
