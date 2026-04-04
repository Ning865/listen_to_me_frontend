<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (!userStore.isLogin && router.currentRoute.value.path !== '/login' && router.currentRoute.value.path !== '/register') {
    router.push('/login')
  }
})
</script>

<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  background: #eef3ff;
}

body {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #111827;
  background:
    radial-gradient(circle at top left, rgba(122, 92, 255, 0.16), transparent 30%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 24%),
    linear-gradient(180deg, #f8faff 0%, #f2f5ff 44%, #eef3ff 100%);
  background-attachment: fixed;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button,
input,
textarea {
  font: inherit;
}

#app {
  min-height: 100vh;
}
</style>
