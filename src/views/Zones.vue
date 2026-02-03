<template>
  <div class="w-full h-full p-8">
      <!-- Zones Table View -->
      <div v-if="currentView === 'list'" class="w-full h-full">
          <ZonesTable @open-zone="handleOpenZone" />
      </div>

      <!-- Zone Detail View -->
      <div v-else-if="currentView === 'detail'" class="w-full h-full">
          <ZoneDetail :zoneId="selectedZoneId" @back="handleBack" />
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ZonesTable from '@/components/dashboard/ZonesTable.vue'
import ZoneDetail from '@/views/ZoneDetail.vue'

type ViewType = 'list' | 'detail'

// State similar to StackLayout currentIndex
const currentView = ref<ViewType>('list')
const selectedZoneId = ref<any>(null)

const route = useRoute()

const handleOpenZone = (item: any): void => {
    selectedZoneId.value = item // or item.id if available
    currentView.value = 'detail'
}

// Handle navigation from Dashboard (if passed via route params/query)
watch(
    () => route.query.zoneId,
    (newId) => {
        if (newId) {
            handleOpenZone({ id: newId })
        }
    },
    { immediate: true }
)

const handleBack = (): void => {
    selectedZoneId.value = null
    currentView.value = 'list'
}
</script>
