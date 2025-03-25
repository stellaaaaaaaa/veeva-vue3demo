// src/types/models.ts

// 为避免与内置Object冲突，建议使用AppObject命名
export interface AppObject {
    ID: string
    NAME: string
    LABEL: string
    TABLE_NAME: string
    DELETED: '1' | '0'
  }
  
  export interface PaginationParams {
    page: number
    pageSize: number
    search?: string
  }
  
  // 对象字段接口
  export interface ObjectField {
    ID: string
    OBJECT_ID: string
    NAME: string
    LABEL: string
    TYPE: string
    DELETED: '1' | '0'
  }