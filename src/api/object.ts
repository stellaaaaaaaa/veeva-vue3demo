import { api } from '@/api'
import type { AppObject, PaginationParams } from '@/types'

export const ObjectAPI = {
  // 获取分页列表
  async getList(params: PaginationParams & { search?: string }) {
    return api.get<{ items: AppObject[]; total: number }>('/objects', { params })
  },

  // 创建Object
  async create(data: Omit<AppObject, 'ID'>) {
    return api.post('/object', data)
  },

  // 更新Object
  async update(id: string, data: Partial<AppObject>) {
    return api.put(`/object/${id}`, data)
  },

  // 软删除
  async softDelete(id: string) {
    return api.delete(`/object/${id}`)
  }
}