<template>
  <BaseFilterDropdown
    v-model="isOpen"
    title="Filters"
    label="Filter"
  >
    <template #headerExtra>
      <button @click="$emit('clear')" class="text-[#529B26] font-inter text-xs hover:text-[#6cc537] transition-colors">Clear All</button>
    </template>

    <!-- Detection Status -->
    <div class="flex flex-col gap-2">
      <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold">Detection Status</p>
      <div class="flex flex-col gap-1.5">
        <BaseFilterCheckbox
          v-for="opt in detectionStatusOptions"
          :key="opt.value"
          :modelValue="internalFilters.detectionStatus.includes(opt.value)"
          @update:modelValue="(val: boolean) => handleFilterUpdate('detectionStatus', opt.value, val)"
        >
          <span class="font-inter text-xs" :class="opt.color">{{ opt.label }}</span>
        </BaseFilterCheckbox>
      </div>
    </div>

    <!-- Repaired Status -->
    <div class="flex flex-col gap-2">
      <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold">Repaired Status</p>
      <div class="flex flex-col gap-1.5">
        <BaseFilterCheckbox
          v-for="opt in repairedStatusOptions"
          :key="opt"
          :modelValue="internalFilters.repairedStatus.includes(opt)"
          @update:modelValue="(val: boolean) => handleFilterUpdate('repairedStatus', opt, val)"
          :label="opt"
        />
      </div>
    </div>

    <!-- System Anomaly Type -->
    <div class="flex flex-col gap-2">
      <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold">System Anomaly Type</p>
      <div class="flex flex-col gap-1.5">
        <BaseFilterCheckbox
          v-for="opt in systemAnomalyTypeOptions"
          :key="opt"
          :modelValue="internalFilters.systemAnomalyType.includes(opt)"
          @update:modelValue="(val: boolean) => handleFilterUpdate('systemAnomalyType', opt, val)"
          :label="opt"
        />
      </div>
    </div>

    <!-- Anomaly Type -->
    <div class="flex flex-col gap-2">
      <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold">Anomaly Type</p>
      <div class="flex flex-col gap-1.5">
        <BaseFilterCheckbox
          v-for="opt in anomalyTypeOptions"
          :key="opt"
          :modelValue="internalFilters.anomalyType.includes(opt)"
          @update:modelValue="(val: boolean) => handleFilterUpdate('anomalyType', opt, val)"
          :label="opt"
        />
      </div>
    </div>

    <!-- Volume -->
    <div class="flex flex-col gap-2">
      <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold">Volume</p>
      <div class="flex flex-col gap-1.5">
        <BaseFilterCheckbox
          v-for="opt in volumeOptions"
          :key="opt"
          :modelValue="internalFilters.volume.includes(opt)"
          @update:modelValue="(val: boolean) => handleFilterUpdate('volume', opt, val)"
          :label="opt"
        />
      </div>
    </div>

    <!-- Confidence Level -->
    <div class="flex flex-col gap-2">
      <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold">Confidence Level</p>
      <div class="flex flex-col gap-1.5">
        <BaseFilterRadio
          v-for="opt in confidenceOptions"
          :key="opt.value"
          :modelValue="internalFilters.confidenceLevel"
          :value="opt.value"
          @update:modelValue="(val: number) => handleRadioUpdate('confidenceLevel', val)"
          :label="opt.label"
        />
      </div>
    </div>

    <!-- Network Type -->
    <div class="flex flex-col gap-2">
      <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold">Network Type</p>
      <div class="flex flex-col gap-1.5">
        <BaseFilterCheckbox
          v-for="opt in networkTypeOptions"
          :key="opt"
          :modelValue="internalFilters.networkType.includes(opt)"
          @update:modelValue="(val: boolean) => handleFilterUpdate('networkType', opt, val)"
          :label="opt"
        />
      </div>
    </div>

    <!-- Pipe Specifc (Nested) -->
    <template v-if="internalFilters.networkType.includes('Pipe')">
       <div class="pl-2 border-l-2 border-[#3a3a3a] flex flex-col gap-5 mt-2">
          <!-- Length -->
          <div class="flex flex-col gap-2">
            <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold">Length</p>
            <div class="flex flex-col gap-1.5">
              <BaseFilterCheckbox
                v-for="opt in lengthOptions"
                :key="opt"
                :modelValue="internalFilters.length.includes(opt)"
                @update:modelValue="(val: boolean) => handleFilterUpdate('length', opt, val)"
                :label="opt"
              />
            </div>
          </div>
          <!-- Diameter -->
          <div class="flex flex-col gap-2">
            <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold">Diameter</p>
            <div class="flex flex-col gap-1.5">
              <BaseFilterCheckbox
                v-for="opt in diameterOptions"
                :key="opt"
                :modelValue="internalFilters.diameter.includes(opt)"
                @update:modelValue="(val: boolean) => handleFilterUpdate('diameter', opt, val)"
                :label="opt"
              />
            </div>
          </div>
          <!-- Material -->
          <div class="flex flex-col gap-2">
            <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold">Material</p>
            <div class="flex flex-col gap-1.5">
              <BaseFilterCheckbox
                v-for="opt in materialOptions"
                :key="opt"
                :modelValue="internalFilters.material.includes(opt)"
                @update:modelValue="(val: boolean) => handleFilterUpdate('material', opt, val)"
                :label="opt"
              />
            </div>
          </div>
       </div>
    </template>

    <template #footer="{ close }">
      <button @click="close" class="w-full text-center bg-white/5 hover:bg-white/10 text-[#529B26] py-1.5 rounded transition-colors text-xs font-montserrat font-semibold">
        Close
      </button>
    </template>
  </BaseFilterDropdown>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseFilterDropdown from '@/components/common/BaseFilterDropdown.vue'
import BaseFilterCheckbox from '@/components/common/BaseFilterCheckbox.vue'
import BaseFilterRadio from '@/components/common/BaseFilterRadio.vue'

interface Filters {
  detectionStatus: string[]
  systemAnomalyType: string[]
  repairedStatus: string[]
  anomalyType: string[]
  volume: string[]
  networkType: string[]
  confidenceLevel: number | null
  length: string[]
  diameter: string[]
  material: string[]
}

const props = defineProps<{
  modelValue: Filters
  detectionStatusOptions: any[]
  repairedStatusOptions: string[]
  systemAnomalyTypeOptions: string[]
  anomalyTypeOptions: string[]
  volumeOptions: string[]
  confidenceOptions: any[]
  networkTypeOptions: string[]
  lengthOptions: string[]
  diameterOptions: string[]
  materialOptions: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Filters): void
  (e: 'clear'): void
}>()

const isOpen = ref(false)

const internalFilters = computed(() => ({ ...props.modelValue }))

const handleFilterUpdate = (key: keyof Filters, value: any, checked: boolean) => {
  const current = [...(internalFilters.value[key] as any[])]
  if (checked) {
    if (!current.includes(value)) current.push(value)
  } else {
    const idx = current.indexOf(value)
    if (idx !== -1) current.splice(idx, 1)
  }
  
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: current
  })
}

const handleRadioUpdate = (key: keyof Filters, value: any) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>
