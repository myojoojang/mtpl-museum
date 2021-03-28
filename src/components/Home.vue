<template>
  <div>
    <div>
      <img src="../assets/home.jpg" class="imgback" />
      <div class="imgfront white--text mx-4">
        <div>
          <v-btn color="secondary">text</v-btn>
        </div>
        <div class="bold larger serif">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </div>
        <div class="slim">
          Lominus eaque optio quibusdam veniam maxime aperiam! At ea nam rerum
          possimus illo labore ducimus veniam. Sit, odio. Quia, a facere. Lorem
          ipsum dolor sit amet consectetur adipisicing elit. Ducimus, at. Ullam
          ratione quae quisquam ut minus perferendis repellat, adipisci unde
          facilis, dolorum neque laudantium fugiat eum, consectetur facere
          voluptate veritatis!
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>

<style scoped>
.imgback {
  position: absolute;
  width: 100%;
  filter: saturate(25%);
  filter: brightness(0.4);
  transition: all ease 0.7s;

  /* z-index: -1; */
}
.imgback:hover {
  filter: saturate(80%);
  filter: brightness(0.8);
  transition: all ease 0.7s;
  /* z-index: -1; */
}
.imgfront {
  position: absolute;
  z-index: 10;
  bottom: 20%;
}
</style>