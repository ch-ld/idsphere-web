import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

// 复制功能
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

Vue.config.productionTip = false

// 加载第三方SDK
export const sdkLoaders = {
  wework: null,
  dingtalk: null,
  feishu: null
}
function loadExternalScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
}
async function loadAuthSDKs() {
  if (process.env.VUE_APP_DINGTALK_CLIENT_ID) {
    sdkLoaders.dingtalk = loadExternalScript('https://g.alicdn.com/dingding/h5-dingtalk-login/0.21.0/ddlogin.js')
  }

  if (process.env.VUE_APP_WECHAT_APP_ID && process.env.VUE_APP_WECHAT_AGENT_ID) {
    sdkLoaders.wework = loadExternalScript('https://wwcdn.weixin.qq.com/node/wework/wwopen/js/wwLogin-1.2.7.js')
  }

  if (process.env.VUE_APP_FEISHU_CLIENT_ID) {
    sdkLoaders.feishu = loadExternalScript('https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.3.js')
  }
}
loadAuthSDKs()

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
