<template>
  <v-card class="artwork-details">
    <div class="text-center">
      <v-btn
        icon
        class="my-4"
        aria-label="Close artwork details"
        @click="$emit('close')"
      >
        <v-icon>mdi-close-circle</v-icon>
      </v-btn>
    </div>
    <v-row class="pa-0">
      <v-col
        cols="12"
        md="6"
        class="pa-0"
      >
        <v-img
          :src="artwork.primaryImage || artwork.primaryImageSmall"
          :alt="artwork.title"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
        class="pa-0"
      >
        <div class="ma-4">
          <h2 class="serif my-2">
            {{ artwork.title }}
          </h2>
          <dl>
            <div
              v-for="(value, key) in details"
              :key="key"
              class="smaller mb-2"
            >
              <dt class="uppercase bold">
                {{ key }}
              </dt>
              <dd>{{ value }}</dd>
            </div>
          </dl>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Artwork } from '@/types/collection';
import type { FlattenedValues } from '@/utils/flattenObject';
import { flattenObject } from '@/utils/flattenObject';

export default defineComponent({
  name: 'CollectionItemDetails',
  props: {
    artwork: {
      type: Object as PropType<Artwork>,
      required: true,
    },
  },
  computed: {
    details(): FlattenedValues {
      return flattenObject(this.artwork);
    },
  },
});
</script>

<style scoped>
.artwork-details {
  overflow-x: hidden;
  overflow-wrap: anywhere;
}
</style>
