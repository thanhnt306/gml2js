<template>
  <div class="w-full">
    <!-- Two-column layout: Step 1 + Step 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      <!-- ======= STEP 1: Target Analysis ======= -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-[#529B26] flex items-center justify-center font-montserrat font-semibold text-white text-sm flex-shrink-0">
            1
          </span>
          <h3 class="text-white font-montserrat font-semibold text-[15px]">Target Analysis</h3>
        </div>

        <div class="bg-white/10 rounded-[10px] p-5 flex flex-col gap-1">
          <!-- Hydraulics Analysis -->
          <label class="flex items-center justify-between py-2 cursor-pointer">
            <span class="text-white font-montserrat font-normal text-sm transition-colors">
              Hydraulics Analysis:
            </span>
            <input
              type="checkbox"
              v-model="targets.hydraulics"
              class="hidden"
            />
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
              :class="targets.hydraulics
                ? 'bg-[#529B26] border-[#529B26]'
                : 'bg-transparent border-[#529B26]'"
            >
              <svg v-if="targets.hydraulics" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </label>
          <div class="h-px bg-white/5"/>

          <!-- Leak Detection -->
          <label class="flex items-center justify-between py-2 cursor-pointer">
            <span class="text-white font-montserrat font-normal text-sm transition-colors">
              Leak Detection:
            </span>
            <input type="checkbox" v-model="targets.leakDetection" class="hidden"/>
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
              :class="targets.leakDetection
                ? 'bg-[#529B26] border-[#529B26]'
                : 'bg-transparent border-[#529B26]'"
            >
              <svg v-if="targets.leakDetection" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </label>
          <div class="h-px bg-white/5"/>

          <!-- Meter Anomalies -->
          <label class="flex items-center justify-between py-2 cursor-pointer">
            <span class="text-white font-montserrat font-normal text-sm transition-colors">
              Meter Anomalies:
            </span>
            <input type="checkbox" v-model="targets.meterAnomalies" class="hidden"/>
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
              :class="targets.meterAnomalies
                ? 'bg-[#529B26] border-[#529B26]'
                : 'bg-transparent border-[#529B26]'"
            >
              <svg v-if="targets.meterAnomalies" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </label>
        </div>
      </div>

      <!-- ======= STEP 2: Configuration ======= -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-[#529B26] flex items-center justify-center font-montserrat font-semibold text-white text-sm flex-shrink-0">
            2
          </span>
          <h3 class="text-white font-montserrat font-semibold text-[15px]">Configuration</h3>
        </div>

        <div class="bg-white/10 rounded-[10px] p-5 flex flex-col gap-1">
          <!-- High Performance Computing -->
          <label class="flex items-center justify-between py-2 cursor-pointer group">
            <span class="text-white font-montserrat font-normal text-sm group-hover:text-[#5DB22A] transition-colors">
              High Performance Computing:
            </span>
            <!-- Toggle switch -->
            <button
              type="button"
              class="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent
                     transition-colors duration-200 focus:outline-none"
              :class="config.highPerformance ? 'bg-[#529B26]' : 'bg-[#5D5D5D]'"
              @click="config.highPerformance = !config.highPerformance"
              :aria-checked="config.highPerformance"
              role="switch"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200"
                :class="config.highPerformance ? 'translate-x-4' : 'translate-x-0'"
              />
            </button>
          </label>
          <div class="h-px bg-white/5"/>

          <!-- Resource Usage -->
          <div class="flex items-center justify-between py-2">
            <span class="text-white font-montserrat font-normal text-sm">Resource Usage:</span>
            <div class="w-[150px]">
              <BaseSelect 
                v-model="config.resourceUsage"
                :options="resourceOptions"
              />
            </div>
          </div>
          <div class="h-px bg-white/5"/>

          <!-- Start Date -->
          <div class="flex items-center justify-between py-2">
            <span class="text-white font-montserrat font-normal text-sm">Start Date:</span>
            <div class="w-[150px]">
              <BaseDatePicker
                v-model="config.startDate"
              />
            </div>
          </div>
          <div class="h-px bg-white/5"/>

          <!-- End Date -->
          <div class="flex items-center justify-between py-2">
            <span class="text-white font-montserrat font-normal text-sm">End Date:</span>
            <div class="w-[150px]">
              <BaseDatePicker
                v-model="config.endDate"
              />
            </div>
          </div>
        </div>

        <!-- Analyze button (bottom-right of config card) -->
        <div class="flex justify-end">
          <button
            @click="handleAnalyze"
            :disabled="isAnalyzing || !hasTargetSelected"
            class="px-6 py-2 rounded-lg font-montserrat font-semibold text-sm text-white transition-all duration-200
                   bg-[#529B26] hover:bg-[#6cc537] active:bg-[#4a8b22]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2"
          >
            <svg v-if="isAnalyzing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ isAnalyzing ? 'Analyzing...' : 'Analyze' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Validation message -->
    <Transition name="fade">
      <div
        v-if="validationMsg"
        class="mt-4 px-4 py-2 rounded-lg text-sm font-inter flex items-center gap-2"
        :class="validationMsg.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-[#5DB22A]/20 text-[#5DB22A]'"
      >
        <svg v-if="validationMsg.type === 'error'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <svg v-else class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        {{ validationMsg.text }}
      </div>
    </Transition>

    <!-- Progress bar (shown while analyzing) -->
    <Transition name="fade">
      <div v-if="isAnalyzing" class="mt-4 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[#A7A7A7] font-inter text-xs">Analysis in progress...</span>
          <span class="text-[#5DB22A] font-montserrat text-xs font-semibold">{{ progress }}%</span>
        </div>
        <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#529B26] rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <button
          @click="cancelAnalysis"
          class="text-xs font-inter text-[#A7A7A7] hover:text-red-400 transition-colors self-end"
        >
          Cancel
        </button>
      </div>
    </Transition>

    <!-- Action footer -->
    <div class="flex justify-end mt-6 pt-4 border-t border-[#2a2a2a]">
      <button
        @click="clearAll"
        class="px-5 py-2 rounded-lg font-montserrat font-semibold text-sm text-[#A7A7A7] border border-[#5D5D5D]
               hover:text-white hover:border-white transition-colors duration-200"
      >
        Clear All
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseDatePicker from '@/components/common/BaseDatePicker.vue'

interface AnalysisTargets {
  hydraulics: boolean
  leakDetection: boolean
  meterAnomalies: boolean
}

interface AnalysisConfig {
  highPerformance: boolean
  resourceUsage: string
  startDate: string
  endDate: string
}

interface ValidationMsg {
  type: 'error' | 'success'
  text: string
}

const today = new Date().toISOString().split('T')[0]

const targets = reactive<AnalysisTargets>({
  hydraulics: false,
  leakDetection: false,
  meterAnomalies: false
})

const config = reactive<AnalysisConfig>({
  highPerformance: false,
  resourceUsage: 'Default',
  startDate: today,
  endDate: today
})

const resourceOptions = ['Default', 'High', 'Medium', 'Low']

const isAnalyzing = ref(false)
const progress = ref(0)
const validationMsg = ref<ValidationMsg | null>(null)

let progressTimer: ReturnType<typeof setInterval> | null = null
let msgTimer: ReturnType<typeof setTimeout> | null = null

const hasTargetSelected = computed(
  () => targets.hydraulics || targets.leakDetection || targets.meterAnomalies
)

const showMsg = (type: 'error' | 'success', text: string): void => {
  validationMsg.value = { type, text }
  if (msgTimer) clearTimeout(msgTimer)
  msgTimer = setTimeout(() => { validationMsg.value = null }, 4000)
}

const handleAnalyze = (): void => {
  if (!hasTargetSelected.value) {
    showMsg('error', 'Please select at least one analysis target.')
    return
  }
  if (config.startDate > config.endDate) {
    showMsg('error', 'Start date cannot be after end date.')
    return
  }

  validationMsg.value = null
  isAnalyzing.value = true
  progress.value = 0

  // TODO: call backend API with targets & config
  console.log('Starting analysis:', { targets: { ...targets }, config: { ...config } })

  // Simulate progress (replace with real API integration)
  progressTimer = setInterval(() => {
    if (progress.value >= 100) {
      stopAnalysis(true)
    } else {
      progress.value = Math.min(progress.value + Math.random() * 8, 100)
    }
  }, 400)
}

const stopAnalysis = (success: boolean): void => {
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null }
  isAnalyzing.value = false
  progress.value = 0
  if (success) showMsg('success', 'Analysis completed successfully.')
}

const cancelAnalysis = (): void => {
  stopAnalysis(false)
  showMsg('error', 'Analysis was cancelled.')
}

const clearAll = (): void => {
  Object.assign(targets, { hydraulics: false, leakDetection: false, meterAnomalies: false })
  Object.assign(config, { highPerformance: false, resourceUsage: 'Default', startDate: today, endDate: today })
  validationMsg.value = null
  if (isAnalyzing.value) cancelAnalysis()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
