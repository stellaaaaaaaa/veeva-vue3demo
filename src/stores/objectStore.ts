import { defineStore } from 'pinia'
import { ObjectAPI } from '@/api/object'
import type { AppObject,Object, PaginationParams } from '@/types'

export const useObjectStore = defineStore('object', {
  state: () => ({
    list: [] as AppObject[],
    current: null as AppObject | null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    },
    searchText: ''
  }),

  actions: {
    // 加载分页数据
    async loadList() {
      const params = {
        page: this.pagination.page,
        pageSize: this.pagination.pageSize,
        search: this.searchText
      }

      const { data } = await ObjectAPI.getList(params)
      this.list = data.items
      this.pagination.total = data.total
    },

    // 设置当前选中对象
    setCurrent(object: AppObject | null) {
      this.current = object
    }
  }
})