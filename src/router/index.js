import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import ManageParty from '@/components/manage/party'
import VueResource from 'vue-resource'

Vue.use(VueResource)
Vue.use(Router)

Vue.http.interceptors.push(function (request, next) {
  console.log(request)
  next(function (response) {
    if (response.status !== 200) {
      this.$message.error('请求出错')
    } else if (response.body.status !== 0) {
      if (response.body.message !== '') {
        this.$message.error(response.body.message)
      } else {
        this.$message.error('处理出错')
      }
    }
    console.log(response)
  })
})

export default new Router({
  routes: [
    {
      path: '/',
      component: HelloWorld
    },
    {
      path: '/manage/party',
      component: ManageParty
    }
  ]
})
