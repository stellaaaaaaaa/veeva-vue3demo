
import axios from 'axios';

const service = axios.create({
  baseURL: 'http://localhost:5000', // 后端地址
  timeout: 5000
});

// ---------------------------
// PageListField API
// ---------------------------

export interface PageListFieldData {
    ID?: string;
    NAME: string;
    OBJECT_FIELD_ID: string;
    PAGE_LIST_ID: string;
    HIDDEN?: string;
    TYPE: string;
    DELETED?: string;
  }
  
  // 获取页面列表字段分页数据
  export function getPageListFieldList(params: { page: number; page_size: number }) {
    return service.get('/page_list_fields', { params });
  }
  
  // 搜索页面列表字段
  export function searchPageListField(params: { page: number; page_size: number; pagelist_id?: string; name?: string }) {
    return service.get('/page_list_field/search', { params });
  }
  
  // 创建页面列表字段
  export function createPageListField(data: PageListFieldData) {
    return service.post('/page_list_field', [data]);
  }
  
  // 更新页面列表字段
  export function updatePageListField(id: string, data: PageListFieldData) {
    return service.put(`/page_list_field/${id}`, [data]);
  }
  
  // 软删除页面列表字段
  export function deletePageListField(id: string) {
    return service.delete(`/page_list_field/${id}`);
  }
  
  // 恢复页面列表字段
  export function restorePageListField(id: string) {
    return service.put(`/page_list_field/restore/${id}`);
  }
  
  // 永久删除页面列表字段
  export function permanentDeletePageListField(id: string) {
    return service.delete(`/page_list_field/permanent_delete/${id}`);
  }