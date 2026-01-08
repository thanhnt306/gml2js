<template>
  <div class="w-full h-full flex flex-col pt-4 pb-4">
      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <ZoneStatusItem 
            v-for="(item, index) in items"
            :key="index"
            :zoneName="item.zoneName"
            :existDate="item.simulationTime"
            :segments="calculateSegments(item)"
          />
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ZoneStatusItem from './ZoneStatusItem.vue'
// Needed for mock data logic
import GeometryService from '@/services/GeometryService' 

const items = ref([
    { zoneName: "Example Project 1", simulationTime: "6/10/2024", abnormalNum: 20, identifiedNum: 30, falseAlertNum: 20 },
    { zoneName: "Example Project 2", simulationTime: "6/12/2024", abnormalNum: 10, identifiedNum: 40, falseAlertNum: 5 },
    { zoneName: "DMA 05", simulationTime: "Today", abnormalNum: 5, identifiedNum: 15, falseAlertNum: 2 }
])

const calculateSegments = (item) => {
    const total = item.abnormalNum + item.identifiedNum + item.falseAlertNum
    const segments = []
    const colors = ["#CE7829", "#D6C402", "#529B26", "#1AB4B4B4"]
    
    // Abnormal
    if (item.abnormalNum > 0) {
        segments.push({
            percent: (item.abnormalNum / total) * 100,
            color: colors[0],
            label: item.abnormalNum
        })
    }
    // False Alert
    if (item.falseAlertNum > 0) {
        segments.push({
            percent: (item.falseAlertNum / total) * 100,
            color: colors[1],
            label: item.falseAlertNum
        })
    }
    // Identified
    if (item.identifiedNum > 0) {
        segments.push({
            percent: (item.identifiedNum / total) * 100,
            color: colors[2],
            label: item.identifiedNum
        })
    }
    
    return segments
}
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
