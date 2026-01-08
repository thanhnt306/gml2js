<template>
  <div class="w-full h-full relative">
    <!-- Map View Div -->
    <div ref="mapViewDiv" class="w-full h-full outline-none"></div>

    <!-- Map Tools/Overlays -->
    <slot></slot>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
// import TileLayer from '@arcgis/core/layers/TileLayer'

const mapViewDiv = ref(null)
let view = null

onMounted(() => {
  if (mapViewDiv.value) {
    const map = new Map({
      basemap: "dark-gray-vector" // Matches the dark theme of the app
    })

    view = new MapView({
      container: mapViewDiv.value,
      map: map,
      center: [105.8, 21.0], // Default to roughly Vietnam/Hanoi as placeholder
      zoom: 12,
      ui: {
          components: [] // Hide default UI components to match QML clean look
      }
    })

    view.when(() => {
        console.log("Map Loaded")
    })
  }
})

onBeforeUnmount(() => {
  if (view) {
    view.destroy()
    view = null
  }
})
</script>

<style scoped>
/* Ensure map takes full size */
div[ref="mapViewDiv"] {
    width: 100%;
    height: 100%;
}
</style>
