import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import ObjectList from '../views/ObjectList.vue'
import PageList from '../views/PageList.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'ObjectList',
    component: ObjectList
  }
  ,{
    path: '/PageList',
    name: 'PageList',
    component: PageList,
  },
  // {
  //   path: '/PageLayout',
  //   name: 'PageLayout',
  //   component: AboutView,
  // },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
