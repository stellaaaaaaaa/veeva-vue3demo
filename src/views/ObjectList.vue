<template>
  <div>
    <el-card>
      <div style="margin-bottom: 10px;">
        <el-button type="primary" @click="openCreateDialog">新增对象</el-button>
      </div>
      <el-table :data="objectList" style="width: 100%" stripe>
        <el-table-column prop="NAME" label="NAME"></el-table-column>
        <el-table-column prop="LABEL" label="描述"></el-table-column>
        <el-table-column prop="TABLE_NAME" label="数据库表名"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="editObject(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteObject(scope.row)">删除</el-button>
            <el-button size="mini" @click="openDetailDialog(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div style="margin-top: 10px; text-align: right;">
        <!-- <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="handlePageChange">
        </el-pagination> -->
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[1, 2, 100]" :size="size"
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

    <!-- 对象详情弹窗：嵌入 ObjectDetail 组件 -->
    <el-dialog title="对象详情" v-model="detailDialogVisible" width="60%">
      <object-detail :objectId="currentObjectId"></object-detail>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { getObjectList, createObject, updateObject, deleteObject } from '@/api/object'
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

    // 控制详情弹窗及当前对象ID
    const detailDialogVisible = ref(false)
    const currentObjectId = ref('')

    // 分页查询接口调用（注意后端接口返回的数据结构）
    const fetchObjects = () => {
      getObjectList({ page: page.value, page_size: pageSize.value }).then(response => {
        if (response.data.items) {
          objectList.value = response.data.items
          total.value = response.data.total
        } else {
          objectList.value = response.data
          total.value = response.data.length
        }
      })
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
      currentObjectId.value = row.ID as string
      detailDialogVisible.value = true
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
      validateAndSubmitForm,
      deleteObject: deleteObjectHandler,
      detailDialogVisible,
      openDetailDialog,
      currentObjectId,
      handlePageChange,
      background,
      size,
      disabled,
      handleSizeChange,
      formRef,
      rules
    }
  }
})
</script>
