<template>
  <div style="margin-left: 20px;">
    <!-- Header 区域 -->
    <div class="header">
      <h1>{{ pageTitle }}</h1>
    </div>

    <el-card>
      <div style="margin-bottom: 10px; display: flex; align-items: center;">
        <el-input v-model="searchQuery" placeholder="PLEASE INPUT PAGE NAME TO SEARCH"
          style="margin-right: 10px; width: 300px;" clearable></el-input>
        <el-button type="primary" @click="searchPages">SEARCH</el-button>
        <el-button @click="resetSearch" style="margin-left: 10px;">RESET</el-button>
        <el-button type="primary" @click="openCreateDialog" style="margin-left: auto;">NEW PAGE</el-button>
      </div>
      <el-table :data="pageList" style="width: 100%" stripe v-loading="loading">
        <!-- 新增 ID 列 -->
        <el-table-column prop="ID" label="ID"></el-table-column>
        <el-table-column prop="NAME" label="NAME"></el-table-column>
        <el-table-column prop="LABEL" label="LABEL"></el-table-column>
        <el-table-column label="OPTIONS">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="editPage(scope.row)">EDIT</el-button>
            <el-button size="mini" type="danger" @click="deletePage(scope.row)">DELETE</el-button>
            <el-button size="mini" @click="openDetailTabs(scope.row)">DETAILS</el-button>
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

    <!-- 动态 Tabs -->
    <el-dialog v-model="detailTabsVisible" width="80%" :destroy-on-close="true">
      <template #title>
        <div class="header">
          <h1>{{ detailTabsTitle }}</h1>
        </div>
      </template>
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="Page List Fields" name="fields">
          <page-list-field-detail :pageListId="currentPageListId || ''" />
        </el-tab-pane>
        <el-tab-pane label="Page Layout" name="layout">
          <page-layout :pageListId="currentPageListId || ''" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 新增/编辑页面弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="NAME" prop="NAME">
          <el-input v-model="form.NAME"></el-input>
        </el-form-item>
        <el-form-item label="LABEL" prop="LABEL">
          <el-input v-model="form.LABEL"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">CANCEL</el-button>
        <el-button type="primary" @click="validateAndSubmitForm">SUBMIT</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import {
  getPageList,
  searchPageList,
  createPageList,
  updatePageList,
  deletePageList,
} from '@/api/pageList'
import PageListFieldDetail from '@/components/PageListFieldDetail.vue'
import PageLayout from '@/components/PageLayout.vue'
import type { PageListData } from '@/api/pageList'
import type { ComponentSize, FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

export default defineComponent({
  name: 'PageList',
  components: { PageListFieldDetail, PageLayout },
  setup() {
    const pageTitle = ref('Page List Management Page') // 页面标题
    const pageList = ref<PageListData[]>([]) // 页面列表数据
    const total = ref(0) // 总条数
    const page = ref(1) // 当前页码
    const pageSize = ref(20) // 每页条数
    const background = ref(false) // 分页背景
    const disabled = ref(false) // 分页禁用
    const size = ref<ComponentSize>('default') // 分页组件大小
    const dialogVisible = ref(false) // 弹窗显示状态
    const dialogTitle = ref('新增页面') // 弹窗标题
    const form = ref<PageListData>({
      NAME: '',
      LABEL: '',
    }) // 表单数据
    const editingId = ref<string | null>(null) // 当前编辑的页面 ID
    const searchQuery = ref('') // 检索条件
    const loading = ref(false) // 加载状态
    const formRef = ref<FormInstance | null>(null) // 表单引用

    // 动态 Tabs 相关
    const detailTabsVisible = ref(false) // 控制 Tabs 弹窗显示状态
    const detailTabsTitle = ref('Page Details') // Tabs 弹窗标题
    const activeTab = ref('fields') // 当前激活的 Tab
    const currentPageListId = ref<string | null>(null) // 当前选中的 PageList ID

    // 打开详情 Tabs
    const openDetailTabs = (row: PageListData) => {
      currentPageListId.value = row.ID as string // 设置当前 PageList ID
      detailTabsTitle.value = `Page List Details - ${row.NAME}` // 设置 Tabs 标题
      detailTabsVisible.value = true // 打开 Tabs 弹窗
      activeTab.value = 'fields' // 默认激活第一个 Tab
    }

    // 表单验证规则
    const rules = {
      NAME: [
        { required: true, message: 'Name cannot be empty.', trigger: 'blur' },
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
    }

    // 获取页面列表数据
    const fetchPages = () => {
      loading.value = true
      const params: any = {
        page: page.value,
        page_size: pageSize.value,
      }
      if (searchQuery.value) {
        params.name = searchQuery.value
        searchPageList(params)
          .then((response) => {
            pageList.value = response.data.items || []
            total.value = response.data.total || 0
            ElMessage.success('Search success!')
          })
          .catch(() => {
            ElMessage.error('Search failed, please try again!')
          })
          .finally(() => {
            loading.value = false
          })
      } else {
        getPageList(params)
          .then((response) => {
            pageList.value = response.data.items || []
            total.value = response.data.total || 0
            ElMessage.success('All data loaded successfully!')
          })
          .catch(() => {
            ElMessage.error('Failed to load data, please try again!')
          })
          .finally(() => {
            loading.value = false
          })
      }
    }

    // 检索页面
    const searchPages = () => {
      page.value = 1
      fetchPages()
    }

    // 重置检索
    const resetSearch = () => {
      searchQuery.value = ''
      fetchPages()
    }

    // 打开新增页面弹窗
    const openCreateDialog = () => {
      dialogTitle.value = '新增页面'
      editingId.value = null
      form.value = { NAME: '', LABEL: '' }
      dialogVisible.value = true
      formRef.value?.clearValidate()
    }

    // 打开编辑页面弹窗
    const editPage = (row: PageListData) => {
      dialogTitle.value = '编辑页面'
      editingId.value = row.ID || null
      form.value = { ...row }
      dialogVisible.value = true
      formRef.value?.clearValidate()
    }

    // 提交表单
    const submitForm = () => {
      form.value.NAME = form.value.NAME.trim()
      form.value.LABEL = form.value.LABEL.trim()

      if (editingId.value) {
        updatePageList(editingId.value, form.value).then(() => {
          dialogVisible.value = false
          fetchPages()
          ElMessage.success('Page edited successfully!')
        })
      } else {
        createPageList(form.value).then(() => {
          dialogVisible.value = false
          fetchPages()
          ElMessage.success('Page added successfully!')
        })
      }
    }

    // 验证并提交表单
    const validateAndSubmitForm = () => {
      formRef.value?.validate((valid: boolean) => {
        if (valid) {
          submitForm()
        } else {
          ElMessage.error('Please fill in the required fields!')
        }
      })
    }

    // 删除页面
    const deletePage = (row: PageListData) => {
      ElMessageBox.confirm(
        `Confirm delete the page: "${row.NAME}"?`,
        'Confirm deletion',
        {
          confirmButtonText: 'CONFIRM',
          cancelButtonText: 'CANCEL',
          type: 'warning',
        }
      )
        .then(() => {
          deletePageList(row.ID as string).then(() => {
            fetchPages()
            ElMessage.success('Page deleted successfully!')
          })
        })
        .catch(() => {
          ElMessage.info('Cancel delete')
        })
    }

    // 分页事件
    const handlePageChange = (newPage: number) => {
      page.value = newPage
      fetchPages()
    }

    const handleSizeChange = (newSize: number) => {
      pageSize.value = newSize
      fetchPages()
    }

    // 初始化加载
    onMounted(() => {
      fetchPages()
    })

    return {
      pageList,
      total,
      page,
      pageSize,
      dialogVisible,
      dialogTitle,
      form,
      openCreateDialog,
      editPage,
      submitForm,
      searchQuery,
      searchPages,
      resetSearch,
      validateAndSubmitForm,
      deletePage,
      handlePageChange,
      background,
      size,
      disabled,
      handleSizeChange,
      formRef,
      rules,
      loading,
      pageTitle,
      detailTabsVisible,
      detailTabsTitle,
      activeTab,
      currentPageListId,
      openDetailTabs,
    }
  },
})
</script>

<style>
.header {
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