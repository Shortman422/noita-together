import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "@fortawesome/fontawesome-free/css/all.min.css"
import { LoggerPlugin, logger } from './utils/Logger'
import "./assets/normalize.css"

Vue.config.productionTip = false
Vue.use(LoggerPlugin)

logger.debug('Debug logging is enabled')

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')