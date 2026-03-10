<template>
  <!--
    A single import step card with an expand/collapse header,
    a file dropzone on the left and a config panel on the right.
  -->
  <div class="flex flex-col w-full">
    <!-- Step Header -->
    <button
      class="flex items-center cursor-pointer mb-4 tap-highlight-transparent w-full text-left"
      @click="isOpen = !isOpen"
    >
      <!-- Step number badge -->
      <div
        class="flex-none flex items-center justify-center rounded-full transition-colors duration-200"
        :class="isOpen ? 'bg-[#529B26]' : 'bg-[#A7A7A7]'"
        style="width: 32px; height: 32px;"
      >
        <span class="text-white font-montserrat font-bold text-sm">{{ number }}</span>
      </div>
      <!-- Label -->
      <span
        class="ml-4 font-montserrat font-semibold text-[15px] flex-1 transition-colors duration-200"
        :class="isOpen ? 'text-white' : 'text-[#A7A7A7]'"
      >
        {{ label }}
      </span>
      <!-- Chevron -->
      <svg
        class="w-4 h-4 text-[#A7A7A7] transition-transform duration-200 flex-shrink-0"
        :class="{ 'rotate-180': isOpen }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <!-- Content Area with connector line -->
    <div class="flex relative">
      <!-- Vertical Connector Line -->
      <div 
        v-if="!isLastStep"
        class="absolute bg-[#A7A7A7] w-[1px]"
        style="left: 16px; top: -10px; bottom: 0px;"
      ></div>

      <!-- Expand/collapse body -->
      <div 
        class="flex-1 transition-all duration-300 overflow-hidden"
        :style="{ 
            paddingLeft: '48px',
            maxHeight: isOpen ? '2000px' : '0px',
            opacity: isOpen ? 1 : 0,
            marginBottom: isOpen ? '24px' : '0px'
        }"
      >
        <div class="flex flex-col md:flex-row gap-6 pt-1">
        <!-- LEFT: File Dropzone -->
        <div class="flex flex-col gap-2 min-w-0 flex-1">
          <!-- Sub-step label 1 -->
          <div class="flex items-center gap-2 mb-1">
            <span class="w-6 h-6 rounded-full bg-[#529B26] flex items-center justify-center text-white font-montserrat font-medium text-[10px]">
              {{ number }}.1
            </span>
            <span class="text-white font-montserrat font-medium text-[13px]">Add {{ label.replace('Import ', '') }}s</span>
          </div>
          <ImportFileDropzone ref="dropzoneRef" @update:files="onFilesUpdate" />
          <!-- Add button -->
          <button
            class="mt-2 px-4 py-1.5 rounded-lg text-white font-montserrat font-semibold text-sm transition-colors duration-200
                   bg-[#529B26] hover:bg-[#6cc537] active:bg-[#4a8b22] disabled:opacity-50 self-start"
            :disabled="files.length === 0"
            @click="$emit('upload', files)"
          >
            Add
          </button>
        </div>

        <!-- RIGHT: Data Config Panel -->
        <div class="flex flex-col gap-2 min-w-0 flex-1">
          <!-- Sub-step label 2 -->
          <div class="flex items-center gap-2 mb-1">
            <span class="w-6 h-6 rounded-full bg-[#529B26] flex items-center justify-center text-white font-montserrat font-medium text-[10px]">
              {{ number }}.2
            </span>
            <span class="text-white font-montserrat font-medium text-[13px]">Data Config</span>
          </div>
          <!-- Config card -->
          <div class="bg-white/10 rounded-[10px] p-4 flex flex-col gap-3">
            <!-- Day Before Month -->
            <div class="flex items-center justify-between">
              <label class="text-white font-montserrat font-normal text-[13px]">Day Before Month:</label>
              <input
                type="checkbox"
                v-model="config.dayBeforeMonth"
                class="w-4 h-4 rounded accent-[#5DB22A] cursor-pointer"
              />
            </div>
            <!-- Flow Unit (shown for Inlet and Sensor) -->
            <div v-if="showFlowUnit" class="flex items-center justify-between gap-3">
              <label class="text-white font-montserrat font-normal text-[13px] flex-shrink-0">Flow Unit:</label>
              <select
                v-model="config.flowUnit"
                class="bg-[#2a2a2a] border border-[#5D5D5D] text-white font-montserrat text-xs rounded-lg px-2 py-1
                       focus:outline-none focus:border-[#5DB22A] cursor-pointer"
              >
                <option v-for="u in flowUnits" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
            <!-- Pressure Unit (shown for Inlet and Sensor) -->
            <div v-if="showPressureUnit" class="flex items-center justify-between gap-3">
              <label class="text-white font-montserrat font-normal text-[13px] flex-shrink-0">Pressure Unit:</label>
              <select
                v-model="config.pressureUnit"
                class="bg-[#2a2a2a] border border-[#5D5D5D] text-white font-montserrat text-xs rounded-lg px-2 py-1
                       focus:outline-none focus:border-[#5DB22A] cursor-pointer"
              >
                <option v-for="u in pressureUnits" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
            <!-- Consumption Unit (shown for Consumption step) -->
            <div v-if="showConsumptionUnit" class="flex items-center justify-between gap-3">
              <label class="text-white font-montserrat font-normal text-[13px] flex-shrink-0">Consumption Unit:</label>
              <select
                v-model="config.consumptionUnit"
                class="bg-[#2a2a2a] border border-[#5D5D5D] text-white font-montserrat text-xs rounded-lg px-2 py-1
                       focus:outline-none focus:border-[#5DB22A] cursor-pointer"
              >
                <option v-for="u in consumptionUnits" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
            <!-- Time Interval -->
            <div class="flex items-center justify-between gap-3">
              <label class="text-white font-montserrat font-normal text-[13px] flex-shrink-0">Time Interval:</label>
              <div class="flex items-center gap-2">
                <div class="flex items-center border border-[#5D5D5D] rounded-lg overflow-hidden">
                  <button
                    class="px-2 py-1 text-[#A7A7A7] hover:bg-white/10 transition-colors text-sm font-montserrat"
                    @click="decrementInterval"
                  >−</button>
                  <span class="px-3 text-white font-montserrat text-xs min-w-[2rem] text-center">{{ config.timeInterval }}</span>
                  <button
                    class="px-2 py-1 text-[#A7A7A7] hover:bg-white/10 transition-colors text-sm font-montserrat"
                    @click="config.timeInterval++"
                  >+</button>
                </div>
                <select
                  v-model="config.timeUnit"
                  class="bg-[#2a2a2a] border border-[#5D5D5D] text-white font-montserrat text-xs rounded-lg px-2 py-1
                         focus:outline-none focus:border-[#5DB22A] cursor-pointer"
                >
                  <option v-for="u in timeUnits" :key="u" :value="u">{{ u }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import ImportFileDropzone from './ImportFileDropzone.vue'

interface FileData {
  name: string
  size: number
  file: File
}

interface StepConfig {
  dayBeforeMonth: boolean
  flowUnit: string
  pressureUnit: string
  consumptionUnit: string
  timeInterval: number
  timeUnit: string
}

type StepType = 'inlet' | 'consumption' | 'sensor' | 'valve' | 'generic'

interface Props {
  number: string | number
  label: string
  type?: StepType
  defaultOpen?: boolean
  isLastStep?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'generic',
  defaultOpen: false,
  isLastStep: false
})

defineEmits<{
  upload: [files: FileData[]]
}>()

const isOpen = ref(props.defaultOpen)
const files = ref<FileData[]>([])
const dropzoneRef = ref<InstanceType<typeof ImportFileDropzone> | null>(null)

const decrementInterval = (): void => {
  if (config.timeInterval > 1) config.timeInterval--
}

const config = reactive<StepConfig>({
  dayBeforeMonth: false,
  flowUnit: 'm³/h',
  pressureUnit: 'm',
  consumptionUnit: 'm³',
  timeInterval: 1,
  timeUnit: 'minutes'
})

const showFlowUnit = computed(() => props.type === 'inlet' || props.type === 'sensor')
const showPressureUnit = computed(() => props.type === 'inlet' || props.type === 'sensor')
const showConsumptionUnit = computed(() => props.type === 'consumption')

const flowUnits = ['m³/h', 'm³/s', 'L/h', 'L/m', 'L/s', 'ft³/h', 'ft³/s', 'gal/h', 'gal/s', 'kg/h', 'kg/s']
const pressureUnits = ['m', 'ft', 'Pa', 'kPa', 'bar', 'psi']
const consumptionUnits = ['m³', 'L', 'in³', 'ft³', 'gal']
const timeUnits = ['minutes', 'hours', 'days', 'months', 'years']

const onFilesUpdate = (updatedFiles: FileData[]): void => {
  files.value = updatedFiles
}

const reset = (): void => {
  Object.assign(config, {
    dayBeforeMonth: false,
    flowUnit: 'm³/h',
    pressureUnit: 'm',
    consumptionUnit: 'm³',
    timeInterval: 1,
    timeUnit: 'minutes'
  })
  files.value = []
  dropzoneRef.value?.clear()
}

defineExpose({ reset })
</script>

<style scoped>
.tap-highlight-transparent {
    -webkit-tap-highlight-color: transparent;
}
</style>
