<template>
    <div>
        <!-- 搜索框和按钮 -->
        <div style="margin-bottom: 10px; display: flex; align-items: center;">
            <el-input v-model="searchQuery" placeholder="Please input layout name to search"
                style="margin-right: 10px; width: 300px;" clearable></el-input>
            <el-button type="primary" @click="searchLayouts">Search</el-button>
            <el-button @click="resetSearch" style="margin-left: 10px;">Reset</el-button>
            <div style="margin-left: auto">
                <el-button type="primary" @click="openCreateDialog">New Layout</el-button>
            </div>
        </div>

        <!-- 表格 -->
        <el-table :data="layouts" style="width: 100%" stripe v-loading="loading">
            <el-table-column prop="ID" label="Layout ID"></el-table-column>
            <el-table-column prop="PAGE_LIST_ID" label="Page List ID"></el-table-column>
            <el-table-column prop="NAME" label="Layout Name"></el-table-column>
            <el-table-column label="Options">
                <template #default="scope">
                    <el-button size="mini" type="primary" @click="editLayout(scope.row)">Edit</el-button>
                    <el-button size="mini" type="danger" @click="deleteLayout(scope.row)">Delete</el-button>
                    <el-button size="mini" @click="openFieldDrawer(scope.row)">Detail</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div style="margin-top: 10px; text-align: right;">
            <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
                :size="size" :disabled="disabled" :background="background"
                layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                @current-change="handlePageChange" />
        </div>

        <!-- 新增/编辑布局弹窗 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="Layout ID" v-if="editingId">
                    <el-input v-model="form.ID" disabled></el-input>
                </el-form-item>
                <el-form-item label="Page List ID" prop="PAGE_LIST_ID">
                    <el-input v-model="form.PAGE_LIST_ID" disabled></el-input>
                </el-form-item>
                <el-form-item label="Layout Name" prop="NAME">
                    <el-input v-model="form.NAME"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="validateAndSubmitForm">Submit</el-button>
            </template>
        </el-dialog>

        <!-- 抽屉：关联 PageLayoutField -->
        <el-drawer v-model="fieldDrawerVisible" size="60%" direction="rtl" :with-header="true">
            <template #title>
                <div class="header">
                    <h1>{{ fieldDrawerTitle }}</h1>
                </div>
            </template>
            <page-layout-field :pageLayoutId="currentPageLayoutId || ''" />
        </el-drawer>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue'
import {
    getPageLayoutList,
    searchPageLayout,
    createPageLayout,
    updatePageLayout,
    deletePageLayout,
    type PageLayoutData,
} from '@/api/pageLayout'
import PageLayoutField from '@/components/PageLayoutField.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

export default defineComponent({
    name: 'PageLayout',
    components: { PageLayoutField },
    props: {
        pageListId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const layouts = ref<PageLayoutData[]>([])
        const total = ref(0)
        const page = ref(1)
        const pageSize = ref(20)
        const background = ref(false)
        const disabled = ref(false)
        const size = ref('default')
        const dialogVisible = ref(false)
        const dialogTitle = ref('New Layout')
        const form = ref<PageLayoutData>({
            PAGE_LIST_ID: props.pageListId,
            NAME: '',
        })
        const editingId = ref<string | null>(null)
        const searchQuery = ref('')
        const loading = ref(false)
        const formRef = ref<FormInstance | null>(null)

        // 抽屉相关
        const fieldDrawerVisible = ref(false)
        const fieldDrawerTitle = ref('Field Details')
        const currentPageLayoutId = ref<string | null>(null)

        const rules = {
            PAGE_LIST_ID: [
                { required: true, message: 'Page List ID cannot be empty.', trigger: 'blur' },
            ],
            NAME: [
                { required: true, message: 'Layout Name cannot be empty.', trigger: 'blur' },
            ],
        }

        // 获取布局数据
        const fetchLayouts = () => {
            loading.value = true
            const params: any = {
                pagelist_id: props.pageListId, // 根据 PageListId 过滤数据
                page: page.value,
                page_size: pageSize.value,
            }
            if (searchQuery.value) {
                params.name = searchQuery.value
            }
            searchPageLayout(params)
                .then((response) => {
                    layouts.value = response.data.items || []
                    total.value = response.data.total || 0
                })
                .catch(() => {
                    ElMessage.error('Failed to load layouts.')
                })
                .finally(() => {
                    loading.value = false
                })
        }

        // 打开抽屉：显示关联的字段
        const openFieldDrawer = (row: PageLayoutData) => {
            currentPageLayoutId.value = row.ID as string
            fieldDrawerTitle.value = `PageLayout Field Details - Layout: ${row.NAME}`
            fieldDrawerVisible.value = true
        }

        // 搜索布局
        const searchLayouts = () => {
            page.value = 1 // 重置到第一页
            fetchLayouts()
        }

        // 重置搜索
        const resetSearch = () => {
            searchQuery.value = ''
            fetchLayouts()
        }

        // 打开新增弹窗
        const openCreateDialog = () => {
            dialogTitle.value = 'New Layout'
            editingId.value = null
            form.value = { PAGE_LIST_ID: props.pageListId, NAME: '' }
            dialogVisible.value = true
            formRef.value?.clearValidate()
        }

        // 打开编辑弹窗
        const editLayout = (row: PageLayoutData) => {
            dialogTitle.value = 'Edit Layout'
            editingId.value = row.ID || null
            form.value = { ...row }
            dialogVisible.value = true
            formRef.value?.clearValidate()
        }

        // 提交表单
        const validateAndSubmitForm = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    submitForm()
                } else {
                    ElMessage.error('Please fill in the required fields.')
                }
            })
        }

        const submitForm = () => {
            if (editingId.value) {
                updatePageLayout(editingId.value, form.value).then(() => {
                    dialogVisible.value = false
                    fetchLayouts()
                    ElMessage.success('Layout updated successfully.')
                })
            } else {
                createPageLayout(form.value).then(() => {
                    dialogVisible.value = false
                    fetchLayouts()
                    ElMessage.success('Layout created successfully.')
                })
            }
        }

        // 删除布局
        const deleteLayout = (row: PageLayoutData) => {
            ElMessageBox.confirm(
                `Are you sure you want to delete the layout "${row.NAME}"?`,
                'Delete Confirmation',
                {
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                }
            )
                .then(() => {
                    deletePageLayout(row.ID as string).then(() => {
                        fetchLayouts()
                        ElMessage.success('Layout deleted successfully.')
                    })
                })
                .catch(() => {
                    ElMessage.info('Delete canceled.')
                })
        }

        // 分页事件
        const handlePageChange = (newPage: number) => {
            page.value = newPage
            fetchLayouts()
        }

        const handleSizeChange = (newSize: number) => {
            pageSize.value = newSize
            fetchLayouts()
        }

        // 监听 pageListId 的变化，重新加载数据
        watch(() => props.pageListId, fetchLayouts)

        // 初始化加载
        onMounted(() => {
            fetchLayouts()
        })

        return {
            layouts,
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
            fieldDrawerVisible,
            fieldDrawerTitle,
            openFieldDrawer,
            rules,
            openCreateDialog,
            editLayout,
            validateAndSubmitForm,
            submitForm,
            deleteLayout,
            handlePageChange,
            handleSizeChange,
            searchLayouts,
            resetSearch,
            currentPageLayoutId
        }
    },
})
</script>