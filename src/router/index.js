import Vue from 'vue'
import Router from 'vue-router'
import PartyIndex from '@/components/party/index'
import VueResource from 'vue-resource'
import {
  Base64
} from 'js-base64'
import VueWechatTitle from 'vue-wechat-title'

Vue.use(VueWechatTitle)
Vue.use(VueResource)
Vue.use(Router)

const _import = require('./_import_' + process.env.NODE_ENV)

Vue.http.interceptors.push(function(request, next) {
  if (this.config.user.token) {
    request.headers.set('userToken', this.config.user.token)
    request.headers.set('appId', this.config.appId)
    request.headers.set('type', this.config.type)
  } else if (this.$route.query.token && this.$route.query.appId && this.$route.query.type) {
    this.config.token = this.$route.query.token
    this.config.appId = this.$route.query.appId
    this.config.type = this.$route.query.type
    request.headers.set('token', this.config.token)
    request.headers.set('appId', this.config.appId)
    request.headers.set('type', this.config.type)
  } else {
    this.$message.error('用户信息不正确')
    next(request.respondWith('', {
      status: 403,
      statusText: 'Forbidden'
    }))
    return false
  }
  console.log(request)
  const loading = this.$loading()
  next(function(response) {
    loading.close()
    if (response.headers.get('user')) {
      this.config.user = JSON.parse(Base64.decode(response.headers.get('user')))
    }
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

export const constantRouterMap = [{
  path: '/party/index.html',
  component: PartyIndex,
  meta: {
    title: '入党管理'
  }
}, {
  path: '/login',
  component: _import('login/index'),
  hidden: true
}]

export default new Router({
  routes: constantRouterMap
})
