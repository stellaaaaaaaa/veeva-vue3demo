<template>
    <div class="detail-container">
      <!-- 基本信息 -->
      <el-descriptions title="对象详情" :column="2" border>
        <el-descriptions-item label="名称">{{ store.current?.NAME }}</el-descriptions-item>
        <el-descriptions-item label="表名">{{ store.current?.TABLE_NAME }}</el-descriptions-item>
      </el-descriptions>
  
      <!-- 关联字段 -->
      <el-card class="mt-4">
        <template #header>
          <div class="flex justify-between">
            <span>关联字段</span>
            <el-button 
              type="primary" 
              @click="router.push(`/objects/${route.params.id}/fields/create`)"
            >
              新建字段
            </el-button>
          </div>
        </template>
  
        <ObjectFieldList :object-id="route.params.id" />
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router'
  import { useObjectStore } from '@/stores/objectStore'
  import ObjectFieldList from '@/views/ObjectField/ListView.vue'
  
  const route = useRoute()
  const router = useRouter()
  const store = useObjectStore()
  
  onMounted(async () => {
    await store.loadList()  // 确保加载当前Object数据
    store.setCurrent(store.list.find(o => o.ID === route.params.id) || null)
  })
  </script>