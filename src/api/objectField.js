import axios from 'axios'

const service = axios.create({
  baseURL: 'http://localhost:5000', // 根据实际情况调整
  timeout: 5000
})

// 获取 ObjectField 列表，支持通过参数过滤指定 OBJECT_ID
export function getObjectFieldList(params) {
  return service.get('/object_fields', { params })
}

// 创建 ObjectField
export function createObjectField(data) {
  return service.post('/object_field', [data])
}

// 更新 ObjectField
export function updateObjectField(id, data) {
  return service.put(`/object_field/${id}`, [data])
}

// 软删除 ObjectField
export function deleteObjectField(id) {
  return service.delete(`/object_field/${id}`)
}

// 恢复 ObjectField
export function restoreObjectField(id) {
  return service.put(`/object_field/restore/${id}`)
}

// 永久删除 ObjectField
export function permanentDeleteObjectField(id) {
  return service.delete(`/object_field/permanent_delete/${id}`)
}
