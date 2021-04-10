<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <a href="https://www.metmuseum.org">
          <v-img src="../assets/home.jpg" height="85vh" class="img"
        /></a>
      </v-col>
      <v-col cols="12" md="6" class="black--text bottom">
        <div>
          <div>
            <v-btn color="secondary" class="ma-3">COLLECTION EXPLORER </v-btn>
            <v-btn color="secondary">SEARCH</v-btn>
          </div>
          <div class="bold larger serif mx-3 mb-8">
            The Metropolitan Museum of Art Collection API
          </div>
          <div class="slim mx-3">
            The Metropolitan Museum of Art presents over 5,000 years of art from
            around the world for everyone to experience and enjoy. The Museum
            lives in three iconic sites in New York City—The Met Fifth Avenue,
            The Met Breuer, and The Met Cloisters. Millions of people also take
            part in The Met experience online.
            <br />
            The Metropolitan Museum of Art provides select datasets of
            information on more than 470,000 artworks in its Collection .
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>

<style scoped>
.img {
  filter: saturate(25%);
  filter: brightness(0.4);
  transition: all ease 0.7s;
}
.img:hover {
  filter: saturate(80%);
  filter: brightness(0.8);
  transition: all ease 0.7s;
}

.bottom {
  display: flex;
  align-self: center;
}
</style>