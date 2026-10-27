<template>
  <div>
    <v-card
      color="black"
      class="pa-8"
    >
      <h2 class="white--text serif mx-4">
        Search
      </h2>
      <div class="d-flex align-center">
        <v-text-field
          v-model="searchKeyword"
          @keydown="passKeyword = false"
          @keyup.enter="search"
          label="Search the collection"
          background-color="white"
          rounded
          flat
          dense
          hide-details
        />
        <v-btn
          @click="search"
          color="white"
          fab
          small
          class="mx-1"
          aria-label="Search"
        >
          <v-icon color="black">
            mdi-magnify
          </v-icon>
        </v-btn>
      </div>
    </v-card>
    <ArtworkCollection
      v-if="passKeyword"
      :query="collectionQuery"
    />
    <v-card
      v-else
      height="60vh"
      class="text-center mt-4"
    >
      Search a keyword that you want to see.
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { CollectionQuery } from '@/types/museum';
import ArtworkCollection from '@/components/collection/ArtworkCollection.vue';

export default defineComponent({
  name: 'SearchView',
  components: { ArtworkCollection },
  data: () => {
    return {
      searchKeyword: '',
      passKeyword: false,
    };
  },
  computed: {
    collectionQuery(): CollectionQuery {
      return { keyword: this.searchKeyword };
    },
  },
  methods: {
    search() {
      this.passKeyword = true;
    },
  },
});
</script>
