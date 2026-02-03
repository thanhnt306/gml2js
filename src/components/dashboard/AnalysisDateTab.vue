<template>
  <div class="w-full h-full">
     <FluTableView :columns="columns" :items="items" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FluTableView from '../fluentui/FluTableView.vue'

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

const items = ref<AnalysisItem[]>([
    { 
        // Using object structure to mimic QML customItem
        zoneName: { text: "Example Project 1", bold: false, color: "#FFFFFF" }, 
        lastDate: { text: "6/10/2024", bold: false, color: "#A7A7A7" } 
    },
    { 
        zoneName: { text: "Example Project 2", bold: false, color: "#FFFFFF" }, 
        lastDate: { text: "6/12/2024", bold: false, color: "#A7A7A7" } 
    },
    { 
        zoneName: { text: "DMA 01", bold: false, color: "#FFFFFF" }, 
        lastDate: { text: "Today", bold: false, color: "#A7A7A7" } 
    },
    { 
        zoneName: { text: "DMA 05", bold: false, color: "#FFFFFF" }, 
        lastDate: { text: "Yesterday", bold: false, color: "#A7A7A7" } 
    }
])
</script>
