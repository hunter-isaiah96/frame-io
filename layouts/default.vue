<template>
  <v-app dark>
    <v-main>
      <v-container class="main-container pa-0" fluid>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>
<style lang="scss" src="@/scss/main.scss"></style>
<style lang="scss">
  .main-container {
    height: 100%;
    overflow: hidden
  }
</style>
<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js'
    }
  }
}
</script>
