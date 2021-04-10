<template>
  <v-card color="black">
    <section id="scroll-to"><div /></section>
    <a href="#scroll-to"
      ><v-btn fab small dark fixed bottom right color="secondary">
        <v-icon>mdi-arrow-up</v-icon>
      </v-btn>
    </a>
    <div
      v-if="!isSearchReq"
      class="d-flex justify-space-between align-center pa-4"
    >
      <div class="larger serif white--text uppercase">
        {{ depData.displayName }}
      </div>
      <v-spacer />

      <v-icon @click="$emit('dep-dlg-close')" color="white">mdi-close</v-icon>
    </div>
    <v-card-text class="pa-4">
      <p v-if="isSearchReq" class="white--text mx-8 mb-8">
        {{ totalLength }} results for '{{ searchKeyword }}'.
      </p>
      <div v-if="!isSearchReq" class="d-flex justify-end align-center mb-6">
        <div style="width: 100px">
          <v-select
            rounded
            flat
            background-color="white"
            v-model="nums"
            :items="numList"
            @change="selectIds"
          />
        </div>
        <v-btn x-small @click="selectIds" fab class="mx-2">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
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
import { APIURL } from "@/GlobalVars";

export default {
  name: "Results",
  props: {
    depData: { type: Object, default: null },
    isSearchReq: { type: Boolean, default: false },
    searchKeyword: { type: String, default: "" },
  },
  components: {
    DisplayBox,
  },
  data: () => ({
    fab: false,
    nums: 10,
    objArray: [],
    isObjReady: false,
    showND: false,
    numList: [5, 10, 20, 30, 50],
    totalLength: null,
  }),
  beforeMount() {
    // console.log(this.depData);
    if (!this.isSearchReq) {
      const depId = this.depData.departmentId;
      this.query = `${APIURL}/search?departmentId=${depId}&hasImages=true&q=${this.depData.displayName}`;
    } else {
      this.query = `${APIURL}/search?hasImages=true&isHighlight=true&q=${this.searchKeyword}`;
    }
    this.getData();
  },
  methods: {
    getData() {
      axios
        .get(this.query)
        .then((res) => {
          this.ids = res.data.objectIDs;
          this.totalLength = res.data.total;

          if (!res.data.total) {
            this.isObjReady = true;
            this.showND = true;
          } else {
            if (this.ids.length < this.nums) {
              this.nums = this.ids.length;
            }
            if (!this.isSearchReq) {
              this.selectIds();
            } else {
              this.selectIdsForPagenation();
            }
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

    selectIdsForPagenation() {
      this.isObjReady = false;
      this.objArray = [];
      // const items = [];
      const ids = this.ids;
      // for (let i = 0; i < this.ids; i++) {
      //   items[i] = ids[Math.floor(Math.random() * ids.length)];
      // }

      for (let item of ids) {
        this.getObjectData(item);
      }
    },
    getObjectData(item) {
      axios
        .get(`${APIURL}/objects/${item}`)
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

    onScroll(e) {
      if (typeof window === "undefined") return;
      const top = window.pageYOffset || e.target.scrollTop || 0;
      this.fab = top > 20;
    },
    toTop() {
      this.$vuetify.goTo(0);
    },
  },
};
</script>