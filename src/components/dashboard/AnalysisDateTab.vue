<template>
  <div class="w-full h-full">
     <FluTableView :columns="columns" :items="items" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FluTableView from '../fluentui/FluTableView.vue'
import { useZoneStore } from '@/stores/zone'

const zoneStore = useZoneStore()

interface Column {
  title: string
  key: string
  width: string
}

const columns: Column[] = [
    { title: 'Zone', key: 'zoneName', width: '50%' },
    { title: 'Latest Analysis Date', key: 'lastDate', width: '50%' }
]

interface AnalysisItem {
  zoneName: { text: string; bold: boolean; color: string }
  lastDate: { text: string; bold: boolean; color: string }
}

const items = computed<AnalysisItem[]>(() => {
    const data = zoneStore.zoneStatus?.analysisDate || []
    return data.map(item => ({
        zoneName: { text: item.zoneName, bold: false, color: "#FFFFFF" },
        lastDate: { text: item.lastDate, bold: false, color: "#A7A7A7" }
    }))
})
</script>
