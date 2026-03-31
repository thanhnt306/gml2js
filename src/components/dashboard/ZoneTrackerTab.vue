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

<script setup lang="ts">
import { computed } from 'vue'
import ZoneStatusItem from './ZoneStatusItem.vue'
import { useZoneStore } from '@/stores/zone'
import type { ZoneTrackerItem } from '@/services/ZoneService'

const zoneStore = useZoneStore()

const items = computed<ZoneTrackerItem[]>(() => {
    return zoneStore.zoneStatus?.zoneTracker || []
})

interface Segment {
  percent: number
  color: string
  label: number
}

const calculateSegments = (item: ZoneTrackerItem): Segment[] => {
    const total = item.abnormalNum + item.identifiedNum + item.falseAlertNum
    const segments: Segment[] = []
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
