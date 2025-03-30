<template>
    <div class="sidebar">
        <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" @select="handleSelect" router>
            <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
                <i :class="item.icon"></i>
                <span>{{ item.label }}</span>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
    name: 'Sidebar',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const activeMenu = ref(route.path) // 根据当前路由设置默认选中项

        // 菜单项配置
        const menuItems = [
            { index: '/ObjectList', label: 'ACCOUNT OBJECT', icon: 'el-icon-menu', route: '/ObjectList' },
            { index: '/PageList', label: 'ACCOUNT PAGELIST', icon: 'el-icon-document', route: '/PageList' },
            { index: '/ImportDataPage', label: 'DATA MANAGEMENT', icon: 'el-icon-setting', route: '/ImportDataPage' },
        ]

        const handleSelect = (index: string) => {
            const selectedItem = menuItems.find((item) => item.index === index)
            if (selectedItem) {
                router.push(selectedItem.route)
                activeMenu.value = index // 更新选中项
            }
        }

        return {
            activeMenu,
            menuItems,
            handleSelect,
        }
    },
})
</script>

<style scoped>
.sidebar {
    width: 240px;
    height: 100vh;
    background-color: #ffffff;
    border-right: 1px solid #e0e0e0;
    position: fixed;
    top: 0;
    left: 0;
    overflow: auto;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.el-menu {
    height: 100%;
    border-right: none;
    padding-top: 20px;
}

.el-menu-item {
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #333;
    transition: all 0.3s;
}

.el-menu-item:hover {
    background-color: #f5f5f5;
}

.el-menu-item.is-active {
    background-color: #409eff;
    color: #fff;
    border-radius: 4px;
}

.el-menu-item i {
    margin-right: 10px;
    font-size: 18px;
    color: inherit;
}

.el-menu-item span {
    flex: 1;
    font-weight: 500;
}

@media (max-width: 768px) {
    .sidebar {
        width: 200px;
    }

    .el-menu-item {
        font-size: 14px;
    }

    .el-menu-item i {
        font-size: 16px;
    }
}
</style>