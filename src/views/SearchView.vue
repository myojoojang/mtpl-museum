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
    <ArtworkCollection v-if="submittedKeyword" :query="collectionQuery" />
    <v-card v-else height="60vh" class="text-center mt-4">
      Search a keyword that you want to see.
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { CollectionQuery } from "@/types/museum";
import ArtworkCollection from "@/components/collection/ArtworkCollection.vue";

export default defineComponent({
  name: "SearchView",
  components: { ArtworkCollection },
  data: () => ({ searchKeyword: "", submittedKeyword: "" }),
  computed: {
    collectionQuery(): CollectionQuery { return { keyword: this.submittedKeyword }; },
  },
  methods: {
    search() {
      this.submittedKeyword = this.searchKeyword.trim();
    },
  },
});
</script>
