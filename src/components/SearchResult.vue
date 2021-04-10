<template>
  <div>
    <display-box />
    <template v-for="(el, i) of propsData">
      <display-box
        :prop-data="el"
        :key="el.index"
        :is-even="i % 2 === 0 ? true : false"
      />
      <!-- <display-box :prop-data="el" :key="el.index" v-if="i % 2 === 1" /> -->
    </template>
  </div>
</template>

<script>
import DisplayBox from "./DisplayBox";
export default {
  components: { DisplayBox },
  name: "SearchResult",
  comments: {
    DisplayBox,
  },
  props: {
    propsData: { type: Array, default: null },
  },
};
</script>

<style>
</style>