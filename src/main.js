import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueLogger from 'vuejs-logger';
import BlackDashboard from "./plugins/blackDashboard";
import i18n from "./i18n"
import SortedTablePlugin from "vue-sorted-table";
Vue.config.productionTip = false

Vue.use(SortedTablePlugin, {
  ascIcon: '<i class="material-icons">arrow_drop_up</i>',
  descIcon: '<i class="material-icons">arrow_drop_down</i>'
});

//logging options
const isProduction = process.env.NODE_ENV === 'production';
const options = {
  isEnabled: true,
  logLevel : isProduction ? 'error' : 'debug',
  stringifyArguments : false,
  showLogLevel : true,
  showMethodName : true,
  separator: '|',
  showConsoleColors: true
};
Vue.config.productionTip = false

Vue.use(VueLogger, options);
Vue.use(BlackDashboard);

new Vue({
  router,
  i18n,
  store,
  render: h => h(App)
}).$mount('#app')
