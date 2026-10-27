<template>
  <v-row>
    <v-col cols="12" md="6" class="pa-1" :order-md="isEven ? 1 : 2">
      <v-img v-if="images.length === 1" :src="images[0]" :alt="propData.title" class="img-hover" />
      <v-carousel v-else-if="images.length > 1" hide-delimiters height="400" class="img-hover">
        <v-carousel-item v-for="image in images" :key="image" :src="image" :alt="propData.title" />
      </v-carousel>
      <div v-else class="white--text pa-4">No image available.</div>
    </v-col>
    <v-col cols="12" md="6" class="pa-0 d-flex align-center"
      :order-md="isEven ? 2 : 1" :class="{ 'justify-end text-right': !isEven }">
      <div class="white--text capitalize slim ma-4">
        <div class="larger bold serif my-4">{{ propData.title }}</div>
        <span class="bold">{{ propData.culture || propData.country }}</span>
        {{ propData.objectDate }}
        <div>{{ propData.medium }}</div>
        <div>{{ propData.dimensions }}</div>
        <div v-if="propData.accessionYear">Accession Year {{ propData.accessionYear }}</div>
        <v-btn small class="my-2" @click="isDialogOpen = true">More info</v-btn>
      </div>
    </v-col>
    <v-dialog v-model="isDialogOpen" fullscreen transition="dialog-bottom-transition">
      <MoreInfoDlg v-if="isDialogOpen" :prop-data="propData" @img-dlg-close="isDialogOpen = false" />
    </v-dialog>
  </v-row>
</template>

<script>
import MoreInfoDlg from "./MoreInfoDlg.vue";

export default {
  name: "DisplayBox",
  components: { MoreInfoDlg },
  props: {
    propData: { type: Object, required: true },
    isEven: { type: Boolean, default: false },
  },
  data: () => ({ isDialogOpen: false }),
  computed: {
    images() {
      return [...new Set([
        this.propData.primaryImageSmall || this.propData.primaryImage,
        ...(this.propData.additionalImages || []),
      ].filter(Boolean))];
    },
  },
};
</script>
