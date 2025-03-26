import axios from 'axios'

const service = axios.create({
  baseURL: 'http://localhost:5000', // 后端地址
  timeout: 5000
})

export interface ObjectData {
  ID?: string
  NAME: string
  LABEL: string
  TABLE_NAME: string
  // 其他字段…
}

// 分页查询，参数包含 page 与 size
export function getObjectList(params: { page: number; size: number }) {
  return service.get('/objects', { params })
}

export function createObject(data: ObjectData) {
  // 后端接口要求数据格式为数组形式
  return service.post('/object', [data])
}

export function updateObject(id: string, data: ObjectData) {
  return service.put(`/object/${id}`, [data])
}

export function deleteObject(id: string) {
  return service.delete(`/object/${id}`)
}

export function restoreObject(id: string) {
  return service.put(`/object/restore/${id}`)
}

export function permanentDeleteObject(id: string) {
  return service.delete(`/object/permanent_delete/${id}`)
}
