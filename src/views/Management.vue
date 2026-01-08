<template>
  <div class="w-full h-full p-8 bg-[#202020] text-white overflow-y-auto flex flex-col font-montserrat">
    <!-- Header -->
    <div class="flex flex-col mb-4 bg-transparent">
      <div class="text-2xl font-bold mb-4 ml-[6%]">Management</div>
      <div class="w-[977px] h-[1px] bg-[#5D5D5D] ml-[6%] mb-4"></div>
    </div>

    <!-- Zone Selector (Separate Section) -->
    <div class="ml-[6%] w-[88%] h-[52px] bg-white/10 rounded-lg flex items-center mb-4 pl-4 flex-none">
      <span class="text-[#A7A7A7] font-medium text-lg mr-4">Zones:</span>
      <div class="relative w-[240px]">
        <select 
          class="w-full h-[37px] bg-[#529B26] text-white rounded font-semibold pl-3 pr-8 appearance-none focus:outline-none"
          v-model="selectedZone"
        >
          <option v-for="zone in zones" :key="zone.id" :value="zone.id">{{ zone.name }}</option>
        </select>
        <div class="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="flex-1 ml-[6%] w-[88%] bg-white/10 rounded-lg p-6 flex flex-col gap-4">
      
      <!-- Top Part: Columns -->
      <div class="flex-1 flex gap-6 min-h-0">
        
          <!-- Left Column -->
          <div class="flex-1 flex flex-col min-h-0">
              
              <!-- Tabs -->
              <div class="flex-none flex mb-2 h-[34px]">
                 <div class="flex space-x-2">
                   <button 
                     v-for="tab in tabs" 
                     :key="tab.id"
                     @click="currentTab = tab.id"
                     :class="[
                       'w-[80px] h-[30px] rounded text-xs font-bold transition-colors',
                       currentTab === tab.id ? 'bg-[#529B26] text-white' : 'bg-[#525252] text-[#A7A7A7] hover:bg-white/5'
                     ]"
                   >
                     {{ tab.label }}
                   </button>
                 </div>
              </div>

              <!-- Main Chart Graph Area -->
              <!-- Added min-h-[300px] to prevent shrinking too small -->
              <div class="flex-1 relative w-full min-h-[300px] mb-2 bg-white/10 rounded-lg p-2">
                 <!-- Dates (Top Right inside Chart Area) -->
                 <div class="absolute top-2 right-2 flex items-center space-x-2 text-[10px] text-[#A7A7A7] z-20">
                   <span>from</span>
                   <div class="bg-transparent border border-[#626161] rounded px-2 py-0.5 text-white">18/07/2023</div>
                   <span>to</span>
                   <div class="bg-transparent border border-[#626161] rounded px-2 py-0.5 text-white">18/10/2023</div>
                 </div>

                 <!-- Y Axis Label -->
                 <div class="absolute top-2 left-2 text-[10px] text-white z-10">Amount (m³)</div>
                 
                 <!-- Legend -->
                 <div class="absolute top-2 left-[100px] flex-col space-y-1 text-[9px] z-10">
                    <div class="flex items-center gap-2"><div class="w-[40px] h-[4px] bg-[#39FF14]"></div> <span>Consumption</span></div>
                    <div class="flex items-center gap-2"><div class="w-[40px] h-[4px] bg-[#225486]"></div> <span>Supply</span></div>
                    <div class="flex items-center gap-2"><div class="w-[40px] h-[4px] bg-[#C96E14]"></div> <span>NRW</span></div>
                 </div>
                 
                 <div class="w-full h-full pt-6"> <!-- Increased padding top for Dates/Legend -->
                   <ManagementChart :mode="currentTab" 
                     :dates="['07-18-2023', '08-10-2023', '09-01-2023', '09-24-2023', '10-17-2023']" 
                     :supplyData="[386, 400, 500, 550, 294]"
                     :consumptionData="[350, 360, 480, 520, 225]"
                     :nrwData="[36, 40, 20, 30, 68]"
                   />
                 </div>
              </div>

              <!-- Cumulative Insights Row (Bottom of Left Column) -->
              <div class="flex-none h-[140px] flex gap-4 mt-2">
                   <!-- Block 1: Title & NRW Performance -->
                   <div class="w-[25%] flex flex-col justify-between">
                       <!-- Title -->
                       <div class="mb-2">
                          <div class="text-sm font-bold leading-tight">Cumulative<br>Insights</div>
                          <div class="text-[9px] text-[#A7A7A7]">2023-07-18~2023-10-18</div>
                       </div>
                       <!-- NRW Performance -->
                       <div class="flex-1 bg-white/10 rounded-lg p-2 flex flex-col justify-center">
                          <span class="text-[10px] font-semibold">NRW Performance</span>
                          <span class="text-3xl font-medium text-[#FC6B6D] text-center mt-1">21 %</span>
                       </div>
                   </div>

                   <!-- Block 2: Stats -->
                   <div class="w-[25%] flex flex-col justify-between">
                      <StatBox label="Supply" value="201,635" />
                      <StatBox label="Consumption" value="157,609" />
                      <StatBox label="NRW" value="44,026.2" />
                   </div>

                   <div class="w-[25%] bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center relative">
                      <span class="absolute top-1 left-2 text-[10px] font-medium">NRW Health Index</span>
                      <div class="h-full flex items-end pb-2">
                           <HalfCircle :showNumber="21.8" :scale="0.8" :segments="[21.8]"/>
                      </div>
                   </div>
                   
                   <div class="flex-1 bg-white/5 rounded-lg p-1 flex flex-col justify-center space-y-1 text-[8px]">
                      <div class="text-[#A7A7A7] text-center mb-0.5">(%)</div>
                      <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-sm bg-[#529B26]"></div> <span class="text-[#A7A7A7]">&lt;25</span></div>
                      <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-sm bg-[#E2A408]"></div> <span class="text-[#A7A7A7]">25-40</span></div>
                      <div class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-sm bg-[#FC6B6D]"></div> <span class="text-[#A7A7A7]">&gt;40</span></div>
                   </div>
               </div>
          </div>

          <!-- Right Column (Latest Updates) -->
          <!-- Algined with Main Chart, skipping Tabs height (34px + margin) -->
          <div class="w-[280px] flex flex-col pt-[42px]">
               <div class="flex flex-col space-y-2">
                 <div class="flex justify-between items-start">
                   <div class="text-lg font-bold leading-tight">Latest<br>Updates</div>
                   <button class="w-6 h-6"><img src="@/assets/images/filter_24x24.svg" class="w-full h-full opacity-50" /></button>
                 </div>
                 <div class="text-xs text-[#A7A7A7]">2023-10-18~2023-10-18</div>
                 
                 <div class="bg-white/10 rounded-lg p-2 h-[80px] flex flex-col justify-between">
                    <span class="text-[11px] font-semibold">NRW Performance</span>
                    <span class="text-3xl font-medium text-[#529B26] text-center">23 %</span>
                 </div>

                 <div class="flex flex-col space-y-1">
                    <StatBox label="Supply" value="294" />
                    <StatBox label="Consumption" value="225.42" />
                    <StatBox label="NRW" value="68.58" />
                 </div>
               </div>
          </div>
      
      </div>

      <!-- Bottom Part: Inspection Area -->
      <div class="text-sm font-bold leading-tight mb-1">Inspection</div>
      <div class="flex-none h-[140px] bg-white/10 rounded-lg p-2 flex flex-col mb-2">
         <div class="flex-1 relative min-h-0">
            <InspectionChart 
                :labels="['2026-01-08T08:18:28', '2026-01-08T08:34:33']"
                :identifiedData="[21, 22]"
                :abnormalData="[8, 6]"
                :falseAlertData="[4, 4]"
            />
            <div class="absolute top-2 right-2 flex flex-col space-y-1 text-[9px]">
               <div class="flex items-center gap-2"><div class="w-2 h-2 rounded-sm bg-[#529B26]"></div> <span class="text-[#A7A7A7]">Identified</span></div>
               <div class="flex items-center gap-2"><div class="w-2 h-2 rounded-sm bg-[#CE7829]"></div> <span class="text-[#A7A7A7]">Abnormal</span></div>
               <div class="flex items-center gap-2"><div class="w-2 h-2 rounded-sm bg-[#FC6B6D]"></div> <span class="text-[#A7A7A7]">FalseAlert</span></div>
            </div>
         </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HalfCircle from '@/components/management/HalfCircle.vue'
import ManagementChart from '@/components/management/ManagementChart.vue'
import InspectionChart from '@/components/management/InspectionChart.vue'

import { defineComponent, h } from 'vue'
const StatBox = defineComponent({
  props: ['label', 'value'],
  render() {
    return h('div', { class: 'bg-white/5 rounded-lg px-2 py-1 w-full h-[43px] flex items-center justify-between' }, [
       h('span', { class: 'text-[11px] font-medium' }, this.label),
       h('span', { class: 'text-[13px] font-light' }, this.value)
    ])
  }
})

const zones = ref([
  { id: 1, name: 'BT1302' },
  { id: 2, name: 'Example Project 2' }
])
const selectedZone = ref(1)

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'nrw', label: 'NRW' }
]
const currentTab = ref('overview')

</script>

<style scoped>
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
