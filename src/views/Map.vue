<template>
  <div class="relative w-full h-full">
    <MapCanvas>
       <!-- Tools Container (Right Side) -->
       <div class="absolute top-[19px] right-[5px] flex flex-col space-y-[5px]">
          <MapToolButton 
             icon="filter_unpress.png" 
             hoverIcon="filter_pressed.png" 
             activeIcon="filter_pressed.png"
             tooltip="Filter junctions and pipes."
             :active="isPanelActive('filter')"
             @click="togglePanel('filter')"
          />
           <MapToolButton 
             icon="network_unpress.png" 
             hoverIcon="network_pressed.png" 
             activeIcon="network_pressed.png"
             tooltip="Edit junctions and pipes in network."
             :active="isPanelActive('edit')"
             @click="togglePanel('edit')"
          />
           <MapToolButton 
             icon="find_path_unpress.png" 
             hoverIcon="find_path_pressed.png" 
             activeIcon="find_path_pressed.png"
             tooltip="Find shortest path between two junctions."
             :active="isPanelActive('findPath')"
             @click="togglePanel('findPath')"
          />
           <MapToolButton 
             icon="sensor_unpress.png" 
             hoverIcon="sensor_pressed.png" 
             activeIcon="sensor_pressed.png"
             tooltip="Place sensors across network!"
             :active="isPanelActive('sensor')"
             @click="togglePanel('sensor')"
          />
           <MapToolButton 
             icon="hydraulic_check_unpress.png" 
             hoverIcon="hydraulic_check_pressed.png" 
             activeIcon="hydraulic_check_pressed.png"
             tooltip="Check hydraulic errors in the network."
             :active="isPanelActive('hydraulic')"
             @click="togglePanel('hydraulic')"
          />
       </div>

       <!-- Bottom Right Controls (Zoom, etc if needed, or Layer Toggles) -->
       <!-- Layer Toggles replicating QML -->
       <div class="absolute bottom-[24px] right-[5px] flex flex-col items-end space-y-2">
           <!-- Layer controls simplified for now -->
       </div>

       <!-- Mock Panels -->
       <div v-if="activePanel === 'filter'" class="absolute right-[60px] top-[19px] w-[300px] h-[600px] bg-gray-800 rounded-lg p-4 text-white bg-opacity-90">
           <h3 class="font-bold mb-2">Filter Network Objects</h3>
           <p class="text-sm text-gray-400">Panel Placeholder</p>
       </div>
    </MapCanvas>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MapCanvas from '@/components/map/MapCanvas.vue'
import MapToolButton from '@/components/map/MapToolButton.vue'
import GeometryService from '@/services/GeometryService'

const activePanel = ref(null)

const togglePanel = (panelName) => {
    if (activePanel.value === panelName) {
        activePanel.value = null
    } else {
        activePanel.value = panelName
        // Example mock interaction
        if (panelName === 'sensor') {
             GeometryService.showSensorLocationsFromDatabase()
        }
    }
}

const isPanelActive = (panelName) => {
    return activePanel.value === panelName
}
</script>
