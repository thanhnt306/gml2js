<template>
  <div class="bg-white/10 rounded-lg p-6 w-full max-w-[500px]">
    <div class="flex flex-col space-y-4">
      
      <!-- Date Time Format -->
      <div class="flex items-center justify-between">
         <span class="text-white font-montserrat text-sm">Date Time Format:</span>
         <div class="relative w-[180px]">
            <BaseSelect 
              v-model="config.dateFormat"
              :options="['dd/MM/yyyy', 'MM/dd/yyyy', 'dd-MM-yyyy', 'MM-dd-yyyy']"
            />
         </div>
      </div>

       <!-- Flow Unit -->
      <div class="flex items-center justify-between">
         <span class="text-white font-montserrat text-sm">Flow Unit:</span>
         <div class="relative w-[180px]">
            <BaseSelect 
              v-model="config.flowUnit"
              :options="flowUnits"
            />
         </div>
      </div>

       <!-- Pressure Unit -->
      <div class="flex items-center justify-between">
         <span class="text-white font-montserrat text-sm">Pressure Unit:</span>
         <div class="relative w-[180px]">
            <BaseSelect 
              v-model="config.pressureUnit"
              :options="pressureUnits"
            />
         </div>
      </div>

       <!-- Consumption Unit -->
      <div class="flex items-center justify-between">
         <span class="text-white font-montserrat text-sm">Consumption Unit:</span>
         <div class="relative w-[180px]">
            <BaseSelect 
              v-model="config.consumptionUnit"
              :options="consumptionUnits"
            />
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
import BaseSelect from '@/components/common/BaseSelect.vue'

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
