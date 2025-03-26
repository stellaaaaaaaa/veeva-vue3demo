import axios from 'axios'

// 创建 axios 实例
const service = axios.create({
  baseURL: 'http://localhost:5000', // 根据后端地址调整
  timeout: 5000
})

// 分页查询 Object，参数包括 page（页码）和 size（每页条数）
// 接口返回格式建议为 { items: [...], total: 数量 }
export function getObjectList(params) {
  return service.get('/objects', { params })
}

// 创建 Object（注意接口数据格式需与后端保持一致，这里采用数组包装）
export function createObject(data) {
  return service.post('/object', [data])
}

// 更新 Object
export function updateObject(id, data) {
  return service.put(`/object/${id}`, [data])
}

// 软删除 Object
export function deleteObject(id) {
  return service.delete(`/object/${id}`)
}

// 恢复 Object
export function restoreObject(id) {
  return service.put(`/object/restore/${id}`)
}

// 永久删除 Object
export function permanentDeleteObject(id) {
  return service.delete(`/object/permanent_delete/${id}`)
}
