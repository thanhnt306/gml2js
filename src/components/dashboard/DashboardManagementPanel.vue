<template>
    <div class="w-full h-full bg-white/10 rounded-lg flex flex-col p-6 backdrop-blur-sm">
        <div class="flex items-center space-x-4 mb-4">
            <span class="text-white font-montserrat font-semibold text-2xl">Management</span>
        </div>

        <!-- Scrollable List -->
        <div class="flex-1 w-full overflow-y-auto custom-scrollbar pr-2">
            <NRWIndexItem v-for="(item, index) in items" :key="index" :zoneName="item.zoneName"
                :cumulativePercent="item.cumulativePercentValue" :cumulativeDate="item.cumulativeDate"
                :lastUpdatePercent="item.lastUpdatePercentValue" :lastUpdateDate="item.lastUpdateDate" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NRWIndexItem from './NRWIndexItem.vue'
import api from '../../services/api'

interface DashboardItem {
    zoneName: string
    cumulativePercentValue: number
    cumulativeDate: string
    lastUpdatePercentValue: number
    lastUpdateDate: string
}

const items = ref<DashboardItem[]>([])
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

const fetchNRWHealthIndex = async () => {
    loading.value = true
    error.value = null
    try {
        // auto call no need userId param because Gateway will auto get from token
        const response = await api.get(`/system/nrw-health`)
        items.value = response.data
    } catch (err: any) {
        console.error('Failed to fetch NRW Health Index:', err)
        error.value = err?.response?.data?.error || 'Failed to load NRW Health Index.'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchNRWHealthIndex()
})
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
