<template>
  <div class="bg-white/10 rounded-lg p-6 w-full max-w-[500px]">
    <div class="flex flex-col space-y-4">
      
      <!-- Date Time Format -->
      <div class="flex items-center justify-between">
         <span class="text-white font-montserrat text-sm">DateTime Format:</span>
         <div class="relative w-[180px]">
            <select 
             v-model="config.dateFormat"
             class="w-full bg-[#1A1A1A] border border-[#5D5D5D] text-white text-sm rounded px-3 py-2 appearance-none focus:outline-none focus:border-[#529B26]"
            >
              <option value="dd/MM/yyyy">dd/MM/yyyy</option>
              <option value="MM/dd/yyyy">MM/dd/yyyy</option>
              <option value="dd-MM-yyyy">dd-MM-yyyy</option>
              <option value="MM-dd-yyyy">MM-dd-yyyy</option>
            </select>
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                 <img src="@/assets/images/expand_down_white_24x24.svg" class="w-4 h-4 opacity-70" />
            </div>
         </div>
      </div>

       <!-- Flow Unit -->
      <div class="flex items-center justify-between">
         <span class="text-white font-montserrat text-sm">Flow Unit:</span>
         <div class="relative w-[180px]">
            <select 
             v-model="config.flowUnit"
             class="w-full bg-[#1A1A1A] border border-[#5D5D5D] text-white text-sm rounded px-3 py-2 appearance-none focus:outline-none focus:border-[#529B26]"
            >
              <option v-for="unit in flowUnits" :key="unit" :value="unit">{{ unit }}</option>
            </select>
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                 <img src="@/assets/images/expand_down_white_24x24.svg" class="w-4 h-4 opacity-70" />
            </div>
         </div>
      </div>

       <!-- Pressure Unit -->
      <div class="flex items-center justify-between">
         <span class="text-white font-montserrat text-sm">Pressure Unit:</span>
         <div class="relative w-[180px]">
            <select 
             v-model="config.pressureUnit"
             class="w-full bg-[#1A1A1A] border border-[#5D5D5D] text-white text-sm rounded px-3 py-2 appearance-none focus:outline-none focus:border-[#529B26]"
            >
              <option v-for="unit in pressureUnits" :key="unit" :value="unit">{{ unit }}</option>
            </select>
             <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                 <img src="@/assets/images/expand_down_white_24x24.svg" class="w-4 h-4 opacity-70" />
            </div>
         </div>
      </div>

       <!-- Consumption Unit -->
      <div class="flex items-center justify-between">
         <span class="text-white font-montserrat text-sm">Consumption Unit:</span>
         <div class="relative w-[180px]">
            <select 
             v-model="config.consumptionUnit"
             class="w-full bg-[#1A1A1A] border border-[#5D5D5D] text-white text-sm rounded px-3 py-2 appearance-none focus:outline-none focus:border-[#529B26]"
            >
               <option v-for="unit in consumptionUnits" :key="unit" :value="unit">{{ unit }}</option>
            </select>
             <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                 <img src="@/assets/images/expand_down_white_24x24.svg" class="w-4 h-4 opacity-70" />
            </div>
         </div>
      </div>

      <!-- Confirm Button -->
      <div class="flex justify-end pt-4">
        <button 
          @click="handleConfirm"
          class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors"
        >
          Confirm
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const emit = defineEmits<{
  (e: 'next'): void
}>()

const config = reactive({
    dateFormat: 'dd/MM/yyyy',
    flowUnit: 'm³/h',
    pressureUnit: 'm',
    consumptionUnit: 'm³'
})

const flowUnits = ["m³/h", "m³/s", "L/h", "L/m", "L/s", "ft³/h", "ft³/s", "gal/h", "gal/s"]
const pressureUnits = ["m", "ft", "Pa", "kPa", "bar", "psi"]
const consumptionUnits = ["m³", "L", "in³", "ft³", "gal"]

const handleConfirm = () => {
    console.log('Confirmed config:', config)
    // Here we would call ConnectDataManager logic
    emit('next')
}
</script>
