<template>
    <el-card>
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input 
          v-model="searchText" 
          placeholder="搜索名称/标签" 
          clearable
          @change="handleSearch"
          style="width: 300px"
        />
        <el-button type="primary" @click="router.push('/objects/create')">新建对象</el-button>
      </div>
  
      <!-- 数据表格 -->
      <el-table 
        :data="store.list" 
        highlight-current-row
        @current-change="handleSelect"
      >
        <el-table-column prop="NAME" label="名称" sortable />
        <el-table-column prop="LABEL" label="标签" />
        <el-table-column prop="TABLE_NAME" label="表名" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link @click="router.push(`/objects/${row.ID}/edit`)">编辑</el-button>
            <el-button link type="danger" @click="deleteObject(row.ID)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 分页 -->
      <Pagination 
        :current-page="store.pagination.page"
        :page-size="store.pagination.pageSize"
        :total="store.pagination.total"
        @update:current-page="store.pagination.page = $event; loadData()"
      />
    </el-card>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { useObjectStore } from '@/stores/objectStore'
  import Pagination from '@/components/Pagination.vue'
  
  const router = useRouter()
  const store = useObjectStore()
  const searchText = ref('')
  
  // 加载数据
  const loadData = () => store.loadList()
  
  // 搜索处理
  const handleSearch = () => {
    store.searchText = searchText.value
    loadData()
  }
  
  // 删除Object
  const deleteObject = async (id: string) => {
    await ObjectAPI.softDelete(id)
    await loadData()
  }
  
  onMounted(loadData)
  </script>