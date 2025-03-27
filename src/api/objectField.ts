import axios from 'axios'

const service = axios.create({
  baseURL: 'http://localhost:5000', // 后端地址
  timeout: 5000
})

export interface ObjectFieldData {
  ID?: string
  NAME: string
  LABEL: string
  TYPE: string
  OBJECT_ID: string
  // 其他字段…
}

export function getObjectFieldList(params?: { OBJECT_ID?: string }) {
  return service.get('/object_fields', { params })
}

export function getObjectFieldListByObjid(params: { obj_id: string; page: number; page_size: number }) {
  return service.get('/object_fields/by_objid', { params })
}

export function createObjectField(data: ObjectFieldData) {
  return service.post('/object_field', [data])
}

export function updateObjectField(id: string, data: ObjectFieldData) {
  return service.put(`/object_field/${id}`, [data])
}

export function deleteObjectField(id: string) {
  return service.delete(`/object_field/${id}`)
}

export function restoreObjectField(id: string) {
  return service.put(`/object_field/restore/${id}`)
}

export function permanentDeleteObjectField(id: string) {
  return service.delete(`/object_field/permanent_delete/${id}`)
}
