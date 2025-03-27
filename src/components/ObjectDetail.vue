<template>
  <div>

    <!-- 检索框和按钮 -->
    <div style="margin-bottom: 10px; display: flex; align-items: center;">
      <el-input v-model="searchQuery" placeholder="Please input field name to search"
        style="margin-right: 10px; width: 300px;" clearable></el-input>
      <el-button type="primary" @click="searchFields">Search</el-button>
      <el-button @click="resetSearch" style="margin-left: 10px;">Reset</el-button>
      <div style="margin-left: auto">
        <el-button type="primary" @click="openCreateDialog">New Field</el-button>
      </div>
    </div>
    <!-- 新增字段按钮 -->


    <!-- 表格 -->
    <el-table :data="fields" style="width: 100%" stripe v-loading="loading">
      <el-table-column prop="ID" label="Field ID"></el-table-column>
      <el-table-column prop="OBJECT_ID" label="Object ID"></el-table-column>
      <el-table-column prop="NAME" label="Field Name"></el-table-column>
      <el-table-column prop="LABEL" label="Label"></el-table-column>
      <el-table-column prop="TYPE" label="Type"></el-table-column>
      <el-table-column label="Options">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="editField(scope.row)">Edit</el-button>
          <el-button size="mini" type="danger" @click="deleteField(scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div style="margin-top: 10px; text-align: right;">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
        :size="size" :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper"
        :total="total" @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>



    <!-- 新增/编辑字段弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="Field ID" v-if="editingId">
          <el-input v-model="form.ID" disabled></el-input>
        </el-form-item>
        <el-form-item label="Object ID">
          <el-input v-model="form.OBJECT_ID" disabled></el-input>
        </el-form-item>
        <el-form-item label="Field Name" prop="NAME">
          <el-input v-model="form.NAME"></el-input>
        </el-form-item>
        <el-form-item label="Label">
          <el-input v-model="form.LABEL"></el-input>
        </el-form-item>
        <el-form-item label="Type">
          <el-input v-model="form.TYPE"></el-input>
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="validateAndSubmitForm">Submit</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, type Ref } from 'vue'
import type { FormInstance } from 'element-plus'
import {
  getObjectFieldListByObjid,
  createObjectField,
  updateObjectField,
  deleteObjectField,
  type ObjectFieldData,
} from '@/api/objectField'
import type { ComponentSize } from 'element-plus'
import { ElMessageBox, ElMessage } from 'element-plus'

export default defineComponent({
  name: 'ObjectDetail',
  props: {
    objectId: {
      type: String,
      required: true,
    },
  },
  setup(props) {

    const fields = ref<ObjectFieldData[]>([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(20)
    const background = ref(false)
    const disabled = ref(false)
    const size = ref<ComponentSize>('default')
    const dialogVisible = ref(false)
    const dialogTitle = ref('New Field')
    const form = ref<ObjectFieldData>({
      NAME: '',
      LABEL: '',
      TYPE: '',
      OBJECT_ID: props.objectId,
    })
    const editingId = ref<string | null>(null)
    const searchQuery = ref('') // Search condition
    const formRef = ref<FormInstance | null>(null)
    // const formRef = ref(null)
    const loading = ref(false)
    const rules = {
      NAME: [
        { required: true, message: 'Field Name cannot be empty.', trigger: 'blur' },
      ],
    }

    // Fetch field data
    const fetchFields = () => {
      fields.value = [] // Clear old data
      loading.value = true // Start loading
      const params = {
        obj_id: props.objectId,
        page: page.value,
        page_size: pageSize.value,
        search: searchQuery.value || undefined, // Add search condition
      }
      getObjectFieldListByObjid(params)
        .then((response) => {
          fields.value = response.data.items || []
          total.value = response.data.total || 0
        })
        .catch(() => {
          fields.value = [] // Clear data if loading fails
          ElMessage.error('Failed to load field data, please try again!')
        })
        .finally(() => {
          loading.value = false // End loading
        })
    }

    // Search fields
    const searchFields = () => {
      page.value = 1 // Reset to the first page
      fetchFields()
    }

    // Reset search
    const resetSearch = () => {
      searchQuery.value = ''
      fetchFields()
    }

    // Add field
    const openCreateDialog = () => {
      dialogTitle.value = 'New Field'
      editingId.value = null
      form.value = { NAME: '', LABEL: '', TYPE: '', OBJECT_ID: props.objectId }
      dialogVisible.value = true

      // 清除表单验证状态
      formRef.value?.clearValidate()
    }

    // Edit field
    const editField = (row: ObjectFieldData) => {
      dialogTitle.value = 'Edit Field'
      editingId.value = row.ID || null
      form.value = { ...row }
      dialogVisible.value = true

      // 清除表单验证状态
      formRef.value?.clearValidate()
    }

    // Validate and submit form
    const validateAndSubmitForm = () => {
      formRef.value?.validate((valid: boolean) => {
        if (valid) {
          submitForm()
        } else {
          ElMessage.error('Please fill in the required fields!')
        }
      })
    }

    // Submit form
    const submitForm = () => {
      if (editingId.value) {
        updateObjectField(editingId.value, form.value).then(() => {
          dialogVisible.value = false
          fetchFields()
          ElMessage.success('Field edited successfully!')
        })
      } else {
        createObjectField(form.value).then(() => {
          dialogVisible.value = false
          fetchFields()
          ElMessage.success('Field added successfully!')
        })
      }
    }

    // Delete field
    const deleteField = (row: ObjectFieldData) => {
      ElMessageBox.confirm(
        `Are you sure you want to delete the field "${row.NAME}"?`,
        'Delete Confirmation',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }
      )
        .then(() => {
          deleteObjectField(row.ID as string).then(() => {
            fetchFields()
            ElMessage.success('Field deleted successfully!')
          })
        })
        .catch(() => {
          ElMessage.info('Delete canceled')
        })
    }

    // Pagination events
    const handlePageChange = (newPage: number) => {
      page.value = newPage
      fetchFields()
    }

    const handleSizeChange = (newSize: number) => {
      pageSize.value = newSize
      fetchFields()
    }

    // Watch for objectId changes
    watch(
      () => props.objectId,
      () => {
        fetchFields()
      }
    )

    // Initial load
    onMounted(() => {
      fetchFields()
    })

    return {
      fields,
      total,
      page,
      pageSize,
      background,
      disabled,
      size,
      dialogVisible,
      dialogTitle,
      form,
      editingId,
      searchQuery,
      loading,
      formRef,
      rules,
      openCreateDialog,
      editField,
      validateAndSubmitForm,
      submitForm,
      deleteField,
      handlePageChange,
      handleSizeChange,
      searchFields,
      resetSearch,

    }
  },
})
</script>
