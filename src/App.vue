<template>
  <div class="app-container">
    <Sidebar />
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Sidebar from './components/Sidebar.vue'

export default defineComponent({
  name: 'App',
  components: {
    Sidebar,
  },
})
</script>

<style>
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  /* 确保侧栏有固定宽度 */
  flex-shrink: 0;
  /* 防止侧栏被压缩 */
}

.main-content {
  flex: 1;
  /* 主内容区域占据剩余空间 */
  padding: 20px;
  overflow: auto;
  margin-left: 200px;
  /* 确保主内容区域不会与侧栏重叠 */
}
</style>
