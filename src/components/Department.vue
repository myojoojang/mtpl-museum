<template>
  <v-card color="black">
    <div class="d-flex justify-space-between align-center white--text pa-4">
      <div class="larger serif uppercase">{{ depData.displayName }}</div>
      <v-spacer />
      <div @click="selectIds" class="pointer mx-4 img-hover serif">
        <v-icon small color="white">mdi-refresh</v-icon>
        get new recomendations
      </div>
      <v-icon @click="$emit('dep-dlg-close')" color="white">mdi-close</v-icon>
    </div>
    <v-card-text class="pa-4">
      <div v-if="showND" class="white--text serif larger text-center">
        No Data
      </div>
      <template v-for="(el, i) of objArray">
        <display-box
          :prop-data="el"
          :key="el.index"
          :is-even="i % 2 === 0 ? true : false"
        />
        <!-- <display-box :prop-data="el" :key="el.index" v-if="i % 2 === 1" /> -->
      </template>
    </v-card-text>

    <v-overlay
      class="text-center"
      z-index="9999"
      opacity="0.6"
      :value="!isObjReady"
    >
      <v-progress-circular color="white" size="40" indeterminate />
    </v-overlay>
  </v-card>
</template>

<script>
import axios from "axios";
import DisplayBox from "./DisplayBox.vue";

export default {
  name: "Department",
  props: {
    depData: { type: Object, default: null },
  },
  components: {
    DisplayBox,
  },
  data: () => ({
    depId: null,
    nums: 10,
    objArray: [],
    isObjReady: false,
    showND: false,
  }),
  beforeMount() {
    this.depId = this.depData.departmentId;
    this.getData();
  },
  methods: {
    getData() {
      axios
        .get(
          `/search?departmentId=${this.depId}&isOnView=true&hasImages=true&q=${this.depData.displayName}`
        )
        .then((res) => {
          this.ids = res.data.objectIDs;
          if (!res.data.total) {
            this.isObjReady = true;
            this.showND = true;
          } else {
            if (this.ids.length < this.nums) {
              this.nums = this.ids.length;
            }

            this.selectIds();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    selectIds() {
      this.isObjReady = false;
      this.objArray = [];
      const items = [];
      const ids = this.ids;
      for (let i = 0; i < this.nums; i++) {
        items[i] = ids[Math.floor(Math.random() * ids.length)];
      }

      for (let item of items) {
        this.getObjectData(item);
      }
    },
    getObjectData(item) {
      axios
        .get(`/objects/${item}`)
        .then((res) => {
          // console.log(res);
          const obj = res.data;
          this.objArray.push(obj);
          if (this.objArray.length >= this.nums) {
            this.isObjReady = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>