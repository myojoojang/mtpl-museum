<template>
  <v-card ref="gallery" color="black" :aria-busy="loading">
    <v-btn fab small fixed bottom right color="secondary" aria-label="Back to top" @click="toTop">
      <v-icon>mdi-arrow-up</v-icon>
    </v-btn>
    <div v-if="!isSearchReq" class="d-flex justify-space-between align-center pa-4">
      <div class="larger serif white--text uppercase">{{ depData.displayName }}</div>
      <v-btn icon dark aria-label="Close department" @click="$emit('dep-dlg-close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-card-text class="pa-4">
      <p v-if="isSearchReq" class="white--text mx-8 mb-8" aria-live="polite">
        {{ total }} results for '{{ searchKeyword }}'.
      </p>
      <div v-else class="d-flex justify-end align-center mb-6">
        <v-select v-model="pageSize" :items="pageSizes" label="Artworks"
          class="artwork-count" rounded flat background-color="white"
          :disabled="loading" @change="loadArtworks" />
        <v-btn x-small fab class="mx-2" aria-label="Refresh artworks"
          :disabled="loading || !ids.length" @click="loadArtworks">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
      <v-alert v-if="error" type="error" role="alert">
        {{ error }}
        <v-btn text @click="retry">Retry</v-btn>
      </v-alert>
      <v-alert v-if="failed" type="warning" role="status">
        {{ failed }} artworks could not be loaded.
      </v-alert>
      <div v-if="!loading && !error && !artworks.length" class="white--text serif larger text-center">
        No artworks found.
      </div>
      <display-box v-for="(artwork, index) in artworks" :key="artwork.objectID"
        :prop-data="artwork" :is-even="index % 2 === 0" />
      <v-pagination v-if="isSearchReq && pageCount > 1" v-model="page"
        :length="pageCount" :total-visible="7" :disabled="loading" @input="loadArtworks" />
    </v-card-text>
    <v-overlay :value="loading" absolute opacity="0.6">
      <v-progress-circular color="white" size="40" indeterminate aria-label="Loading artworks" />
    </v-overlay>
  </v-card>
</template>

<script>
import DisplayBox from "./DisplayBox.vue";
import { museumApi, createRequest, isCancelled } from "@/services/museum";
import { sampleIds } from "@/services/museum-api.mjs";

export default {
  name: "Displays",
  components: { DisplayBox },
  props: {
    depData: { type: Object, default: () => ({}) },
    isSearchReq: { type: Boolean, default: false },
    searchKeyword: { type: String, default: "" },
  },
  data: () => ({
    ids: [], artworks: [], total: 0, failed: 0,
    page: 1, pageSize: 10, pageSizes: [5, 10, 20, 30, 50],
    loading: false, error: "", searchFailed: false, request: null,
  }),
  computed: {
    pageCount() { return Math.ceil(this.ids.length / this.pageSize); },
  },
  watch: {
    searchKeyword: "loadCollection",
    depData: "loadCollection",
    isSearchReq: "loadCollection",
  },
  created() { this.loadCollection(); },
  beforeDestroy() {
    if (this.request) this.request.cancel();
  },
  methods: {
    beginRequest() {
      if (this.request) this.request.cancel();
      const request = createRequest();
      this.request = request;
      this.loading = true;
      this.error = "";
      this.failed = 0;
      this.artworks = [];
      return request;
    },
    async loadCollection() {
      const request = this.beginRequest();
      this.ids = [];
      this.total = 0;
      this.page = 1;
      this.searchFailed = false;
      try {
        const result = await museumApi.search({
          keyword: this.isSearchReq ? this.searchKeyword : this.depData.displayName,
          departmentId: this.isSearchReq ? undefined : this.depData.departmentId,
          cancelToken: request.token,
        });
        if (this.request !== request) return;
        this.ids = result.ids;
        this.total = result.total;
        await this.fetchArtworks(request);
      } catch (error) {
        if (this.request === request && !isCancelled(error)) {
          this.searchFailed = true;
          this.error = "Unable to load the collection. Please try again.";
        }
      } finally {
        if (this.request === request) this.loading = false;
      }
    },
    async loadArtworks() {
      const request = this.beginRequest();
      try {
        await this.fetchArtworks(request);
      } catch (error) {
        if (this.request === request && !isCancelled(error)) {
          this.error = "Unable to load artworks. Please try again.";
        }
      } finally {
        if (this.request === request) this.loading = false;
      }
    },
    async fetchArtworks(request) {
      const start = (this.page - 1) * this.pageSize;
      const selected = this.isSearchReq
        ? this.ids.slice(start, start + this.pageSize)
        : sampleIds(this.ids, this.pageSize);
      const result = await museumApi.getArtworks(selected, { cancelToken: request.token });
      if (this.request !== request) return;
      this.artworks = result.artworks;
      this.failed = result.failed;
      if (selected.length && !result.artworks.length) {
        this.error = "Unable to load artworks. Please try again.";
      }
    },
    retry() {
      if (this.searchFailed) this.loadCollection();
      else this.loadArtworks();
    },
    toTop() {
      this.$refs.gallery.$el.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
};
</script>

<style scoped>
.artwork-count { max-width: 120px; }
</style>
