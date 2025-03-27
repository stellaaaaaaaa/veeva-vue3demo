<template>
  <div>
    <el-card>
      <div style="margin-bottom: 10px; display: flex; align-items: center;">
        <el-input
          v-model="searchQuery"
          placeholder="PLEASE INPUT OBJECT_NAME TO SEARCH"
          style="margin-right: 10px; width: 300px;"
          clearable
        ></el-input>
        <el-button type="primary" @click="searchObjects">SEARCH</el-button>
        <el-button @click="resetSearch" style="margin-left: 10px;">RESET</el-button>
        <el-button type="primary" @click="openCreateDialog" style="margin-left: auto;">NEW OBJECT</el-button>
      </div>
      <el-table :data="objectList" style="width: 100%" stripe v-loading="loading">
        <!-- 新增 ID 列 -->
        <el-table-column prop="ID" label="ID"></el-table-column>
        <el-table-column prop="NAME" label="NAME"></el-table-column>
        <el-table-column prop="LABEL" label="LABEL"></el-table-column>
        <el-table-column prop="TABLE_NAME" label="TABLE_NAME"></el-table-column>
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
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :size="size"
          :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handlePageChange" />


      </div>
    </el-card>

    <!-- 新增/编辑对象弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="NAME" prop="NAME">
          <el-input v-model="form.NAME"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.LABEL"></el-input>
        </el-form-item>
        <el-form-item label="数据库表名">
          <el-input v-model="form.TABLE_NAME"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="validateAndSubmitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 对象详情抽屉：嵌入 ObjectDetail 组件 -->
    <el-drawer
  :title="detailDrawerTitle"
  v-model="detailDrawerVisible"
  size="50%"
  direction="rtl"
  :with-header="true"
>
  <object-detail :objectId="currentObjectId || ''"></object-detail>
</el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { getObjectListBysearch, getObjectList, createObject, updateObject, deleteObject } from '@/api/object'
import ObjectDetail from '@/components/ObjectDetail.vue'
import type { ObjectData } from '@/api/object'
import type { ComponentSize } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance | null>(null)
const rules = {
  NAME: [
    { required: true, message: 'NAME 不能为空', trigger: 'blur' }
  ]
}

export default defineComponent({
  name: 'ObjectList',
  components: { ObjectDetail },
  setup() {
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
            ElMessage.success('检索成功！') // 检索成功提示
          })
          .catch(() => {
            ElMessage.error('检索失败，请重试！') // 检索失败提示
          })
          .finally(() => {
            loading.value = false // 结束加载
          })
      } else {
        getObjectList(params)
          .then(response => {
            objectList.value = response.data.items || []
            total.value = response.data.total || 0
            ElMessage.success('加载所有数据成功！') // 加载成功提示
          })
          .catch(() => {
            ElMessage.error('加载数据失败，请重试！') // 加载失败提示
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
      if (editingId.value) {
        updateObject(editingId.value, form.value).then(() => {
          dialogVisible.value = false
          fetchObjects()
          ElMessage.success('对象编辑成功！') // 编辑成功提示
        })
      } else {
        createObject(form.value).then(() => {
          dialogVisible.value = false
          fetchObjects()
          ElMessage.success('对象添加成功！') // 添加成功提示
        })
      }
    }

    const validateAndSubmitForm = () => {
      formRef.value?.validate((valid: boolean) => {
        if (valid) {
          submitForm()
        } else {
          ElMessage.error('请填写必填字段')
        }
      })
    }

    const deleteObjectHandler = (row: ObjectData) => {
      ElMessageBox.confirm(
        `确定要删除对象 "${row.NAME}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          deleteObject(row.ID as string).then(() => {
            fetchObjects()
            ElMessage.success('对象删除成功！') // 删除成功提示
          })
        })
        .catch(() => {
          ElMessage.info('已取消删除') // 取消删除提示
        })
    }

    const openDetailDialog = (row: ObjectData) => {
  currentObjectId.value = row.ID as string // 设置当前对象 ID
  detailDrawerVisible.value = true // 打开抽屉
  detailDrawerTitle.value = 'OBJECT_FIELDS: '+ row.NAME
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
      detailDrawerTitle
    }
  }
})
</script>
