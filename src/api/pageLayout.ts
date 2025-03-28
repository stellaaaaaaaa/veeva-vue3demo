import axios from 'axios';

const service = axios.create({
  baseURL: 'http://localhost:5000', // 后端地址
  timeout: 5000
});
// ---------------------------
// PageLayout API
// ---------------------------
export interface PageLayoutData {
    ID?: string;
    NAME: string;
    PAGE_LIST_ID: string;
    DELETED?: string;
  }
  
  // 获取页面布局分页数据
  export function getPageLayoutList(params: { page: number; page_size: number }) {
    return service.get('/page_layouts', { params });
  }
  
  // 搜索页面布局
  export function searchPageLayout(params: { page: number; page_size: number; id?: string; name?: string }) {
    return service.get('/page_layout/search', { params });
  }
  
  // 创建页面布局
  export function createPageLayout(data: PageLayoutData) {
    return service.post('/page_layout', [data]);
  }
  
  // 更新页面布局
  export function updatePageLayout(id: string, data: PageLayoutData) {
    return service.put(`/page_layout/${id}`, [data]);
  }
  
  // 软删除页面布局
  export function deletePageLayout(id: string) {
    return service.delete(`/page_layout/${id}`);
  }
  
  // 恢复页面布局
  export function restorePageLayout(id: string) {
    return service.put(`/page_layout/restore/${id}`);
  }
  
  // 永久删除页面布局
  export function permanentDeletePageLayout(id: string) {
    return service.delete(`/page_layout/permanent_delete/${id}`);
  }