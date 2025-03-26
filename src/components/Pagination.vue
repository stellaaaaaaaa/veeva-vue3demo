<template>
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next"
      :page-sizes="[10, 20, 50]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    currentPage: Number,
    pageSize: Number,
    total: Number
  })
  
  const emit = defineEmits(['update:currentPage', 'update:pageSize'])
  
  const handleSizeChange = (size: number) => {
    emit('update:pageSize', size)
  }
  
  const handleCurrentChange = (page: number) => {
    emit('update:currentPage', page)
  }
  </script>