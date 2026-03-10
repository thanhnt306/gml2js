<template>
  <div class="w-full flex flex-col">
    <!-- Page Tab Bar (top-right aligned) -->
    <div class="flex justify-end mb-3">
      <div class="flex gap-1 bg-transparent">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activePage = tab.id"
          class="px-4 py-1.5 rounded font-montserrat font-semibold text-xs transition-colors duration-200"
          :class="activePage === tab.id
            ? 'bg-white/10 text-white'
            : 'text-[#A7A7A7] hover:text-white hover:bg-white/5'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Content Panel -->
    <div class="bg-white/10 rounded-[6px] p-6 flex-1">

      <!-- ============ PAGE 1: Required Data ============ -->
      <div v-show="activePage === 'page1'">
        <h2 class="text-[#5DB22A] font-montserrat font-semibold text-xl mb-1">Upload your Operational Data</h2>
        <p class="text-[#A7A7A7] font-inter font-light text-xs mb-6 leading-relaxed">
          Follow the 3 steps below to import your data. Please ensure your data is accurate and properly formatted.
        </p>

        <div class="flex flex-col mt-4">
          <!-- Step 1: Inlet -->
          <DataImportStep
            ref="inletStepRef"
            number="1"
            label="Import Inlet Data"
            type="inlet"
            :defaultOpen="true"
            @upload="handleUpload('inlet', $event)"
          />

          <!-- Step 2: Consumption -->
          <DataImportStep
            ref="consumptionStepRef"
            number="2"
            label="Import Consumption Data"
            type="consumption"
            @upload="handleUpload('consumption', $event)"
          />

          <!-- Step 3: Sensor -->
          <DataImportStep
            ref="sensorStepRef"
            number="3"
            label="Import Sensor Data"
            type="sensor"
            :isLastStep="true"
            @upload="handleUpload('sensor', $event)"
          />
        </div>

        <!-- Action bar (bottom) -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-[#2a2a2a]">
          <button
            @click="clearAll"
            class="px-5 py-2 rounded-lg font-montserrat font-semibold text-sm text-[#A7A7A7] border border-[#5D5D5D]
                   hover:text-white hover:border-white transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>

      <!-- ============ PAGE 2: Optional Data ============ -->
      <div v-show="activePage === 'page2'">
        <h2 class="text-[#5DB22A] font-montserrat font-semibold text-xl mb-1">Upload your Operational Data</h2>
        <p class="text-[#A7A7A7] font-inter font-light text-xs mb-6 leading-relaxed">
          These files are optional but improve the accuracy of the analysis.
        </p>

        <div class="flex flex-col mt-4">
          <!-- Step 5: Valve -->
          <DataImportStep
            ref="valveStepRef"
            number="5"
            label="Import Valve Data"
            type="generic"
            :defaultOpen="true"
            @upload="handleUpload('valve', $event)"
          />

          <!-- Step 6: Pump -->
          <DataImportStep
            ref="pumpStepRef"
            number="6"
            label="Import Pump Data"
            type="generic"
            @upload="handleUpload('pump', $event)"
          />

          <!-- Step 7: Tank -->
          <DataImportStep
            ref="tankStepRef"
            number="7"
            label="Import Tank Data"
            type="generic"
            @upload="handleUpload('tank', $event)"
          />

          <!-- Step 8: Reservoir -->
          <DataImportStep
            ref="reservoirStepRef"
            number="8"
            label="Import Reservoir Data"
            type="generic"
            :isLastStep="true"
            @upload="handleUpload('reservoir', $event)"
          />
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-[#2a2a2a]">
          <button
            @click="clearAll"
            class="px-5 py-2 rounded-lg font-montserrat font-semibold text-sm text-[#A7A7A7] border border-[#5D5D5D]
                   hover:text-white hover:border-white transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>

      <!-- ============ PAGE 3: Other Data ============ -->
      <div v-show="activePage === 'page3'">
        <h2 class="text-[#5DB22A] font-montserrat font-semibold text-xl mb-1">Upload your Operational Data</h2>
        <p class="text-[#A7A7A7] font-inter font-light text-xs mb-6 leading-relaxed">
          Additional supplementary data to enhance system modelling precision.
        </p>

        <div class="flex flex-col mt-4">
          <!-- Step 9: Control Statement -->
          <DataImportStep
            ref="controlStepRef"
            number="9"
            label="Import Control Statement Data"
            type="generic"
            :defaultOpen="true"
            @upload="handleUpload('control', $event)"
          />

          <!-- Step 10: Leak History -->
          <DataImportStep
            ref="leakHistoryStepRef"
            number="10"
            label="Import Leak History Data"
            type="generic"
            :isLastStep="true"
            @upload="handleUpload('leakHistory', $event)"
          />
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-[#2a2a2a]">
          <button
            @click="clearAll"
            class="px-5 py-2 rounded-lg font-montserrat font-semibold text-sm text-[#A7A7A7] border border-[#5D5D5D]
                   hover:text-white hover:border-white transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>

    <!-- Upload status toasts -->
    <Transition name="fade">
      <div
        v-if="uploadStatus"
        class="mt-3 px-4 py-2 rounded-lg text-sm font-inter flex items-center gap-2"
        :class="uploadStatus.type === 'success' ? 'bg-[#5DB22A]/20 text-[#5DB22A]' : 'bg-red-500/20 text-red-400'"
      >
        <svg v-if="uploadStatus.type === 'success'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        {{ uploadStatus.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataImportStep from './DataImportStep.vue'

interface FileData {
  name: string
  size: number
  file: File
}

interface UploadStatus {
  type: 'success' | 'error'
  message: string
}

type DataCategory = 'inlet' | 'consumption' | 'sensor' | 'valve' | 'pump' | 'tank' | 'reservoir' | 'control' | 'leakHistory'

interface Tab {
  id: string
  label: string
}

const tabs: Tab[] = [
  { id: 'page1', label: 'Required Data' },
  { id: 'page2', label: 'Optional Data' },
  { id: 'page3', label: 'Other Data' }
]

const activePage = ref('page1')

const inletStepRef = ref<InstanceType<typeof DataImportStep> | null>(null)
const consumptionStepRef = ref<InstanceType<typeof DataImportStep> | null>(null)
const sensorStepRef = ref<InstanceType<typeof DataImportStep> | null>(null)
const valveStepRef = ref<InstanceType<typeof DataImportStep> | null>(null)
const pumpStepRef = ref<InstanceType<typeof DataImportStep> | null>(null)
const tankStepRef = ref<InstanceType<typeof DataImportStep> | null>(null)
const reservoirStepRef = ref<InstanceType<typeof DataImportStep> | null>(null)
const controlStepRef = ref<InstanceType<typeof DataImportStep> | null>(null)
const leakHistoryStepRef = ref<InstanceType<typeof DataImportStep> | null>(null)

const uploadStatus = ref<UploadStatus | null>(null)

let statusTimer: ReturnType<typeof setTimeout> | null = null

const showStatus = (type: 'success' | 'error', message: string): void => {
  uploadStatus.value = { type, message }
  if (statusTimer) clearTimeout(statusTimer)
  statusTimer = setTimeout(() => {
    uploadStatus.value = null
  }, 4000)
}

const handleUpload = (category: DataCategory, files: FileData[]): void => {
  if (files.length === 0) {
    showStatus('error', `Please add at least one ${category} file before uploading.`)
    return
  }
  // TODO: Call API with files
  console.log(`Uploading ${category} files:`, files.map(f => f.name))
  showStatus('success', `${files.length} ${category} file(s) queued for upload.`)
}

const clearAll = (): void => {
  inletStepRef.value?.reset()
  consumptionStepRef.value?.reset()
  sensorStepRef.value?.reset()
  valveStepRef.value?.reset()
  pumpStepRef.value?.reset()
  tankStepRef.value?.reset()
  reservoirStepRef.value?.reset()
  controlStepRef.value?.reset()
  leakHistoryStepRef.value?.reset()
  uploadStatus.value = null
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
