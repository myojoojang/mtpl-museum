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
          :disabled="isLoading"
          @keydown="hasSearched = false"
          @keyup.enter="search"
          label="Search the collection"
          background-color="white"
          rounded
          flat
          dense
          hide-details
        />
        <v-btn
          :disabled="isLoading"
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
    <CollectionList
      v-if="hasSearched"
      :artworks="artworks"
      :loading="isLoading"
      :error-message="errorMessage"
      @retry="search"
    >
      <template #controls>
        <p
          v-if="!isLoading && !errorMessage"
          class="white--text mx-8 mb-8"
        >
          Showing {{ artworks.length }} of {{ totalResults }} results for '{{ searchKeyword }}'.
        </p>
      </template>
    </CollectionList>
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
import type { Artwork } from '@/types/collection';
import CollectionList from '@/components/collection/CollectionList.vue';
import { collectionApi } from '@/services/collectionApi';

interface SearchState {
  searchKeyword: string;
  hasSearched: boolean;
  artworks: Artwork[];
  totalResults: number;
  isLoading: boolean;
  errorMessage: string;
}

export default defineComponent({
  name: 'SearchView',
  components: { CollectionList },
  data(): SearchState {
    return {
      searchKeyword: '',
      hasSearched: false,
      artworks: [],
      totalResults: 0,
      isLoading: false,
      errorMessage: '',
    };
  },
  methods: {
    async search(): Promise<void> {
      this.hasSearched = true;
      this.isLoading = true;
      this.errorMessage = '';
      this.artworks = [];

      try {
        const searchResult = await collectionApi.search({ keyword: this.searchKeyword });

        this.totalResults = searchResult.total;
        this.artworks = await collectionApi.getArtworks(searchResult.ids);
      } catch (error) {
        this.errorMessage = 'We couldn’t load the search results. Please try again.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>
