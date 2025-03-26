import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import ObjectList from '../views/ObjectList.vue'

const routes: Array<RouteRecordRaw> = [
  { 
    path: '/',
    name: 'ObjectList',
    component: ObjectList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
