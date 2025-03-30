import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import ObjectList from '../views/ObjectList.vue'
import PageList from '../views/PageList.vue'
import ImportDataPage from '@/views/ImportDataPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/ObjectList',
    name: 'ObjectList',
    component: ObjectList
  }
  , {
    path: '/PageList',
    name: 'PageList',
    component: PageList,
  },
  {
    path: '/ImportDataPage',
    name: 'ImportDataPage',
    component: ImportDataPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
