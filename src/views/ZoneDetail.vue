<template>
  <div class="w-full h-full p-8 bg-[#202020] rounded-[15px] flex flex-col relative">
      <!-- Back Button -->
      <button 
        class="absolute top-8 left-8 flex items-center space-x-0 hover:bg-[#a1535353] rounded px-1 transition-colors"
        @click="goBack"
      >
          <img src="@/assets/images/expand_more_left_24x24.svg" class="w-6 h-6" />
          <span class="text-[#A7A7A7] font-inter text-[13px]">back to Zones</span>
      </button>

      <!-- Header -->
      <div class="mt-8 mb-4 border-b border-[#5D5D5D] pb-3 flex justify-between items-center">
          <h1 class="text-white font-montserrat font-bold text-3xl">
              {{ zoneName }}
          </h1>
          <!-- Top Right Actions -->
          <div class="flex space-x-2">
              <!-- Placeholders for More / History buttons -->
          </div>
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div class="flex flex-col space-y-4">
              <!-- Network Tab -->
              <ContentTabItem 
                label="Network" 
                description="This is the first step in using GAILL for your zone. Here you’ll set up the foundation to build a high-fidelity digital twin of your water network."
                :isExpanded="expandedTab === 'network'"
                @toggle="toggleTab('network')"
              >
                 <div class="h-[200px] bg-white/5 rounded flex items-center justify-center text-gray-500">
                    Network Detail Page Placeholder
                 </div>
              </ContentTabItem>

              <!-- Operation Tab -->
              <ContentTabItem 
                label="Operation" 
                description="This is where you upload your operational data. These inputs directly power GAILL’s analysis."
                :isExpanded="expandedTab === 'operation'"
                @toggle="toggleTab('operation')"
              >
                  <div class="h-[150px] bg-white/5 rounded flex items-center justify-center text-gray-500">
                    Operational Data Page Placeholder
                 </div>
              </ContentTabItem>

               <!-- Analysis Tab -->
              <ContentTabItem 
                label="Analysis" 
                description="Select the analysis type—hydraulics, leaks, or meter anomalies—configure your resources and date range."
                :isExpanded="expandedTab === 'analysis'"
                @toggle="toggleTab('analysis')"
              >
                  <div class="h-[150px] bg-white/5 rounded flex items-center justify-center text-gray-500">
                    Analysis Setting Page Placeholder
                 </div>
              </ContentTabItem>

              <!-- Anomaly Tab -->
              <ContentTabItem 
                label="Anomaly" 
                description=""
                :isExpanded="expandedTab === 'anomaly'"
                @toggle="toggleTab('anomaly')"
              >
                  <div class="h-[300px] bg-white/5 rounded flex items-center justify-center text-gray-500">
                    Anomaly Report Page Placeholder
                 </div>
              </ContentTabItem>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ContentTabItem from '@/components/zones/ContentTabItem.vue'

const router = useRouter()
const route = useRoute()
const zoneName = ref('Loading...')
const expandedTab = ref('network') // Default expanded

const emit = defineEmits(['back'])

const goBack = () => {
    emit('back')
}

const toggleTab = (tab) => {
    // If clicking same tab, collapse it (optional behavior, QML code suggests toggle)
    if (expandedTab.value === tab) {
        expandedTab.value = null
    } else {
        expandedTab.value = tab
    }
}

onMounted(() => {
    // Mock fetching zone data by ID
    const id = route.params.id
    zoneName.value = `Example Project ${id}` 
})
</script>
