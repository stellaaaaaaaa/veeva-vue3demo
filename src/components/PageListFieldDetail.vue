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

    <!-- 表格 -->
    <el-table :data="fields" style="width: 100%" stripe v-loading="loading">
      <el-table-column prop="ID" label="Field ID"></el-table-column>
      <el-table-column prop="PAGE_LIST_ID" label="Page List ID"></el-table-column>
      <el-table-column prop="NAME" label="Field Name"></el-table-column>
      <el-table-column prop="TYPE" label="Type"></el-table-column>
      <el-table-column prop="HIDDEN" label="Hidden" :formatter="hiddenFormatter"></el-table-column>
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
      <el-form :model="form" :rules="rules" ref="formRef" label-width="150px">
        <el-form-item label="Field ID" v-if="editingId">
          <el-input v-model="form.ID" disabled></el-input>
        </el-form-item>
        <el-form-item label="Page List ID">
          <el-input v-model="form.PAGE_LIST_ID" disabled></el-input>
        </el-form-item>
        <el-form-item label="Object Field ID" prop="OBJECT_FIELD_ID">
          <el-select v-model="form.OBJECT_FIELD_ID" placeholder="Select Object Field Id" @change="onObjectFieldChange">
            <el-option v-for="field in objectFields" :key="field.ID" :label="field.ID" :value="field.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Field Name">
          <el-input v-model="form.NAME" disabled></el-input>
        </el-form-item>
        <el-form-item label="Type">
          <el-input v-model="form.TYPE" disabled></el-input>
        </el-form-item>
        <el-form-item label="Hidden" prop="HIDDEN">
          <el-select v-model="form.HIDDEN" placeholder="Select Hidden">
            <el-option label="Yes" value="1"></el-option>
            <el-option label="No" value="0"></el-option>
          </el-select>
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
import { defineComponent, ref, watch, onMounted } from 'vue'
import {
  getPageListFieldList,
  searchPageListField,
  createPageListField,
  updatePageListField,
  deletePageListField,
} from '@/api/PageListField'
import { getObjectFieldList, getAllObjectFieldList } from '@/api/objectField'
import type { PageListFieldData } from '@/api/PageListField'
import type { ObjectFieldData } from '@/api/objectField'
import type { ComponentSize, FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

export default defineComponent({
  name: 'PageListFieldDetail',
  props: {
    pageListId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const fields = ref<PageListFieldData[]>([])
    const objectFields = ref<ObjectFieldData[]>([]) // 用于存储所有 ObjectField 数据
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(20)
    const background = ref(false)
    const disabled = ref(false)
    const size = ref<ComponentSize>('default')
    const dialogVisible = ref(false)
    const dialogTitle = ref('New Field')
    const form = ref<PageListFieldData>({
      PAGE_LIST_ID: props.pageListId,
      OBJECT_FIELD_ID: '',
      NAME: '',
      TYPE: '',
      HIDDEN: '0',
    })
    const editingId = ref<string | null>(null)
    const searchQuery = ref('')
    const loading = ref(false)
    const formRef = ref<FormInstance | null>(null)
    const hiddenFormatter = (row: PageListFieldData) => {
      return row.HIDDEN === '1' ? '是' : '否'
    }

    const rules = {
      OBJECT_FIELD_ID: [
        { required: true, message: 'Object Field is required.', trigger: 'change' },
      ],
      HIDDEN: [
        { required: true, message: 'Hidden is required.', trigger: 'change' },
      ],
    }

    // 获取字段数据
    const fetchFields = () => {
      loading.value = true
      const params: any = {
        pagelist_id: props.pageListId,
        page: page.value,
        page_size: pageSize.value,
      }
      if (searchQuery.value) {
        console.log('searchQuery.value', searchQuery.value)
        params.name = searchQuery.value
        searchPageListField(params)
          .then((response) => {
            fields.value = response.data.items || []
            total.value = response.data.total || 0
          })
          .catch(() => {
            ElMessage.error('Failed to search fields.')
          })
          .finally(() => {
            loading.value = false
          })
      } else {
        searchPageListField(params)
          .then((response) => {
            fields.value = response.data.items || []
            total.value = response.data.total || 0
          })
          .catch(() => {
            ElMessage.error('Failed to load fields.')
          })
          .finally(() => {
            loading.value = false
          })
      }
    }

    // 获取所有 ObjectField 数据
    const fetchAllObjectFields = () => {
      getAllObjectFieldList()
        .then((response) => {
          objectFields.value = response.data.items || []
        })
        .catch(() => {
          ElMessage.error('Failed to load object fields.')
        })
    }

    // 当选择 ObjectField 时自动填充 NAME 和 TYPE
    const onObjectFieldChange = (objectFieldId: string) => {
      const selectedField = objectFields.value.find((field) => field.ID === objectFieldId)
      if (selectedField) {
        form.value.NAME = selectedField.NAME
        form.value.TYPE = selectedField.TYPE
      }
    }

    // 搜索字段
    const searchFields = () => {
      page.value = 1

      fetchFields()
    }

    // 重置搜索
    const resetSearch = () => {
      searchQuery.value = ''
      fetchFields()
    }

    // 打开新增字段弹窗
    const openCreateDialog = () => {
      dialogTitle.value = 'New Field'
      editingId.value = null
      form.value = {
        PAGE_LIST_ID: props.pageListId,
        OBJECT_FIELD_ID: '',
        NAME: '',
        TYPE: '',
        HIDDEN: '0',
      }
      dialogVisible.value = true
      formRef.value?.resetFields() // 重置表单字段
      formRef.value?.clearValidate() // 清除验证状态
    }

    // 打开编辑字段弹窗
    const editField = (row: PageListFieldData) => {
      dialogTitle.value = 'Edit Field'
      editingId.value = row.ID || null
      form.value = { ...row }
      dialogVisible.value = true
      formRef.value?.clearValidate()
    }

    // 提交表单
    const submitForm = () => {
      if (editingId.value) {
        updatePageListField(editingId.value, form.value).then(() => {
          dialogVisible.value = false
          fetchFields()
          ElMessage.success('Field updated successfully.')
        })
      } else {
        createPageListField(form.value).then(() => {
          dialogVisible.value = false
          fetchFields()
          ElMessage.success('Field created successfully.')
        })
      }
    }

    // 验证并提交表单
    const validateAndSubmitForm = () => {
      formRef.value?.validate((valid: boolean) => {
        if (valid) {
          submitForm()
        } else {
          ElMessage.error('Please fill in the required fields.')
        }
      })
    }

    // 删除字段
    const deleteField = (row: PageListFieldData) => {
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
          deletePageListField(row.ID as string).then(() => {
            fetchFields()
            ElMessage.success('Field deleted successfully.')
          })
        })
        .catch(() => {
          ElMessage.info('Delete canceled.')
        })
    }

    // 分页事件
    const handlePageChange = (newPage: number) => {
      page.value = newPage
      fetchFields()
    }

    const handleSizeChange = (newSize: number) => {
      pageSize.value = newSize
      fetchFields()
    }

    // 初始化加载
    onMounted(() => {
      fetchFields()
      fetchAllObjectFields() // 加载所有 ObjectField 数据
    })

    return {
      hiddenFormatter,
      fields,
      objectFields,
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
      fetchFields,
      fetchAllObjectFields,
      onObjectFieldChange,
      openCreateDialog,
      editField,
      validateAndSubmitForm,
      submitForm,
      deleteField,
      searchFields,
      resetSearch,
      handlePageChange,
      handleSizeChange,
    }
  },
})
</script>