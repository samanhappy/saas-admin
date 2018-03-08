import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import config from './components/config'
import moment from 'moment'
import VueMomentJS from 'vue-momentjs'
import '@/styles/index.scss' // global css
import i18n from './lang' // Internationalization

Vue.use(VueMomentJS, moment)
Vue.use(Element, {
  size: 'small',
  i18n: (key, value) => i18n.t(key, value)
})

Vue.config.productionTip = false
Vue.prototype.config = config
Vue.prototype.timeFormat = function(time, format) {
  if (time && format) {
    return this.$moment(time).format(format)
  }
}

Vue.prototype.endWith = function(str, val) {
  if (val == null || val === '' || str.length === 0 || val.length > str.length) {
    return false
  }
  if (str.substring(str.length - val.length) === val) {
    return true
  } else {
    return false
  }
}

Vue.prototype.startWith = function(str, val) {
  if (val == null || val === '' || str.length === 0 || val.length > str.length) {
    return false
  }
  if (str.substr(0, val.length) === val) {
    return true
  } else {
    return false
  }
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: {
    App
  }
})
