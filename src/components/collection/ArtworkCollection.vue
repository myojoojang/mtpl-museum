<template>
  <ArtworkGallery :artworks="state.artworks" :loading="state.loading"
    :error="state.error" :failed="state.failed" @retry="collection.retry()">
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
      <div v-else class="d-flex justify-end align-center mb-6">
        <v-select :value="state.pageSize" :items="pageSizes" label="Artworks"
          class="artwork-count" rounded flat background-color="white"
          :disabled="state.loading" @change="collection.setPageSize($event)" />
        <v-btn x-small fab class="mx-2" aria-label="Refresh artworks"
          :disabled="state.loading || !state.ids.length" @click="collection.refresh()">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </template>
    <template #pagination>
      <v-pagination v-if="isSearch && pageCount > 1" :value="state.page"
        :length="pageCount" :total-visible="7" :disabled="state.loading"
        @input="collection.setPage($event)" />
    </template>
  </ArtworkGallery>
</template>

<script>
import ArtworkGallery from "./ArtworkGallery.vue";
import { createCollection } from "@/models/collection.mjs";
import { museumApi, createRequest, isCancelled } from "@/services/museum";

export default {
  name: "ArtworkCollection",
  components: { ArtworkGallery },
  props: {
    query: { type: Object, required: true },
  },
  data() {
    const collection = createCollection({ api: museumApi, createRequest, isCancelled });
    return { collection, state: collection.state, pageSizes: [5, 10, 20, 30, 50] };
  },
  computed: {
    isSearch() { return this.query.departmentId == null; },
    pageCount() { return Math.ceil(this.state.ids.length / this.state.pageSize); },
  },
  watch: {
    query: {
      immediate: true,
      handler(query) { this.collection.load(query); },
    },
  },
  beforeDestroy() { this.collection.dispose(); },
};
</script>

<style scoped>
.artwork-count { max-width: 120px; }
</style>
