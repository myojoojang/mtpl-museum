<template>
  <v-app>
    <main-view />
  </v-app>
</template>

<script>
import MainView from "./components/MainView.vue";

export default {
  name: "App",

  components: { MainView },

  data: () => ({
    //
  }),

  methods: {},
};
</script>

<style >
* {
  font-family: "Roboto", sans-serif;
}

html {
  overflow: scroll;
  overflow-x: hidden;
}
::-webkit-scrollbar {
  width: 0px;
  background: transparent; /* make scrollbar transparent */
}

a {
  text-decoration: none;
}

.serif {
  font-family: "Lora", serif !important;
}
.slim {
  font-family: "Roboto Condensed", sans-serif !important;
}

.bold {
  font-weight: 700 !important;
}

.larger {
  font-size: 1.5rem;
}
.smaller {
  font-size: 0.7rem;
}

.uppercase {
  text-transform: uppercase;
}

.capitalize {
  text-transform: capitalize;
}

.hover:hover {
  color: #ffe018;
  transition: all 0.4s ease;
}

.theme--light.v-btn.v-btn--has-bg {
  color: black;
}

.pointer {
  cursor: pointer;
}

div .v-sheet.v-card {
  border-radius: 0px;
  color: black !important;
}

div .v-sheet.v-card:not(.v-sheet--outlined) {
  box-shadow: none;
}
.theme--light.v-card > .v-card__text,
.theme--light.v-card .v-card__subtitle {
  color: black !important;
}
div .v-btn {
  box-shadow: none;
  border-radius: 25px;
  font-weight: 700;
  letter-spacing: 0.25em;
}

.box:hover {
  font-size: 1.65rem;
  transition: all 0.4s ease;
}

.img-hover {
  transition: transform 0.4s;
  filter: saturate(0);
}

.img-hover:hover {
  transform: scale(1.01);
  transition: transform 0.7s;
  filter: saturate(1);
}
</style>