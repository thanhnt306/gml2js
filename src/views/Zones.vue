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

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router' // Import route to check for query params/props if coming from Dashboard
import ZonesTable from '@/components/dashboard/ZonesTable.vue'
import ZoneDetail from '@/views/ZoneDetail.vue' // Reusing the detail view component (ensure it handles props)

// State similar to StackLayout currentIndex
const currentView = ref('list') // 'list' or 'detail'
const selectedZoneId = ref(null)

const route = useRoute()
const router = useRouter()

const handleOpenZone = (item) => {
    selectedZoneId.value = item // or item.id if available
    currentView.value = 'detail'
}


// Handle navigation from Dashboard (if passed via route params/query)
// Watch for changes in query param to trigger detail view
// If query is empty, we do NOT reset (KeepAlive preserves state)
import { watch } from 'vue'

watch(
    () => route.query.zoneId,
    (newId) => {
        if (newId) {
            handleOpenZone({ id: newId })
        }
    },
    { immediate: true }
)

const handleBack = () => {
    selectedZoneId.value = null
    currentView.value = 'list'
    // Optional: Clear query param so that clicking the same row in Dashboard works again if it relies on change?
    // Actually, if we just go back to list, the URL is likely still ?zoneId=1 if we didn't change it.
    // Converting the URL back to clean /app/zones is good practice.
    router.replace({ name: 'zones', query: {} }) 
}
</script>
