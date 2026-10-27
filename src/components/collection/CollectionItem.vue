<template>
  <v-row>
    <v-col
      cols="12"
      md="6"
      class="pa-1"
      :order-md="isEven ? 1 : 2"
    >
      <v-img
        v-if="images.length === 1"
        :src="images[0]"
        :alt="artwork.title"
        class="img-hover"
      />
      <v-carousel
        v-else-if="images.length > 1"
        hide-delimiters
        height="820"
        class="img-hover"
      >
        <v-carousel-item
          v-for="image in images"
          :key="image"
          :src="image"
          :alt="artwork.title"
        />
      </v-carousel>
      <div
        v-else
        class="white--text pa-4"
      >
        No image available.
      </div>
    </v-col>
    <v-col
      cols="12"
      md="6"
      class="pa-0 d-flex align-center"
      :order-md="isEven ? 2 : 1"
      :class="{ 'justify-end text-right': !isEven }"
    >
      <div class="white--text capitalize slim ma-4">
        <div class="larger bold serif my-4">
          {{ artwork.title }}
        </div>
        <span class="bold">{{ artwork.culture || artwork.country }}</span>
        {{ artwork.objectDate }}
        <div>{{ artwork.medium }}</div>
        <div>{{ artwork.dimensions }}</div>
        <div v-if="artwork.accessionYear">
          Accession Year {{ artwork.accessionYear }}
        </div>
        <v-btn
          small
          class="my-2"
          @click="isDialogOpen = true"
        >
          More info
        </v-btn>
      </div>
    </v-col>
    <v-dialog
      v-model="isDialogOpen"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <CollectionItemDetails
        v-if="isDialogOpen"
        :artwork="artwork"
        @close="isDialogOpen = false"
      />
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Artwork } from '@/types/collection';
import CollectionItemDetails from './CollectionItemDetails.vue';

export default defineComponent({
  name: 'CollectionItem',
  components: { CollectionItemDetails },
  props: {
    artwork: {
      type: Object as PropType<Artwork>,
      required: true,
    },
    isEven: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { isDialogOpen: false };
  },
  computed: {
    images(): string[] {
      const imageUrls = [
        this.artwork.primaryImageSmall || this.artwork.primaryImage,
        ...(this.artwork.additionalImages || []),
      ];
      const availableImages = imageUrls.filter((image): image is string => {
        return Boolean(image);
      });

      return [...new Set(availableImages)];
    },
  },
});
</script>
