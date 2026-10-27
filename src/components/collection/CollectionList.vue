<template>
  <v-card
    color="black"
    :aria-busy="loading"
  >
    <div ref="galleryTop" />
    <v-btn
      fab
      small
      fixed
      bottom
      right
      color="secondary"
      aria-label="Back to top"
      @click="toTop"
    >
      <v-icon>mdi-arrow-up</v-icon>
    </v-btn>
    <slot name="header" />
    <v-card-text class="pa-4">
      <slot name="controls" />
      <v-alert
        v-if="errorMessage && !loading"
        type="error"
        outlined
        dark
        role="alert"
      >
        <p>{{ errorMessage }}</p>
        <v-btn
          outlined
          small
          @click="$emit('retry')"
        >
          Try again
        </v-btn>
      </v-alert>
      <div
        v-if="!loading && !errorMessage && !artworks.length"
        class="white--text serif larger text-center"
      >
        No artworks found.
      </div>
      <CollectionItem
        v-for="(artwork, index) in artworks"
        :key="`${artwork.objectID}-${index}`"
        :artwork="artwork"
        :is-even="index % 2 === 0"
      />
    </v-card-text>
    <v-overlay
      :value="loading"
      absolute
      opacity="0.6"
    >
      <v-progress-circular
        color="white"
        size="40"
        indeterminate
        aria-label="Loading artworks"
      />
    </v-overlay>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Artwork } from '@/types/collection';
import CollectionItem from './CollectionItem.vue';

export default defineComponent({
  name: 'CollectionList',
  components: { CollectionItem },
  props: {
    artworks: {
      type: Array as PropType<Artwork[]>,
      required: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    toTop() {
      const gallery = this.$refs.galleryTop;

      if (gallery instanceof HTMLElement) {
        gallery.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    },
  },
});
</script>
