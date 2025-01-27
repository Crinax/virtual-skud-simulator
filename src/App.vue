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
  height: 100dvh;
  width: 100dvw;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
