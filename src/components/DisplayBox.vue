<template>
  <v-row>
    <template v-if="isEven">
      <v-col cols="12" md="6" class="pa-1">
        <template v-if="isImgReady">
          <v-img
            v-if="imgArr.length < 2"
            :src="propData.primaryImageSmall"
            class="img-hover"
          />

          <v-carousel v-else hide-delimiters class="img-hover">
            <v-carousel-item
              v-for="(item, i) in imgArr"
              :key="i"
              :src="item"
            ></v-carousel-item>
          </v-carousel>
        </template>
      </v-col>
      <v-col cols="12" md="6" class="pa-0 d-flex align-center">
        <div class="white--text capitalize slim ma-4">
          <div class="larger bold serif my-4">{{ propData.title }}</div>
          <span class="bold">{{ propData.culture || propData.country }}</span>
          {{ propData.objectDate }}
          <div>{{ propData.medium }}</div>
          <div>{{ propData.dimensions }}</div>
          <div>Accession Year {{ propData.accessionYear }}</div>
          <!-- <div>{{ propData.tags }}</div> -->
          <v-btn small @click="openDlg(propData)" class="my-2">more info</v-btn>
        </div>
      </v-col>
    </template>
    <template v-else>
      <v-col
        cols="12"
        md="6"
        class="pa-0 d-flex align-center justify-end text-right"
      >
        <div class="white--text capitalize slim ma-4">
          <div class="larger bold serif my-4">{{ propData.title }}</div>
          <span class="bold">{{ propData.culture || propData.country }}</span>
          {{ propData.objectDate }}
          <div>{{ propData.medium }}</div>
          <div>{{ propData.dimensions }}</div>
          <div>Accession Year {{ propData.accessionYear }}</div>
          <!-- <div>{{ propData.tags }}</div> -->
          <v-btn small @click="openDlg(propData)" class="my-2">more info</v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="6" class="pa-1">
        <!-- {{ propData }} -->
        <template v-if="isImgReady">
          <v-img
            v-if="imgArr.length < 2"
            class="img-hover"
            :src="propData.primaryImageSmall"
          />

          <v-carousel v-else hide-delimiters class="img-hover">
            <v-carousel-item
              v-for="(item, i) in imgArr"
              :key="i"
              :src="item"
            ></v-carousel-item>
          </v-carousel>
        </template>
      </v-col>
    </template>
    <v-dialog
      fullscreen
      transition="dialog-bottom-transition"
      v-model="isDlgOpen"
    >
      <full-img :prop-data="info" @img-dlg-close="isDlgOpen = false" />
    </v-dialog>
  </v-row>
</template>

<script>
import FullImg from "./FullImg.vue";
export default {
  components: { FullImg },
  name: "DisplayBox",
  props: {
    propData: { type: Object, default: null },
    isEven: { type: Boolean, default: false },
  },
  data: () => ({
    imgArr: [],
    isImgReady: false,
    info: false,
    isDlgOpen: false,
  }),
  beforeMount() {
    this.sortImg();
  },
  methods: {
    sortImg() {
      let additional = this.propData.additionalImages;

      if (additional.length > 1) {
        this.imgArr.push(this.propData.primaryImageSmall);
        for (let src of additional) {
          this.imgArr.push(src);
        }
      }
      this.isImgReady = true;
    },

    openDlg(obj) {
      this.isDlgOpen = true;
      this.info = obj;
    },
  },
};
</script>
