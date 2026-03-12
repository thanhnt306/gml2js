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
        class="ml-4 font-montserrat font-semibold text-lg flex-1 transition-colors duration-200"
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
        style="left: 16px; top: -5px; bottom: -10px;"
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
          <ImportFileItem ref="dropzoneRef" @update:files="onFilesUpdate" />
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
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-white font-montserrat font-normal text-[13px] transition-colors">
                Day Before Month:
              </span>
              <input
                type="checkbox"
                v-model="config.dayBeforeMonth"
                class="hidden"
              />
              <div
                class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                :class="config.dayBeforeMonth
                  ? 'bg-[#529B26] border-[#529B26]'
                  : 'bg-transparent border-[#529B26]'"
              >
                <svg v-if="config.dayBeforeMonth" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </label>
            <!-- Flow Unit (shown for Inlet and Sensor) -->
            <div v-if="showFlowUnit" class="flex items-center justify-between gap-3">
              <label class="text-white font-montserrat font-normal text-[13px] flex-shrink-0">Flow Unit:</label>
              <div class="w-[110px]">
                <BaseSelect
                  v-model="config.flowUnit"
                  :options="flowUnits.map(u => ({ label: u, value: u }))"
                  placeholder="Select Unit"
                />
              </div>
            </div>
            <!-- Pressure Unit (shown for Inlet and Sensor) -->
            <div v-if="showPressureUnit" class="flex items-center justify-between gap-3">
              <label class="text-white font-montserrat font-normal text-[13px] flex-shrink-0">Pressure Unit:</label>
              <div class="w-[110px]">
                <BaseSelect
                  v-model="config.pressureUnit"
                  :options="pressureUnits.map(u => ({ label: u, value: u }))"
                  placeholder="Select Unit"
                />
              </div>
            </div>
            <!-- Consumption Unit (shown for Consumption step) -->
            <div v-if="showConsumptionUnit" class="flex items-center justify-between gap-3">
              <label class="text-white font-montserrat font-normal text-[13px] flex-shrink-0">Consumption Unit:</label>
              <div class="w-[110px]">
                <BaseSelect
                  v-model="config.consumptionUnit"
                  :options="consumptionUnits.map(u => ({ label: u, value: u }))"
                  placeholder="Select Unit"
                />
              </div>
            </div>
            <!-- Time Interval -->
            <div class="flex items-center justify-between gap-3">
              <label class="text-white font-montserrat font-normal text-[13px] flex-shrink-0">Time Interval:</label>
              <div class="flex items-center gap-2">
                <div class="flex items-center border border-[#5D5D5D] rounded bg-transparent h-[34px] overflow-hidden focus-within:border-[#529B26] transition-colors">
                  <button
                    class="w-[28px] h-full text-[#A7A7A7] hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center font-montserrat text-lg font-light leading-none select-none"
                    @click="decrementInterval"
                  >&minus;</button>
                  <input 
                    type="text" 
                    :value="tempTimeText"
                    class="w-[40px] h-full bg-transparent text-white font-montserrat text-sm text-center border-none outline-none appearance-none hide-arrows"
                    @input="onTimeInput($event)"
                    @blur="validateTimeInterval"
                    @keydown.enter="validateTimeInterval"
                  />
                  <button
                    class="w-[28px] h-full text-[#A7A7A7] hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center font-montserrat text-lg font-light leading-none select-none"
                    @click="incrementInterval"
                  >&#43;</button>
                </div>
                <div class="w-[110px]">
                  <BaseSelect
                    v-model="config.timeUnit"
                    :options="timeUnits.map(u => ({ label: u, value: u }))"
                    placeholder="Select Unit"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- Add button -->
          <button
            class="mt-2 px-6 py-1.5 rounded-lg text-white font-montserrat font-semibold text-sm transition-colors duration-200
                   bg-[#529B26] hover:bg-[#6cc537] active:bg-[#4a8b22] disabled:opacity-50 self-start"
            :disabled="files.length === 0 || !isTimeValid"
            @click="$emit('upload', files)"
          >
            Add
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import ImportFileItem from '@/components/common/ImportFileItem.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

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
  defaultFlowUnit?: string
  defaultPressureUnit?: string
  defaultConsumptionUnit?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'generic',
  defaultOpen: false,
  isLastStep: false,
  defaultFlowUnit: 'm³/h',
  defaultPressureUnit: 'm',
  defaultConsumptionUnit: 'm³'
})

defineEmits<{
  upload: [files: FileData[]]
}>()

const isOpen = ref(props.defaultOpen)
const files = ref<FileData[]>([])
const dropzoneRef = ref<InstanceType<typeof ImportFileItem> | null>(null)

// Default data config local state
const config = reactive<StepConfig>({
  dayBeforeMonth: false,
  flowUnit: props.defaultFlowUnit,
  pressureUnit: props.defaultPressureUnit,
  consumptionUnit: props.defaultConsumptionUnit,
  timeInterval: 1,
  timeUnit: 'minutes'
})

// Validation Timer logic matching CustomSpinBox QML
const tempTimeText = ref('1')
const isTimeValid = ref(true)
let timeValidationTimer: number | null = null

const validateTimeInterval = () => {
  if (timeValidationTimer) {
    clearTimeout(timeValidationTimer)
    timeValidationTimer = null
  }
  
  // Parse numeric string ignoring any non-digit characters
  let newValue = parseInt(tempTimeText.value.replace(/\D/g, "")) || 0
  if (isNaN(newValue) || newValue < 1) {
    newValue = 1
  } else if (newValue > 1000) {
    newValue = 1000
  }
  
  config.timeInterval = newValue
  tempTimeText.value = newValue.toString()
  isTimeValid.value = true
}

const onTimeInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  // Remove non-numeric characters (allow numbers only for this field)
  const val = target.value.replace(/[^\d]/g, '')
  tempTimeText.value = val
  target.value = val // Force update DOM to show filtered value
  
  isTimeValid.value = false
  if (timeValidationTimer) {
    clearTimeout(timeValidationTimer)
  }
  timeValidationTimer = window.setTimeout(() => {
    validateTimeInterval()
  }, 800)
}

const decrementInterval = () => {
  let val = config.timeInterval - 1
  if (val < 1) val = 1
  config.timeInterval = val
  tempTimeText.value = val.toLocaleString()
  validateTimeInterval()
}

const incrementInterval = () => {
  let val = config.timeInterval + 1
  if (val > 1000) val = 1000
  config.timeInterval = val
  tempTimeText.value = val.toLocaleString()
  validateTimeInterval()
}

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
  tempTimeText.value = '1'
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
<style>
/* Global styles to hide arrows on numeric inputs without scoping issues */
.hide-arrows::-webkit-outer-spin-button,
.hide-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.hide-arrows[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
