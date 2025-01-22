<script setup lang="ts">
import AppChat from './AppChat.vue'
</script>

<template>
  <main @contextmenu.stop.prevent="() => false">
    <AppChat class="app-chat" />
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.app-chat {
  width: 70%;
}
</style>
