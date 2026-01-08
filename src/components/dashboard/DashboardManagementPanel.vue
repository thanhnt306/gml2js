<template>
  <div class="w-full h-full bg-white/10 rounded-lg flex flex-col p-6 backdrop-blur-sm">
      <div class="flex items-center space-x-4 mb-4">
          <span class="text-white font-montserrat font-semibold text-2xl">Management</span>
      </div>

      <!-- Scrollable List -->
      <div class="flex-1 w-full overflow-y-auto custom-scrollbar pr-2">
           <NRWIndexItem 
             v-for="(item, index) in items"
             :key="index"
             :zoneName="item.zoneName"
             :cumulativePercent="item.cumulativePercentValue"
             :cumulativeDate="item.cumulativeDate"
             :lastUpdatePercent="item.lastUpdatePercentValue"
             :lastUpdateDate="item.lastUpdateDate"
           />
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NRWIndexItem from './NRWIndexItem.vue'

const items = ref([
    { 
        zoneName: "Example Project 1", 
        cumulativePercentValue: 20, 
        cumulativeDate: "6/10/2024 ~ 11/10/2024", 
        lastUpdatePercentValue: 30, 
        lastUpdateDate: "10/10/2024 ~ 11/10/2024" 
    },
    { 
        zoneName: "Example Project 2", 
        cumulativePercentValue: 35, 
        cumulativeDate: "6/10/2024 ~ 11/10/2024", 
        lastUpdatePercentValue: 15, 
        lastUpdateDate: "10/10/2024 ~ 11/10/2024" 
    }
])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4B5563;
    border-radius: 20px;
}
</style>
