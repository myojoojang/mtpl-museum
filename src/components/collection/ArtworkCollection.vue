<template>
  <ArtworkGallery :artworks="state.artworks" :loading="state.loading"
    :error="state.error" :failed="state.failed" @retry="loadCollection()">
    <template v-if="!isSearch" #header>
      <div class="d-flex justify-space-between align-center pa-4">
        <div class="larger serif white--text uppercase">{{ query.keyword }}</div>
        <v-btn icon dark aria-label="Close department" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </template>
    <template #controls>
      <p v-if="isSearch" class="white--text mx-8 mb-8" aria-live="polite">
        {{ state.total }} results for '{{ query.keyword }}'.
      </p>
      <p v-if="isSearch && state.total > resultLimit" class="white--text mx-8 mb-8">
        Showing the first {{ resultLimit.toLocaleString() }} matches. Refine your search to narrow the results.
      </p>
      <div v-if="!isSearch" class="d-flex justify-end align-center mb-6">
        <v-select :value="state.pageSize" :items="pageSizes" label="Artworks"
          class="artwork-count" rounded flat background-color="white"
          :disabled="state.loading" @change="loadCollection(1, $event)" />
        <v-btn x-small fab class="mx-2" aria-label="Refresh artworks"
          :disabled="state.loading || !state.total" @click="loadCollection()">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </template>
    <template #pagination>
      <v-pagination v-if="isSearch && pageCount > 1" :value="state.page"
        :length="pageCount" :total-visible="7" :disabled="state.loading"
        @input="loadCollection($event)" />
    </template>
  </ArtworkGallery>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { CollectionQuery } from "@/types/museum";
import ArtworkGallery from "./ArtworkGallery.vue";
import { MAX_SEARCH_RESULTS } from "@/config/collection";
import { createCollection } from "@/models/collection";
import { museumApi } from "@/services/museum";

export default defineComponent({
  name: "ArtworkCollection",
  components: { ArtworkGallery },
  props: {
    query: { type: Object as PropType<CollectionQuery>, required: true },
  },
  data() {
    const collection = createCollection(museumApi);
    return { collection, state: collection.state, pageSizes: [5, 10, 20, 30, 50], resultLimit: MAX_SEARCH_RESULTS };
  },
  computed: {
    isSearch(): boolean { return this.query.departmentId == null; },
    pageCount(): number { return Math.ceil(Math.min(this.state.total, this.resultLimit) / this.state.pageSize); },
  },
  watch: {
    query: {
      immediate: true,
      handler(query: CollectionQuery) { this.collection.load(query); },
    },
  },
  methods: {
    loadCollection(page?: number, pageSize?: number): Promise<void> {
      return this.collection.load(this.query, page ?? this.state.page, pageSize ?? this.state.pageSize);
    },
  },
  beforeDestroy() { this.collection.dispose(); },
});
</script>

<style scoped>
.artwork-count { max-width: 120px; }
</style>
