<template>
    <div class="sidebar">
        <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" @select="handleSelect">
            <el-menu-item index="1">
                <i class="el-icon-menu"></i>
                <span>Home</span>
            </el-menu-item>
            <el-menu-item index="2">
                <i class="el-icon-document"></i>
                <span>Objects</span>
            </el-menu-item>
            <el-menu-item index="3">
                <i class="el-icon-setting"></i>
                <span>About</span>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
    name: 'Sidebar',
    setup() {
        const router = useRouter()
        const activeMenu = ref('1')

        const handleSelect = (index: string) => {
            if (index === '1') {
                router.push('/')
            } else if (index === '2') {
                router.push('/objects')
            } else if (index === '3') {
                router.push('/about')
            }
        }

        return {
            activeMenu,
            handleSelect,
        }
    },
})
</script>

<style scoped>
.sidebar {
    width: 200px;
    height: 100vh;
    background-color: #f5f5f5;
    border-right: 1px solid #dcdcdc;
    position: fixed;
    top: 0;
    left: 0;
    overflow: auto;
}

.el-menu {
    height: 100%;
    border-right: none;
}
</style>