import axios from 'axios';

const service = axios.create({
  baseURL: 'http://localhost:5000', // 后端地址
  timeout: 5000
});

// ---------------------------
// PageList API
// ---------------------------
export interface PageListData {
  ID?: string;
  NAME: string;
  LABEL: string;
  DELETED?: string;
}

// 获取页面列表分页数据
export function getPageList(params: { page: number; page_size: number }) {
  return service.get('/page_lists', { params });
}

// 搜索页面列表
export function searchPageList(params: { page: number; page_size: number; id?: string; name?: string }) {
  return service.get('/page_list/search', { params });
}

// 创建页面列表
export function createPageList(data: PageListData) {
  return service.post('/page_list', [data]);
}

// 更新页面列表
export function updatePageList(id: string, data: PageListData) {
  return service.put(`/page_list/${id}`, [data]);
}

// 软删除页面列表
export function deletePageList(id: string) {
  return service.delete(`/page_list/${id}`);
}

// 恢复页面列表
export function restorePageList(id: string) {
  return service.put(`/page_list/restore/${id}`);
}

// 永久删除页面列表
export function permanentDeletePageList(id: string) {
  return service.delete(`/page_list/permanent_delete/${id}`);
}