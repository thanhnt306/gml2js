<template>
  <div class="flex h-screen w-screen bg-black overflow-hidden">
    <!-- Navigation Bar -->
    <NavigationBar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col relative z-0">
      <RouterView v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </div>
  </div>
</template>

<script setup>
import NavigationBar from '../components/NavigationBar.vue'
</script>
