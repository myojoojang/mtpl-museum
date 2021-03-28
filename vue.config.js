module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  devServer:{
    proxy:`https://collectionapi.metmuseum.org/public/collection/v1`
  }
}
