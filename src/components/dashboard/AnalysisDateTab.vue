<template>
  <div class="w-full h-full">
     <FluTableView :columns="columns" :items="items" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FluTableView from '../fluentui/FluTableView.vue'

const columns = [
    { title: 'Zone', key: 'zoneName', width: '50%' },
    { title: 'Latest Analysis Date', key: 'lastDate', width: '50%' }
]

const items = ref([
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
