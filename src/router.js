import Vue from 'vue'
import Router from 'vue-router'
import DashboardLayout from './layout/Layout.vue';
import Starter from './layout/BasePage.vue';
// const Profile = () => import(/* webpackChunkName: "common" */ "@/pages/Profile.vue");
const Profile = () => import(/* webpackChunkName: "common" */ "@/pages/Profile.vue");

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/dashboard',
      component: DashboardLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          components: { default: Starter }
        },
        {
          path: "profile",
          name: "profile",
          component: Profile
        }
      ]
    }
  ]
})
