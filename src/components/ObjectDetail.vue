<template>
  <div>
    <!-- 检索框和按钮 -->
    <div style="margin-bottom: 10px; display: flex; align-items: center;">
      <el-input
        v-model="searchQuery"
        placeholder="请输入字段名称或标签进行检索"
        style="margin-right: 10px; width: 300px;"
        clearable
      ></el-input>
      <el-button type="primary" @click="searchFields">检索</el-button>
      <el-button @click="resetSearch" style="margin-left: 10px;">重置</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="fields" style="width: 100%" stripe v-loading="loading">
      <el-table-column prop="ID" label="字段 ID"></el-table-column>
      <el-table-column prop="NAME" label="字段名称"></el-table-column>
      <el-table-column prop="LABEL" label="标签"></el-table-column>
      <el-table-column prop="TYPE" label="类型"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="editField(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteField(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div style="margin-top: 10px; text-align: right;">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :size="size"
        :disabled="disabled"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新增字段按钮 -->
    <div style="margin-top: 10px">
      <el-button type="primary" @click="openCreateDialog">新增字段</el-button>
    </div>

    <!-- 新增/编辑字段弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible">
      <el-form :model="form" label-width="100px">
        <el-form-item label="字段 ID" v-if="editingId">
          <el-input v-model="form.ID" disabled></el-input>
        </el-form-item>
        <el-form-item label="字段名称">
          <el-input v-model="form.NAME"></el-input>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.LABEL"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="form.TYPE"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue'
import {
  getObjectFieldListByObjid,
  createObjectField,
  updateObjectField,
  deleteObjectField,
  type ObjectFieldData,
} from '@/api/objectField'
import type { ComponentSize } from 'element-plus'
import { ElMessage } from 'element-plus'

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
    const dialogTitle = ref('新增字段')
    const form = ref<ObjectFieldData>({
      NAME: '',
      LABEL: '',
      TYPE: '',
      OBJECT_ID: props.objectId,
    })
    const editingId = ref<string | null>(null)
    const searchQuery = ref('') // 检索条件
    const loading = ref(false) // 加载状态

    // 获取字段数据
    const fetchFields = () => {
      fields.value = [] // 清空旧数据
      loading.value = true // 开始加载
      const params = {
        obj_id: props.objectId,
        page: page.value,
        page_size: pageSize.value,
        search: searchQuery.value || undefined, // 添加检索条件
      }
      getObjectFieldListByObjid(params)
        .then((response) => {
          fields.value = response.data.items || []
          total.value = response.data.total || 0
        })
        .catch(() => {
          fields.value = [] // 如果加载失败，也清空数据
          ElMessage.error('加载字段数据失败，请重试！')
        })
        .finally(() => {
          loading.value = false // 结束加载
        })
    }

    // 检索字段
    const searchFields = () => {
      page.value = 1 // 重置到第一页
      fetchFields()
    }

    // 重置检索
    const resetSearch = () => {
      searchQuery.value = ''
      fetchFields()
    }

    // 新增字段
    const openCreateDialog = () => {
      dialogTitle.value = '新增字段'
      editingId.value = null
      form.value = { NAME: '', LABEL: '', TYPE: '', OBJECT_ID: props.objectId }
      dialogVisible.value = true
    }

    // 编辑字段
    const editField = (row: ObjectFieldData) => {
      dialogTitle.value = '编辑字段'
      editingId.value = row.ID || null
      form.value = { ...row }
      dialogVisible.value = true
    }

    // 提交表单
    const submitForm = () => {
      if (editingId.value) {
        updateObjectField(editingId.value, form.value).then(() => {
          dialogVisible.value = false
          fetchFields()
          ElMessage.success('字段编辑成功！')
        })
      } else {
        createObjectField(form.value).then(() => {
          dialogVisible.value = false
          fetchFields()
          ElMessage.success('字段添加成功！')
        })
      }
    }

    // 删除字段
    const deleteField = (row: ObjectFieldData) => {
      deleteObjectField(row.ID as string).then(() => {
        fetchFields()
        ElMessage.success('字段删除成功！')
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

    // 监听 objectId 变化
    watch(
      () => props.objectId,
      () => {
        fetchFields()
      }
    )

    // 初始化加载
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
      openCreateDialog,
      editField,
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
