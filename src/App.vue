<template>
<div id="app" v-loading.fullscreen.lock="this.config.fullLoading">
  <router-view v-wechat-title="$route.meta.title" /> </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
a {
  text-decoration: none;
}
</style>
