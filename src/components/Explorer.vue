<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" v-for="dep of deps" :key="dep.displayId">
        <div
          @click="openDlg(dep)"
          style="height: 100px"
          class="d-flex justify-center align-center serif white hover pointer"
        >
          <div class="box serif bold larger">{{ dep.displayName }}</div>
        </div>
      </v-col>
    </v-row>
    <v-dialog
      fullscreen
      transition="dialog-bottom-transition"
      v-model="isDlgOpen"
    >
      <results
        v-if="isDlgOpen"
        :dep-data="depData"
        @dep-dlg-close="isDlgOpen = false"
      />
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { APIURL } from "@/GlobalVars";

import Results from "./Results.vue";
export default {
  components: { Results },
  name: "Explorer",
  data: () => ({
    deps: [],
    isDlgOpen: false,
    depData: {},
  }),
  created() {
    this.getData();
  },
  methods: {
    getData() {
      axios
        .get(`${APIURL}/departments`)
        .then((res) => {
          // console.log(res);
          this.deps = res.data.departments;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    openDlg(dep) {
      console.log(dep);
      this.depData = dep;
      this.isDlgOpen = true;
    },
  },
};
</script>
