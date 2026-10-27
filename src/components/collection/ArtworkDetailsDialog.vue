<template>
  <v-card class="artwork-details">
    <div class="text-center">
      <v-btn icon class="my-4" aria-label="Close artwork details" @click="$emit('close')">
        <v-icon>mdi-close-circle</v-icon>
      </v-btn>
    </div>
    <v-row class="pa-0">
      <v-col cols="12" md="6" class="pa-0">
        <v-img :src="artwork.primaryImage || artwork.primaryImageSmall" :alt="artwork.title" />
      </v-col>
      <v-col cols="12" md="6" class="pa-0">
        <div class="ma-4">
          <h2 class="serif my-2">{{ artwork.title }}</h2>
          <dl>
            <div v-for="(value, key) in details" :key="key" class="smaller mb-2">
              <dt class="uppercase bold">{{ key }}</dt>
              <dd>{{ value }}</dd>
            </div>
          </dl>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { flattenArtwork } from "@/utils/artwork.mjs";

export default {
  name: "ArtworkDetailsDialog",
  props: { artwork: { type: Object, required: true } },
  computed: {
    details() { return flattenArtwork(this.artwork); },
  },
};
</script>

<style scoped>
.artwork-details { overflow-x: hidden; overflow-wrap: anywhere; }
</style>
