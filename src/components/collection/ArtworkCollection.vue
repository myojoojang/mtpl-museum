<template>
  <ArtworkGallery
    :artworks="artworks"
    :loading="isLoading"
    :error-message="errorMessage"
    @retry="loadCollection"
  >
    <template
      v-if="!isKeywordSearch"
      #header
    >
      <div class="d-flex justify-space-between align-center pa-4">
        <div class="larger serif white--text uppercase">
          {{ query.keyword }}
        </div>
        <v-btn
          icon
          dark
          aria-label="Close department"
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </template>
    <template #controls>
      <p
        v-if="isKeywordSearch && !isLoading && !errorMessage"
        class="white--text mx-8 mb-8"
      >
        Showing {{ artworks.length }} of {{ totalResults }} results for '{{ query.keyword }}'.
      </p>
      <div
        v-if="!isKeywordSearch"
        class="d-flex justify-end align-center mb-6"
      >
        <v-select
          v-model="artworkCount"
          :items="artworkCountOptions"
          :disabled="isLoading || !!errorMessage"
          label="Artworks"
          class="artwork-count"
          rounded
          flat
          background-color="white"
          @change="loadArtworks"
        />
        <v-btn
          x-small
          fab
          class="mx-2"
          :disabled="isLoading || !!errorMessage"
          aria-label="Refresh artworks"
          @click="loadArtworks"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </template>
  </ArtworkGallery>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Artwork, CollectionQuery } from '@/types/museum';
import ArtworkGallery from './ArtworkGallery.vue';
import { museumApi } from '@/services/museum';
import { sampleIds } from '@/utils/sampling';

interface CollectionState {
  artworkIds: number[];
  artworks: Artwork[];
  totalResults: number;
  artworkCount: number;
  isLoading: boolean;
  errorMessage: string;
}

export default defineComponent({
  name: 'ArtworkCollection',
  components: { ArtworkGallery },
  props: {
    query: {
      type: Object as PropType<CollectionQuery>,
      required: true,
    },
  },
  data(): CollectionState {
    return {
      artworkIds: [],
      artworks: [],
      totalResults: 0,
      artworkCount: 10,
      isLoading: false,
      errorMessage: '',
    };
  },
  computed: {
    isKeywordSearch(): boolean {
      return this.query.departmentId == null;
    },
    artworkCountOptions(): number[] {
      return [5, 10, 20, 30, 50];
    },
  },
  created() {
    this.loadCollection();
  },
  methods: {
    async loadCollection(): Promise<void> {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const searchResult = await museumApi.search(this.query);

        this.artworkIds = searchResult.ids;
        this.totalResults = searchResult.total;
        await this.loadArtworks();
      } catch (error) {
        this.errorMessage = 'We couldn’t load the collection. Please try again.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadArtworks(): Promise<void> {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        let selectedArtworkIds = this.artworkIds;

        if (!this.isKeywordSearch) {
          selectedArtworkIds = sampleIds(this.artworkIds, this.artworkCount);
        }

        this.artworks = await museumApi.getArtworks(selectedArtworkIds);
      } catch (error) {
        this.errorMessage = 'We couldn’t load the artworks. Please try again.';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>

<style scoped>
.artwork-count {
  max-width: 120px;
}
</style>
