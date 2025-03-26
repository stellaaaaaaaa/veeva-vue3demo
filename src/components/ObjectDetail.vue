<template>
  <div>
    <el-table :data="fields" style="width: 100%" stripe>
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

    <div style="margin-top: 10px">
      <el-button type="primary" @click="openCreateDialog">新增字段</el-button>
    </div>

    <el-dialog :title="dialogTitle" v-model:visible="dialogVisible">
      <el-form :model="form" label-width="100px">
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
import { defineComponent, ref, onMounted, watch } from 'vue'
import { getObjectFieldList, createObjectField, updateObjectField, deleteObjectField, ObjectFieldData } from '@/api/objectField'

export default defineComponent({
  name: 'ObjectDetail',
  props: {
    objectId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const fields = ref<ObjectFieldData[]>([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('新增字段')
    const form = ref<ObjectFieldData>({
      NAME: '',
      LABEL: '',
      TYPE: '',
      OBJECT_ID: props.objectId
    })
    const editingId = ref<string | null>(null)

    const fetchFields = () => {
      // 根据传入的 objectId 过滤对应字段数据
      getObjectFieldList({ OBJECT_ID: props.objectId }).then(response => {
        // 如果后端接口不支持过滤，可在前端过滤
        fields.value = response.data.filter((item: ObjectFieldData) => item.OBJECT_ID === props.objectId)
      })
    }

    const openCreateDialog = () => {
      dialogTitle.value = '新增字段'
      editingId.value = null
      form.value = { NAME: '', LABEL: '', TYPE: '', OBJECT_ID: props.objectId }
      dialogVisible.value = true
    }

    const editField = (row: ObjectFieldData) => {
      dialogTitle.value = '编辑字段'
      editingId.value = row.ID || null
      form.value = { ...row }
      dialogVisible.value = true
    }

    const submitForm = () => {
      if (editingId.value) {
        updateObjectField(editingId.value, form.value).then(() => {
          dialogVisible.value = false
          fetchFields()
        })
      } else {
        createObjectField(form.value).then(() => {
          dialogVisible.value = false
          fetchFields()
        })
      }
    }

    const deleteField = (row: ObjectFieldData) => {
      deleteObjectField(row.ID as string).then(() => {
        fetchFields()
      })
    }

    // 每当 objectId 改变时，重新获取字段数据
    watch(
      () => props.objectId,
      () => {
        fetchFields()
      }
    )

    onMounted(() => {
      fetchFields()
    })

    return {
      fields,
      dialogVisible,
      dialogTitle,
      form,
      openCreateDialog,
      editField,
      submitForm,
      deleteField
    }
  }
})
</script>
