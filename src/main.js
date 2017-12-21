import Vue from 'vue'
import App from './App'
import router from './router'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import config from './components/config'
import moment from 'moment'
import VueMomentJS from 'vue-momentjs'

Vue.use(VueMomentJS, moment)
Vue.use(Element, { size: 'small' })

Vue.config.productionTip = false

Vue.prototype.config = config
Vue.prototype.timeFormat = function (time, format) {
  if (time && format) {
    return this.$moment(time).format(format)
  }
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
