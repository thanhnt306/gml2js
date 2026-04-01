<template>
  <div class="bg-white/10 rounded-lg p-6 w-full max-w-[500px]">
    <div v-if="isLoading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#529B26]"></div>
    </div>
    <div v-else class="flex flex-col space-y-4">
      
      <!-- Date Time Format -->
      <div class="flex items-center justify-between">
         <span class="text-white font-montserrat text-sm">Date Time Format:</span>
         <div class="relative w-[180px]">
            <BaseSelect 
              v-model="config.dateFormat"
              :options="dateFormats"
              labelKey="label"
              valueKey="value"
              :disabled="isSaving"
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
              labelKey="label"
              valueKey="value"
              :disabled="isSaving"
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
              labelKey="label"
              valueKey="value"
              :disabled="isSaving"
            />
         </div>
      </div>

       <!-- Consumption Unit (Meter Unit) -->
      <div class="flex items-center justify-between">
         <span class="text-white font-montserrat text-sm">Consumption Unit:</span>
         <div class="relative w-[180px]">
            <BaseSelect 
              v-model="config.meterUnit"
              :options="meterUnits"
              labelKey="label"
              valueKey="value"
              :disabled="isSaving"
            />
         </div>
      </div>

      <!-- Confirm Button -->
      <div class="flex justify-end pt-4">
        <button 
          @click="handleConfirm"
          :disabled="isSaving"
          class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors"
          :class="{'opacity-50 cursor-not-allowed': isSaving}"
        >
          {{ isSaving ? 'Saving...' : 'Confirm' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import ZoneService from '@/services/ZoneService'
import { dateFormats, flowUnits, pressureUnits, meterUnits } from '@/utils/UnitTypes'

const props = defineProps<{
  zoneId: number
}>()

const emit = defineEmits<{
  (e: 'next'): void
}>()

const isLoading = ref(true)
const isSaving = ref(false)

const config = reactive({
    dateFormat: 'dd/MM/yyyy',
    flowUnit: 'CUBIC_METER_PER_HOUR',
    pressureUnit: 'METER_PRESSURE',
    meterUnit: 'CUBIC_METER'
})

onMounted(async () => {
    if (!props.zoneId || isNaN(props.zoneId)) {
        isLoading.value = false
        return
    }
    
    try {
        const units = await ZoneService.getZoneUnits(props.zoneId)
        if (units.dateFormat) config.dateFormat = units.dateFormat
        if (units.flowUnit) config.flowUnit = units.flowUnit
        if (units.pressureUnit) config.pressureUnit = units.pressureUnit
        if (units.meterUnit) config.meterUnit = units.meterUnit
    } catch (e) {
        console.error('Failed to load zone units', e)
    } finally {
        isLoading.value = false
    }
})

const handleConfirm = async () => {
    if (isSaving.value) return
    if (!props.zoneId || isNaN(props.zoneId)) {
        emit('next')
        return
    }
    isSaving.value = true
    try {
        await ZoneService.updateZoneUnits({
            zoneId: props.zoneId,
            ...config
        })
        emit('next')
    } catch (e) {
        console.error('Failed to save configuration', e)
        alert('Failed to save configuration. Please try again.')
    } finally {
        isSaving.value = false
    }
}
</script>
