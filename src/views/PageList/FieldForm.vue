<template>
    <el-dialog v-model="visible" title="创建列表字段">
      <el-form :model="form" label-width="120px">
        <!-- 关联PageList -->
        <el-form-item label="所属列表" prop="PAGE_LIST_ID">
          <ForeignKeySelect
            v-model="form.PAGE_LIST_ID"
            api-url="/api/page_lists"
            @change="loadRelatedObject"
          />
        </el-form-item>
  
        <!-- 关联ObjectField（依赖Object） -->
        <el-form-item label="对象字段" prop="OBJECT_FIELD_ID">
          <ForeignKeySelect
            v-model="form.OBJECT_FIELD_ID"
            :api-url="objectFieldsUrl"
            :filter-params="{ object_id: currentObjectId }"
            :disabled="!form.PAGE_LIST_ID"
          />
        </el-form-item>
  
        <!-- 其他字段 -->
        <el-form-item label="是否隐藏">
          <el-switch v-model="form.HIDDEN" active-value="Y" inactive-value="N" />
        </el-form-item>
      </el-form>
  
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </template>
    </el-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import ForeignKeySelect from '@/components/ForeignKeySelect.vue'
  
  const props = defineProps<{
    pageListId?: string
  }>()
  
  const emit = defineEmits(['success'])
  
  const visible = ref(false)
  const currentObjectId = ref<string>('')
  const form = ref({
    PAGE_LIST_ID: props.pageListId || '',
    OBJECT_FIELD_ID: '',
    HIDDEN: 'N'
  })
  
  const objectFieldsUrl = computed(() => 
    currentObjectId.value ? `/api/object_fields?object_id=${currentObjectId.value}` : ''
  )
  
  const loadRelatedObject = async (pageListId: string) => {
    if (!pageListId) {
      currentObjectId.value = ''
      return
    }
    
    const response = await fetch(`/api/page_list/${pageListId}`)
    const data = await response.json()
    currentObjectId.value = data.OBJECT_ID
  }
  
  const submitForm = async () => {
    const response = await fetch('/api/page_list_field', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    
    if (response.ok) {
      emit('success')
      visible.value = false
    }
  }
  
  defineExpose({ visible })
  </script>