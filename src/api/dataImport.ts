import axios from 'axios'

/**
 * 创建 axios 实例，设置基础 URL 和超时时间
 */
const service = axios.create({
    baseURL: 'http://localhost:5000', // 后端地址
    timeout: 5000, // 请求超时时间
})

/**
 * 通用的 CSV 导入接口
 * @param url 导入接口的 URL
 * @param file 要上传的 CSV 文件
 * @returns Promise，包含导入结果
 */
export const importCsv = async (url: string, file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
        const response = await service.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error: any) {
        if (error.response) {
            // 后端返回的错误信息
            throw new Error(error.response.data.message || '导入失败')
        } else {
            // 网络错误或其他问题
            throw new Error('网络错误或导入失败')
        }
    }
}

// 各个 CSV 导入接口调用对应的后端接口地址
export const importPageListCsv = async (file: File) => {
    return await importCsv('/import_csv/pagelist', file)
}

export const importPageLayoutCsv = async (file: File) => {
    return await importCsv('/import_csv/page_layout', file)
}

export const importPageListFieldCsv = async (file: File) => {
    return await importCsv('/import_csv/page_list_field', file)
}

export const importPageLayoutFieldCsv = async (file: File) => {
    return await importCsv('/import_csv/page_layout_field', file)
}

export const importObjectCsv = async (file: File) => {
    return await importCsv('/import_csv/object', file)
}

export const importObjectFieldCsv = async (file: File) => {
    return await importCsv('/import_csv/object_field', file)
}

/**
 * 通用的 CSV 导出接口
 * @param url 导出接口的 URL
 * @param filename 导出的文件名
 */
export const exportCsv = async (url: string, filename: string): Promise<void> => {
    try {
        const response = await service.get(url, {
            responseType: 'blob', // 确保返回的是文件流
        })

        // 创建下载链接
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const urlObject = URL.createObjectURL(blob)
        link.href = urlObject
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(urlObject) // 释放 URL 对象
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data.message || '导出失败')
        } else {
            throw new Error('网络错误或导出失败')
        }
    }
}

// 各个 CSV 导出接口调用对应的后端接口地址
export const exportPageListCsv = async () => {
    return await exportCsv('/export_csv/pagelist', 'pagelist_export.csv')
}

export const exportObjectCsv = async () => {
    return await exportCsv('/export_csv/object', 'object_export.csv')
}

export const exportObjectFieldCsv = async () => {
    return await exportCsv('/export_csv/object_field', 'object_field_export.csv')
}

export const exportPageListFieldCsv = async () => {
    return await exportCsv('/export_csv/page_list_field', 'page_list_field_export.csv')
}

export const exportPageLayoutCsv = async () => {
    return await exportCsv('/export_csv/page_layout', 'page_layout_export.csv')
}

export const exportPageLayoutFieldCsv = async () => {
    return await exportCsv('/export_csv/page_layout_field', 'page_layout_field_export.csv')
}