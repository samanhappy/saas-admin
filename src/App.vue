<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  created: function () {
    if (this.$route.query.token) {
      this.config.token = this.$route.query.token
    }
    if (this.$route.query.appId) {
      this.config.appId = this.$route.query.appId
    }
  }
}
</script>

<style>
a {
  text-decoration: none;
}
</style>
