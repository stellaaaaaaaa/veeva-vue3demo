<template>
    <el-select
      v-model="selectedId"
      filterable
      remote
      :remote-method="searchOptions"
      :loading="loading"
      clearable
    >
      <el-option
        v-for="item in options"
        :key="item.ID"
        :label="item.LABEL || item.NAME"
        :value="item.ID"
      />
    </el-select>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { PropType } from 'vue'
  
  const props = defineProps({
    modelValue: String,
    apiUrl: {
      type: String,
      required: true
    },
    filterParams: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const selectedId = ref(props.modelValue)
  const options = ref<any[]>([])
  const loading = ref(false)
  
  watch(() => props.modelValue, (newVal) => {
    selectedId.value = newVal
  })
  
  const searchOptions = async (query = '') => {
    loading.value = true
    try {
      const params = { search: query, ...props.filterParams }
      const response = await fetch(`${props.apiUrl}?${new URLSearchParams(params)}`)
      options.value = await response.json()
    } finally {
      loading.value = false
    }
  }
  
  watch(selectedId, (value) => {
    emit('update:modelValue', value)
  })
  
  // 初始加载
  searchOptions()
  </script>