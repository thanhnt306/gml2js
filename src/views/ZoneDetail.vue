<template>
  <div class="w-full h-full p-8 bg-[#202020] rounded-[15px] flex flex-col relative">
      <!-- Back Button -->
      <button 
        class="absolute top-8 left-8 flex items-center space-x-0 hover:bg-[#535353a1] rounded px-1 transition-colors"
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
                 <!-- Network Wizard Container -->
                 <div class="w-full bg-[#4B4B4B] rounded-lg p-4 min-h-[500px]">
                    <NetworkSetupWizard />
                 </div>
              </ContentTabItem>

              <!-- Operation Tab -->
              <ContentTabItem 
                label="Operation" 
                description="This is where you upload your operational data. These inputs directly power GAILL’s analysis."
                :isExpanded="expandedTab === 'operation'"
                @toggle="toggleTab('operation')"
              >
                 <!-- Operational Data Wizard Container -->
                 <div class="w-full bg-[#151515] rounded-lg p-4">
                    <OperationalDataImport />
                 </div>
              </ContentTabItem>

               <!-- Analysis Tab -->
              <ContentTabItem 
                label="Analysis" 
                description="Select the analysis type—hydraulics, leaks, or meter anomalies—configure your resources and date range."
                :isExpanded="expandedTab === 'analysis'"
                @toggle="toggleTab('analysis')"
              >
                  <!-- Analysis Setting -->
                 <div class="w-full">
                    <AnalysisSetting />
                 </div>
              </ContentTabItem>

              <!-- Anomaly Tab -->
              <ContentTabItem 
                label="Anomaly" 
                description=""
                :isExpanded="expandedTab === 'anomaly'"
                @toggle="toggleTab('anomaly')"
              >
                  <!-- Anomaly Report -->
                 <div class="w-full">
                    <AnomalyReport />
                 </div>
              </ContentTabItem>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ContentTabItem from '@/components/zones/ContentTabItem.vue'
import NetworkSetupWizard from '@/components/zones/network/NetworkSetupWizard.vue'
import OperationalDataImport from '@/components/zones/operation/OperationalDataImport.vue'
import AnalysisSetting from '@/components/zones/analysis/AnalysisSetting.vue'
import AnomalyReport from '@/components/zones/anomaly/AnomalyReport.vue'

type TabName = 'network' | 'operation' | 'analysis' | 'anomaly'

const route = useRoute()
const zoneName = ref('Loading...')
const expandedTab = ref<TabName | null>('network') // Default expanded

const emit = defineEmits<{
  back: []
}>()

const goBack = (): void => {
    emit('back')
}

const toggleTab = (tab: TabName): void => {
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