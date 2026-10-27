<template>
  <v-card ref="gallery" color="black" :aria-busy="loading">
    <v-btn fab small fixed bottom right color="secondary" aria-label="Back to top" @click="toTop">
      <v-icon>mdi-arrow-up</v-icon>
    </v-btn>
    <slot name="header" />
    <v-card-text class="pa-4">
      <slot name="controls" />
      <v-alert v-if="error" type="error" role="alert">
        {{ error }}
        <v-btn text @click="$emit('retry')">Retry</v-btn>
      </v-alert>
      <v-alert v-if="failed" type="warning" role="status">
        {{ failed }} artworks could not be loaded.
      </v-alert>
      <div v-if="!loading && !error && !artworks.length" class="white--text serif larger text-center">
        No artworks found.
      </div>
      <ArtworkCard v-for="(artwork, index) in artworks" :key="artwork.objectID"
        :artwork="artwork" :is-even="index % 2 === 0" />
      <slot name="pagination" />
    </v-card-text>
    <v-overlay :value="loading" absolute opacity="0.6">
      <v-progress-circular color="white" size="40" indeterminate aria-label="Loading artworks" />
    </v-overlay>
  </v-card>
</template>

<script>
import ArtworkCard from "./ArtworkCard.vue";

export default {
  name: "ArtworkGallery",
  components: { ArtworkCard },
  props: {
    artworks: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    error: { type: String, default: "" },
    failed: { type: Number, default: 0 },
  },
  methods: {
    toTop() {
      this.$refs.gallery.$el.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
};
</script>
