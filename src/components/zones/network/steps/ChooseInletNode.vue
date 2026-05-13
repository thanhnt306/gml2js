<template>
  <div class="bg-[#202020] rounded-[15px] w-full h-[500px] relative overflow-hidden flex flex-col transition-all duration-300"
       :class="isActive
         ? 'border-2 border-[#529B26] shadow-[0_0_24px_rgba(82,155,38,0.45)]'
         : 'border border-[#5D5D5D]'"
  >

    <!-- Map Container -->
    <div ref="mapContainer" class="flex-1 relative">
      <!-- Loading overlay (shown while backend is processing) -->
      <div
        v-if="isLoading || !isReady"
        class="absolute inset-0 z-10 bg-black/60 flex flex-col items-center justify-center gap-3"
      >
        <div class="w-8 h-8 border-2 border-[#529B26] border-t-transparent rounded-full animate-spin"></div>
        <span class="text-[#A7A7A7] font-inter text-sm">Loading map...</span>
      </div>

      <!-- Instruction overlay (top-left) -->
      <div
        v-if="isReady && !isLoading"
        class="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs font-inter max-w-[260px]"
      >
        Click on a <b class="text-[#FFEB3B]">node</b> to select it as the inlet.
        <span v-if="networkMap.selectedInletLabels.value.length > 0" class="block mt-1 text-[#81C784]">
          {{ networkMap.selectedInletLabels.value.length }} inlet(s) selected
        </span>
      </div>

      <!-- Search input -->
      <div
        v-if="isReady && !isLoading"
        class="absolute top-14 left-3 z-10"
      >
        <input
          v-model="searchText"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Search node label..."
          class="w-[200px] bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs font-inter placeholder-[#5D5D5D] focus:outline-none focus:border-[#529B26] transition-colors"
        />
      </div>

      <!-- Undo button (top-right) -->
      <button
        v-if="networkMap.selectedInletLabels.value.length > 0"
        @click="networkMap.undoLastInlet()"
        class="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[#FC6B6D] text-xs font-inter hover:bg-black/90 transition-colors border border-white/10"
        title="Undo last chosen inlet"
      >
        ↩ Undo
      </button>


      <!-- Legend (shared component) -->
      <MapLegend v-if="isReady && !isLoading" />

    </div>

    <!-- Action Button (Done only — no cancel, user must complete) -->
    <div class="absolute bottom-3 right-3 flex space-x-2 z-10">
      <button
        @click="finishSelection"
        :disabled="networkMap.selectedInletLabels.value.length === 0"
        class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Done ({{ networkMap.selectedInletLabels.value.length }})
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useNetworkMap } from '@/composables/useNetworkMap'
import type { NetworkGraphData } from '@/services/NetworkGraphService'
import MapLegend from '@/components/map/MapLegend.vue'

const props = defineProps<{
  networkData: NetworkGraphData | null
  isLoading: boolean
  isActive?: boolean
}>()

const emit = defineEmits<{
  (e: 'done', labels: string[]): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const networkMap = useNetworkMap()
const isReady = ref(false)
const searchText = ref('')

// Expose the map container element for parent overlay targeting
defineExpose({ mapContainer })

onMounted(() => {
  if (mapContainer.value) {
    networkMap.initMap(mapContainer.value)

    // If we already have data, render it
    if (props.networkData) {
      renderAndActivate(props.networkData)
    }
  }
})

// Watch for network data changes (arrives after backend processing)
watch(() => props.networkData, (data) => {
  if (data && networkMap.isMapReady.value) {
    renderAndActivate(data)
  }
})

// Also watch for map ready state
watch(() => networkMap.isMapReady.value, (ready) => {
  if (ready && props.networkData) {
    renderAndActivate(props.networkData)
  }
})

/**
 * Render network and auto-start inlet selection mode.
 * This is a one-time flow — user must pick at least 1 inlet.
 */
function renderAndActivate(data: NetworkGraphData) {
  networkMap.renderNetwork(data)
  isReady.value = true

  // Auto-start inlet selection mode immediately
  networkMap.enableInletSelection((nodeLabel) => {
    networkMap.highlightAsInlet(nodeLabel)
  })
}

function handleSearch() {
  if (searchText.value.trim()) {
    const found = networkMap.searchAndZoomToNode(searchText.value.trim())
    if (!found) {
      console.log('Node not found:', searchText.value)
    }
  }
}

function finishSelection() {
  if (networkMap.selectedInletLabels.value.length === 0) return

  const labels = [...networkMap.selectedInletLabels.value]
  networkMap.disableInletSelection()
  emit('done', labels)
}
</script>
