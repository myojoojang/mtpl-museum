<template>
  <v-card>
    <div class="text-center">
      <v-icon class="my-4" @click="$emit('img-dlg-close')"
        >mdi-close-circle</v-icon
      >
    </div>
    <v-row class="pa-0">
      <v-col cols="12" md="6" class="pa-0">
        <v-img :src="propData.primaryImage" />
      </v-col>
      <v-col cols="12" md="6" class="pa-0">
        <div class="ma-4">
          <template v-for="(val, key) in data">
            <div class="smaller" v-if="val" :key="key">
              <span class="upppercase bold">{{ key }}</span>
              <span class="mx-4">{{ val }}</span>
            </div>
          </template>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: "FullImg",
  props: {
    propData: { type: Object, default: null },
  },
  beforeMount() {
    this.data = this.flatten(this.propData);
  },
  methods: {
    flatten(object) {
      let value = {};
      for (var property in object) {
        if (typeof object[property] === "object") {
          for (var p in object[property]) {
            value[p] = object[property][p];
          }
        } else {
          value[property] = object[property];
        }
      }

      return value;
    },
  },
};
</script>
