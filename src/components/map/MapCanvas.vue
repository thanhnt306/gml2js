<template>
  <div class="w-full h-full relative">
    <!-- Map View Div -->
    <div ref="mapViewDiv" class="w-full h-full outline-none"></div>

    <!-- Loading Overlay -->
    <Transition name="fade">
      <div
        v-if="networkStore.isLoading"
        class="absolute inset-0 z-10 bg-black/60 flex flex-col items-center justify-center gap-3 pointer-events-none"
      >
        <div class="w-8 h-8 border-2 border-[#529B26] border-t-transparent rounded-full animate-spin"></div>
        <span class="text-[#A7A7A7] font-inter text-sm">Loading network data...</span>
      </div>
    </Transition>

    <!-- Empty State Overlay -->
    <Transition name="fade">
      <div
        v-if="!networkStore.isLoading && !networkStore.networkData && !networkStore.error"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 pointer-events-none"
      >
        <svg class="w-12 h-12 text-[#5D5D5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span class="text-[#5D5D5D] font-inter text-sm">Select a zone to load network data</span>
      </div>
    </Transition>

    <!-- Error State -->
    <Transition name="fade">
      <div
        v-if="networkStore.error"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 pointer-events-none"
      >
        <span class="text-[#FC6B6D] font-inter text-sm">⚠ {{ networkStore.error }}</span>
      </div>
    </Transition>

    <!-- Map Tools/Overlays -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { useNetworkMap } from '@/composables/useNetworkMap'
import { useNetworkStore } from '@/stores/network'

const mapViewDiv = ref<HTMLDivElement | null>(null)
const networkStore = useNetworkStore()
const networkMap = useNetworkMap()

onMounted(() => {
  if (mapViewDiv.value) {
    networkMap.initMap(mapViewDiv.value)
  }
})

// Render network when data becomes available or changes
watch(
  () => networkStore.networkData,
  (data) => {
    if (data && networkMap.isMapReady.value) {
      networkMap.renderNetwork(data)
    }
  }
)

// Also watch map ready state — in case data arrived before map was ready
watch(
  () => networkMap.isMapReady.value,
  (ready) => {
    if (ready && networkStore.networkData) {
      networkMap.renderNetwork(networkStore.networkData)
    }
  }
)

onBeforeUnmount(() => {
  networkMap.destroy()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
