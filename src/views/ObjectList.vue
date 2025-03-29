<template>
  <div>
    <!-- Header 区域 -->
    <div class="header">
      <h1>{{ pageTitle }}</h1>
    </div>

    <el-card>
      <div style="margin-bottom: 10px; display: flex; align-items: center;">
        <el-input v-model="searchQuery" placeholder="PLEASE INPUT OBJECT NAME TO SEARCH"
          style="margin-right: 10px; width: 300px;" clearable></el-input>
        <el-button type="primary" @click="searchObjects">SEARCH</el-button>
        <el-button @click="resetSearch" style="margin-left: 10px;">RESET</el-button>
        <el-button type="primary" @click="openCreateDialog" style="margin-left: auto;">NEW OBJECT</el-button>
      </div>
      <el-table :data="objectList" style="width: 100%" stripe v-loading="loading">
        <!-- 新增 ID 列 -->
        <el-table-column prop="ID" label="ID"></el-table-column>
        <el-table-column prop="NAME" label="NAME"></el-table-column>
        <el-table-column prop="LABEL" label="LABEL"></el-table-column>
        <el-table-column prop="TABLE_NAME" label="TABLE NAME"></el-table-column>
        <el-table-column label="OPTIONS">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="editObject(scope.row)">EDIT</el-button>
            <el-button size="mini" type="danger" @click="deleteObject(scope.row)">DELETE</el-button>
            <el-button size="mini" @click="openDetailDialog(scope.row)">DETAILS</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div style="margin-top: 10px; text-align: right;">
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :size="size" :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper"
          :total="total" @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </el-card>

    <!-- 新增/编辑对象弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="NAME" prop="NAME">
          <el-input v-model="form.NAME"></el-input>
        </el-form-item>
        <el-form-item label="LABEL">
          <el-input v-model="form.LABEL"></el-input>
        </el-form-item>
        <el-form-item label="TABLE NAME">
          <el-input v-model="form.TABLE_NAME"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">CANCEL</el-button>
        <el-button type="primary" @click="validateAndSubmitForm">SUBMIT</el-button>
      </template>
    </el-dialog>

    <!-- 对象详情抽屉：嵌入 ObjectDetail 组件 -->
    <!-- <el-drawer :title="detailDrawerTitle" v-model="detailDrawerVisible" size="50%" direction="rtl" :with-header="true">
      <object-detail :objectId="currentObjectId || ''"></object-detail>
    </el-drawer> -->
    <el-drawer v-model="detailDrawerVisible" size="60%" direction="rtl" :with-header="true">
      <template #title>
        <div class="header">
          <h1>{{ detailDrawerTitle }}</h1>
        </div>
      </template>
      <object-detail :objectId="currentObjectId || ''"></object-detail>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, onMounted } from 'vue'
import { getObjectListBysearch, getObjectList, createObject, updateObject, deleteObject } from '@/api/object'
import ObjectDetail from '@/components/ObjectDetail.vue'
import type { ObjectData } from '@/api/object'
import type { ComponentSize } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance | null>(null)
const rules = {
  NAME: [
    {
      required: true,
      message: 'Name cannot be empty.',
      trigger: 'blur'
    },
    {
      validator: (rule: any, value: string, callback: (error?: Error) => void) => {
        if (!value || value.trim() === '') {
          callback(new Error('Name cannot contain only spaces.'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  LABEL: [
    {
      validator: (rule: any, value: string, callback: (error?: Error) => void) => {
        if (!value || value.trim() === '') {
          callback(new Error('Label cannot contain only spaces.'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  TABLE_NAME: [
    {
      validator: (rule: any, value: string, callback: (error?: Error) => void) => {
        if (!value || value.trim() === '') {
          callback(new Error('Table name cannot contain only spaces.'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

export default defineComponent({
  name: 'ObjectList',
  components: { ObjectDetail },
  setup() {
    const pageTitle = ref('Object Management Page') // 页面标题
    const detailDrawerTitle = ref('对象详情') // 默认标题
    const objectList = ref<ObjectData[]>([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(20)
    const background = ref(false)
    const disabled = ref(false)
    const size = ref<ComponentSize>('default')
    const dialogVisible = ref(false)
    const dialogTitle = ref('新增对象')
    const form = ref<ObjectData>({
      NAME: '',
      LABEL: '',
      TABLE_NAME: ''
    })
    const editingId = ref<string | null>(null)
    const searchQuery = ref('') // 检索条件
    const loading = ref(false) // 加载状态

    // 控制详情抽屉及当前对象ID
    const detailDrawerVisible = ref(false) // 控制抽屉显示状态
    const currentObjectId = ref<string | null>(null) // 当前对象 ID

    // 分页查询接口调用
    const fetchObjects = () => {
      loading.value = true // 开始加载
      const params: any = {
        page: page.value,
        page_size: pageSize.value,
      }
      if (searchQuery.value) {
        params.name = searchQuery.value // 添加检索条件
        getObjectListBysearch(params)
          .then(response => {
            objectList.value = response.data.items || []
            total.value = response.data.total || 0
            ElMessage.success('Search success！') // 检索成功提示
          })
          .catch(() => {
            ElMessage.error('Search failed, please try again!') // 检索失败提示
          })
          .finally(() => {
            loading.value = false // 结束加载
          })
      } else {
        getObjectList(params)
          .then(response => {
            objectList.value = response.data.items || []
            total.value = response.data.total || 0
            ElMessage.success('All data loaded successfully！') // 加载成功提示
          })
          .catch(() => {
            ElMessage.error('Search failed, please try again!') // 加载失败提示
          })
          .finally(() => {
            loading.value = false // 结束加载
          })
      }
    }

    const searchObjects = () => {
      page.value = 1 // 重置到第一页
      fetchObjects()
    }

    const resetSearch = () => {
      searchQuery.value = ''
      fetchObjects()
    }

    const openCreateDialog = () => {
      dialogTitle.value = '新增对象'
      editingId.value = null
      form.value = { NAME: '', LABEL: '', TABLE_NAME: '' }
      dialogVisible.value = true

      // 清除表单验证状态
      formRef.value?.clearValidate()
    }

    const editObject = (row: ObjectData) => {
      dialogTitle.value = '编辑对象'
      editingId.value = row.ID || null
      form.value = { ...row }
      dialogVisible.value = true

      // 清除表单验证状态
      formRef.value?.clearValidate()
    }

    const submitForm = () => {
      // 去除表单字段中的多余空格
      form.value.NAME = form.value.NAME.trim()
      form.value.LABEL = form.value.LABEL.trim()
      form.value.TABLE_NAME = form.value.TABLE_NAME.trim()

      if (editingId.value) {
        updateObject(editingId.value, form.value).then(() => {
          dialogVisible.value = false
          fetchObjects()
          ElMessage.success('Object edited successfully!') // 编辑成功提示
        })
      } else {
        createObject(form.value).then(() => {
          dialogVisible.value = false
          fetchObjects()
          ElMessage.success('Object added successfully!') // 添加成功提示
        })
      }
    }

    const validateAndSubmitForm = () => {
      formRef.value?.validate((valid: boolean) => {
        if (valid) {
          submitForm()
        } else {
          ElMessage.error('Please fill in the required fields!')
        }
      })
    }

    const deleteObjectHandler = (row: ObjectData) => {
      ElMessageBox.confirm(
        `Confirm delete the object : "${row.NAME}"?`,
        'Confirm deletion',
        {
          confirmButtonText: 'CONFIRM',
          cancelButtonText: 'CANCEL',
          type: 'warning',
        }
      )
        .then(() => {
          deleteObject(row.ID as string).then(() => {
            fetchObjects()
            ElMessage.success('Object delete successfully!') // 删除成功提示
          })
        })
        .catch(() => {
          ElMessage.info('Cancle delete') // 取消删除提示
        })
    }

    const openDetailDialog = (row: ObjectData) => {
      currentObjectId.value = row.ID as string // 设置当前对象 ID
      detailDrawerVisible.value = true // 打开抽屉
      detailDrawerTitle.value = 'Object Fields Management Page---OBJECT : ' + row.NAME
      console.log('currentObjectId', currentObjectId.value)
      console.log('detailDrawerVisible', detailDrawerVisible.value)
      console.log('detailDrawerTitle', detailDrawerTitle.value)
    }

    const handlePageChange = (newPage: number) => {
      page.value = newPage
      fetchObjects()
    }

    const handleSizeChange = (newSize: number) => {
      pageSize.value = newSize
      fetchObjects()
    }

    onMounted(() => {
      fetchObjects()
    })

    return {
      objectList,
      total,
      page,
      pageSize,
      dialogVisible,
      dialogTitle,
      form,
      openCreateDialog,
      editObject,
      submitForm,
      searchQuery,
      searchObjects,
      resetSearch,
      validateAndSubmitForm,
      deleteObject: deleteObjectHandler,
      detailDrawerVisible,
      openDetailDialog,
      currentObjectId,
      handlePageChange,
      background,
      size,
      disabled,
      handleSizeChange,
      formRef,
      rules,
      loading,
      detailDrawerTitle,
      pageTitle
    }
  }
})
</script>
<style>
.header {
  /* margin-bottom: 20px; */
  padding: 10px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #dcdcdc;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: black;
}
</style>