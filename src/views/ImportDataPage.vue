<template>
    <div class="import-page">
        <!-- Header 区域 -->
        <div class="header">
            <h1>{{ pageTitle }}</h1>
        </div>

        <!-- 上传功能 -->
        <el-card class="card">
            <h2 class="section-title">Upload Data</h2>
            <div class="button-container">
                <el-button v-for="type in uploadTypes" :key="type.key" type="primary" size="large" icon="el-icon-upload"
                    @click="openUploadDialog(type.key)">
                    {{ type.label }}
                </el-button>
            </div>
        </el-card>

        <!-- 导出功能 -->
        <el-card class="card">
            <h2 class="section-title">Export Data</h2>
            <div class="button-container">
                <el-button type="success" icon="el-icon-download" @click="exportPageList">Export PageList</el-button>
                <el-button type="success" icon="el-icon-download" @click="exportObject">Export Object</el-button>
                <el-button type="success" icon="el-icon-download" @click="exportObjectField">Export
                    ObjectField</el-button>
                <el-button type="success" icon="el-icon-download" @click="exportPageListField">Export
                    PageListField</el-button>
                <el-button type="success" icon="el-icon-download" @click="exportPageLayout">Export
                    PageLayout</el-button>
                <el-button type="success" icon="el-icon-download" @click="exportPageLayoutField">Export
                    PageLayoutField</el-button>
            </div>
        </el-card>

        <!-- 上传文件的 Dialog -->
        <el-dialog :title="uploadDialogTitle" v-model="uploadDialogVisible" width="50%">
            <div class="dialog-content">
                <el-upload ref="uploadRef" class="upload-demo" :before-upload="handleBeforeUpload"
                    :on-change="handleFileChange" :file-list="fileList" :auto-upload="false" drag>
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">Drag your file here or <em>click to upload</em></div>
                    <div class="el-upload__tip">Only CSV files are allowed</div>
                </el-upload>
            </div>
            <template #footer>
                <el-button @click="closeUploadDialog">Cancel</el-button>
                <el-button type="primary" :disabled="!fileList.length" @click="confirmUpload">Upload</el-button>
            </template>
        </el-dialog>

        <!-- 错误信息的 Dialog -->
        <el-dialog title="Error Details" v-model="errorDialogVisible" width="50%">
            <div class="error-content">
                <pre>{{ errorMessage }}</pre>
            </div>
            <template #footer>
                <el-button @click="closeErrorDialog">Close</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadUserFile, UploadProps } from 'element-plus'

// 导入 API
import {
    importPageListCsv,
    importPageLayoutCsv,
    importPageListFieldCsv,
    importPageLayoutFieldCsv,
    importObjectCsv,
    importObjectFieldCsv,
    exportPageListCsv,
    exportObjectCsv,
    exportObjectFieldCsv,
    exportPageListFieldCsv,
    exportPageLayoutCsv,
    exportPageLayoutFieldCsv,
} from '@/api/dataImport'

export default defineComponent({
    name: 'ImportDataPage',
    setup() {
        const pageTitle = ref('Data Import Management') // 页面标题
        const uploadDialogVisible = ref(false) // 控制上传弹窗显示状态
        const uploadDialogTitle = ref('') // 上传弹窗标题
        const fileList = ref<UploadUserFile[]>([]) // 上传文件列表
        const currentUploadFunction = ref<Function | null>(null) // 当前上传的 API 方法

        const errorDialogVisible = ref(false) // 控制错误弹窗显示状态
        const errorMessage = ref('') // 错误信息

        // 上传类型配置
        const uploadTypes = [
            { key: 'Object', label: 'Upload Object' },
            { key: 'ObjectField', label: 'Upload ObjectField' },
            { key: 'PageList', label: 'Upload PageList' },
            { key: 'PageListField', label: 'Upload PageListField' },
            { key: 'PageLayout', label: 'Upload PageLayout' },
            { key: 'PageLayoutField', label: 'Upload PageLayoutField' },
        ]

        // 打开上传弹窗
        const openUploadDialog = (type: string) => {
            switch (type) {
                case 'PageList':
                    uploadDialogTitle.value = 'Upload PageList CSV'
                    currentUploadFunction.value = importPageListCsv
                    break
                case 'PageLayout':
                    uploadDialogTitle.value = 'Upload PageLayout CSV'
                    currentUploadFunction.value = importPageLayoutCsv
                    break
                case 'PageListField':
                    uploadDialogTitle.value = 'Upload PageListField CSV'
                    currentUploadFunction.value = importPageListFieldCsv
                    break
                case 'PageLayoutField':
                    uploadDialogTitle.value = 'Upload PageLayoutField CSV'
                    currentUploadFunction.value = importPageLayoutFieldCsv
                    break
                case 'Object':
                    uploadDialogTitle.value = 'Upload Object CSV'
                    currentUploadFunction.value = importObjectCsv
                    break
                case 'ObjectField':
                    uploadDialogTitle.value = 'Upload ObjectField CSV'
                    currentUploadFunction.value = importObjectFieldCsv
                    break
            }
            fileList.value = [] // 清空文件列表
            uploadDialogVisible.value = true // 打开弹窗
        }

        // 关闭上传弹窗
        const closeUploadDialog = () => {
            uploadDialogVisible.value = false
            fileList.value = [] // 清空文件列表
        }

        // 关闭错误弹窗
        const closeErrorDialog = () => {
            errorDialogVisible.value = false
            errorMessage.value = ''
        }

        // 上传前检查文件类型
        const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
            const isCsv = file.type === 'text/csv'
            if (!isCsv) {
                ElMessage.error('Only CSV files are allowed!')
            }
            return isCsv
        }

        // 文件改变时更新文件列表
        const handleFileChange = (file: UploadUserFile) => {
            fileList.value = [file] // 只允许上传一个文件
        }

        // 确认上传
        const confirmUpload = async () => {
            if (!currentUploadFunction.value) {
                ElMessage.error('No upload function specified!')
                return
            }

            const file = fileList.value[0]?.raw as File
            try {
                const result = await currentUploadFunction.value(file)
                ElMessage.success(result.message || 'Upload successful!')
                closeUploadDialog()
            } catch (error: any) {
                if (error.response?.data?.errors) {
                    const errors = error.response.data.errors
                    errorMessage.value = `Message: ${error.response.data.message}\n\nErrors:\n` +
                        errors.map((err: any) => `Row ${err.row}: ${err.error}`).join('\n')
                } else {
                    errorMessage.value = error.message || 'Upload failed!'
                }
                errorDialogVisible.value = true // 打开错误弹窗
            }
        }

        // 导出方法
        const exportPageList = async () => {
            try {
                await exportPageListCsv()
                ElMessage.success('PageList exported successfully!')
            } catch (error: any) {
                ElMessage.error(error.message || 'Export failed!')
            }
        }

        const exportObject = async () => {
            try {
                await exportObjectCsv()
                ElMessage.success('Object exported successfully!')
            } catch (error: any) {
                ElMessage.error(error.message || 'Export failed!')
            }
        }

        const exportObjectField = async () => {
            try {
                await exportObjectFieldCsv()
                ElMessage.success('ObjectField exported successfully!')
            } catch (error: any) {
                ElMessage.error(error.message || 'Export failed!')
            }
        }

        const exportPageListField = async () => {
            try {
                await exportPageListFieldCsv()
                ElMessage.success('PageListField exported successfully!')
            } catch (error: any) {
                ElMessage.error(error.message || 'Export failed!')
            }
        }

        const exportPageLayout = async () => {
            try {
                await exportPageLayoutCsv()
                ElMessage.success('PageLayout exported successfully!')
            } catch (error: any) {
                ElMessage.error(error.message || 'Export failed!')
            }
        }

        const exportPageLayoutField = async () => {
            try {
                await exportPageLayoutFieldCsv()
                ElMessage.success('PageLayoutField exported successfully!')
            } catch (error: any) {
                ElMessage.error(error.message || 'Export failed!')
            }
        }

        return {
            pageTitle,
            uploadDialogVisible,
            uploadDialogTitle,
            fileList,
            uploadTypes,
            errorDialogVisible,
            errorMessage,
            openUploadDialog,
            closeUploadDialog,
            closeErrorDialog,
            handleBeforeUpload,
            handleFileChange,
            confirmUpload,
            exportPageList,
            exportObject,
            exportObjectField,
            exportPageListField,
            exportPageLayout,
            exportPageLayoutField,
        }
    },
})
</script>

<style scoped>
.import-page {
    margin-left: 20px;
    /* padding: 20px; */
}

.header {
    padding: 10px 20px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #dcdcdc;
    margin-bottom: 20px;
}

.header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.card {
    padding: 20px;
    margin-bottom: 20px;
}

.section-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
}

.button-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
}

.el-button {
    flex: 1;
    min-width: 150px;
    text-align: center;
}

.dialog-content {
    text-align: center;
    padding: 20px;
}

.upload-demo {
    display: block;
    margin: 0 auto;
    width: 100%;
    max-width: 400px;
    border: 2px dashed #d9d9d9;
    padding: 20px;
    text-align: center;
    background-color: #fafafa;
    border-radius: 8px;
}

.el-upload__text {
    font-size: 16px;
    color: #606266;
}

.el-upload__tip {
    font-size: 12px;
    color: #909399;
}

.error-content {
    padding: 20px;
    color: red;
    font-size: 14px;
    word-break: break-word;
    white-space: pre-wrap;
}
</style>