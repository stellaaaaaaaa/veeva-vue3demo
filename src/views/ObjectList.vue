<template>
  <div>
    <el-card>
      <div style="margin-bottom: 10px;">
        <el-button type="primary" @click="openCreateDialog">新增对象</el-button>
      </div>
      <el-table :data="objectList" style="width: 100%" stripe>
        <el-table-column prop="NAME" label="名称"></el-table-column>
        <el-table-column prop="LABEL" label="标签"></el-table-column>
        <el-table-column prop="TABLE_NAME" label="表名"></el-table-column>
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
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="handlePageChange">
        </el-pagination>
      </div>
    </el-card>

    <!-- 新增/编辑对象弹窗 -->
    <el-dialog :title="dialogTitle" v-model:visible="dialogVisible">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="form.NAME"></el-input>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.LABEL"></el-input>
        </el-form-item>
        <el-form-item label="表名">
          <el-input v-model="form.TABLE_NAME"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 对象详情弹窗：嵌入 ObjectDetail 组件 -->
    <el-dialog title="对象详情" v-model:visible="detailDialogVisible" width="60%">
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

export default defineComponent({
  name: 'ObjectList',
  components: { ObjectDetail },
  setup() {
    const objectList = ref<ObjectData[]>([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)
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
      getObjectList({ page: page.value, size: pageSize.value }).then(response => {
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
    }

    const editObject = (row: ObjectData) => {
      dialogTitle.value = '编辑对象'
      editingId.value = row.ID || null
      form.value = { ...row }
      dialogVisible.value = true
    }

    const submitForm = () => {
      if (editingId.value) {
        updateObject(editingId.value, form.value).then(() => {
          dialogVisible.value = false
          fetchObjects()
        })
      } else {
        createObject(form.value).then(() => {
          dialogVisible.value = false
          fetchObjects()
        })
      }
    }

    const deleteObjectHandler = (row: ObjectData) => {
      deleteObject(row.ID as string).then(() => {
        fetchObjects()
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
      deleteObject: deleteObjectHandler,
      detailDialogVisible,
      openDetailDialog,
      currentObjectId,
      handlePageChange
    }
  }
})
</script>
