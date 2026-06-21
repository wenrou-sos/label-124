<template>
  <div class="tabbar-layout">
    <router-view />
    <van-tabbar v-model="active" route active-color="#1989fa" safe-area-inset-bottom>
      <van-tabbar-item
        v-for="item in tabs"
        :key="item.path"
        :to="item.path"
        :icon="item.icon"
      >
        {{ item.name }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)

const tabs = [
  { path: '/home', name: '首页', icon: 'home-o' },
  { path: '/booking', name: '约车', icon: 'calendar-o' },
  { path: '/courses', name: '已约课程', icon: 'orders-o' },
  { path: '/profile', name: '我的', icon: 'user-o' },
]

watch(
  () => route.path,
  (path) => {
    const idx = tabs.findIndex((t) => path.startsWith(t.path))
    if (idx !== -1) active.value = idx
  },
  { immediate: true }
)
</script>

<style scoped>
.tabbar-layout {
  min-height: 100vh;
}
</style>
