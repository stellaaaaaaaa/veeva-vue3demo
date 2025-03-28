import axios from 'axios';

const service = axios.create({
  baseURL: 'http://localhost:5000', // 后端地址
  timeout: 5000
});
// ---------------------------
// PageLayoutField API
// ---------------------------
export interface PageLayoutFieldData {
    ID?: string;
    NAME: string;
    LABEL: string;
    PAGE_LAYOUT_ID: string;
    OBJECT_FIELD_ID: string;
    TYPE: string;
    DELETED?: string;
  }
  
  // 获取页面布局字段分页数据
  export function getPageLayoutFieldList(params: { page: number; page_size: number }) {
    return service.get('/page_layout_fields', { params });
  }
  
  // 搜索页面布局字段
  export function searchPageLayoutField(params: { page: number; page_size: number; pagelayout_id?: string; name?: string }) {
    return service.get('/page_layout_field/search', { params });
  }
  
  // 创建页面布局字段
  export function createPageLayoutField(data: PageLayoutFieldData) {
    return service.post('/page_layout_field', [data]);
  }
  
  // 更新页面布局字段
  export function updatePageLayoutField(id: string, data: PageLayoutFieldData) {
    return service.put(`/page_layout_field/${id}`, [data]);
  }
  
  // 软删除页面布局字段
  export function deletePageLayoutField(id: string) {
    return service.delete(`/page_layout_field/${id}`);
  }
  
  // 恢复页面布局字段
  export function restorePageLayoutField(id: string) {
    return service.put(`/page_layout_field/restore/${id}`);
  }
  
  // 永久删除页面布局字段
  export function permanentDeletePageLayoutField(id: string) {
    return service.delete(`/page_layout_field/permanent_delete/${id}`);
  }