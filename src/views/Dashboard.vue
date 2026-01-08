<template>
  <div class="w-full h-full p-8 flex flex-col bg-[#202020] overflow-hidden">
      <!-- Header / Customer Logo -->
      <div class="flex items-center space-x-4 mb-12 pl-4">
          <img src="@/assets/images/cus_image.png" class="h-[111px] object-contain" />
          <div class="flex flex-col justify-center h-[111px]">
              <span class="font-castoro text-2xl text-white leading-tight">Customer</span>
              <span class="font-castoro text-4xl text-white leading-tight">LOGO</span>
          </div>
      </div>

      <!-- Main Content Grid -->
      <div class="flex flex-1 space-x-7">
          
          <!-- Column 1: Zones Table + Status (Wider, approx 57%) -->
          <div class="flex flex-col space-y-6 flex-[4] h-full">
              <!-- Zones Table -->
              <div class="flex-1">
                  <ZonesTable @open-zone="handleOpenZone" />
              </div>

              <!-- Status Panel -->
              <div class="flex-1">
                  <StatusPanel />
              </div>
          </div>

          <!-- Column 2: Dashboard Management (Narrower, approx 43%) -->
          <div class="flex-[3] h-full">
               <DashboardManagementPanel />
          </div>
      </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import StatusPanel from '@/components/dashboard/StatusPanel.vue'
import DashboardManagementPanel from '@/components/dashboard/DashboardManagementPanel.vue'
import ZonesTable from '@/components/dashboard/ZonesTable.vue'
const router = useRouter()

const handleOpenZone = (item) => {
    // Navigate to Zones page and pass zone ID to open it
    // item is the row object. Assuming it has an ID or we pass a mock ID.
    console.log("Dashboard open zone:", item)
    router.push({ name: 'zones', query: { zoneId: 1 } }) // Use named route for better reliability
}
</script>

<style>
/* Font import handled in index.css generally, but ensuring fallback */
.font-castoro {
    font-family: 'Castoro Titling', serif;
}
</style>
