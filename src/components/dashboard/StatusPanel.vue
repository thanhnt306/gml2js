<template>
  <div class="w-full h-full bg-white/10 rounded-lg flex flex-col p-6 backdrop-blur-sm">
      <div class="flex items-center space-x-4 mb-4">
          <span class="text-white font-montserrat font-semibold text-2xl">Status</span>
          
          <!-- Tab Bar -->
          <div class="flex space-x-2">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="currentTab = tab.id"
                class="px-4 py-1 rounded transition-colors duration-200"
                :class="currentTab === tab.id ? 'bg-[#529B26]/80 text-white' : 'text-[#A7A7A7] hover:text-white'"
              >
                 <span class="font-montserrat font-semibold text-sm">{{ tab.name }}</span>
              </button>
          </div>
      </div>

      <!-- Content -->
      <div class="flex-1 w-full relative">
          <component :is="activeComponent" />
      </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ZoneTrackerTab from './ZoneTrackerTab.vue'
import AnalysisDateTab from './AnalysisDateTab.vue'

const currentTab = ref('zoneTracker')
const tabs = [
    { id: 'zoneTracker', name: 'Zone Tracker' },
    { id: 'analysisDate', name: 'Analysis Date' }
]

const activeComponent = computed(() => {
    return currentTab.value === 'zoneTracker' ? ZoneTrackerTab : AnalysisDateTab
})
</script>
