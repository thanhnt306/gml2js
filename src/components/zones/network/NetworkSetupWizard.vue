<template>
  <div class="flex flex-col w-full h-full relative">

    <!-- ===== PANEL 0: Steps Wizard ===== -->
    <div v-show="currentView === 'steps'" class="flex flex-col w-full h-full">
      <!-- Intro Text -->
      <div class="mb-8 pl-4">
        <h2 class="text-[#529B26] font-montserrat font-semibold text-2xl mb-2">Get started</h2>
        <p class="text-[#A7A7A7] font-inter font-light text-sm max-w-[600px]">
          Follow the 4 steps below to configure your network. Please ensure your data is complete and accurate.
        </p>
      </div>

      <!-- Steps Container -->
      <div ref="stepsContainer" class="flex-1 overflow-y-auto custom-scrollbar pr-4 relative">
        <div class="flex flex-col space-y-6 pl-4">

          <!-- Step 1: Display Configuration -->
          <StepItem
            label="Display Configuration"
            number="1"
            :isExpanded="currentStep === 1"
            @toggle="toggleStep(1)"
          >
            <DisplayConfiguration :zoneId="Number(props.zoneId)" @next="goToStep(2)" />
          </StepItem>

          <!-- Step 2: Add Network Files -->
          <StepItem
            label="Add Network Files"
            number="2"
            :isExpanded="currentStep === 2"
            @toggle="toggleStep(2)"
          >
              <AddNetworkFiles :zoneId="props.zoneId" @next="handleFilesSubmitted" @start-task="startPolling" />
          </StepItem>

          <!-- Step 3: Choose Inlet Node (disabled until processing completes) -->
          <StepItem
            ref="step3Ref"
            label="Choose Inlet Node"
            number="3"
            :isExpanded="currentStep === 3"
            :disabled="!isStep3Enabled"
            @toggle="toggleStep(3)"
          >
            <ChooseInletNode
              ref="chooseInletRef"
              :networkData="networkData"
              :isLoading="isProcessing"
              :isActive="showBlockingOverlay"
              @done="handleInletDone"
            />
          </StepItem>

          <!-- Step 4: Overview and Edit -->
          <StepItem
            label="Overview and Edit network data"
            number="4"
            :isExpanded="false"
            :isLastStep="true"
            @toggle="goToOverview"
          />

        </div>
      </div>
    </div>

    <!-- ===== PANEL 1: Overview & Edit ===== -->
    <div v-show="currentView === 'overview'" class="flex flex-col w-full h-full">
      <div class="flex items-center gap-3 mb-6 pl-4">
        <span class="w-9 h-9 rounded-full bg-[#529B26] flex items-center justify-center font-montserrat font-bold text-white text-sm flex-shrink-0">
          4
        </span>
        <h2 class="text-white font-montserrat font-semibold text-lg flex-1">
          General review and Edit network data
        </h2>
        <div class="flex items-center gap-3">
          <button
            @click="currentView = 'steps'"
            class="px-5 py-1.5 rounded font-montserrat font-semibold text-sm text-white bg-[#6A6A6A] hover:bg-[#808080] transition-colors"
          >
            Back to previous steps
          </button>
          <button
            @click="handleFinish"
            class="px-5 py-1.5 rounded font-montserrat font-semibold text-sm text-white bg-[#529B26] hover:bg-[#6cc537] transition-colors"
          >
            Finish
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <OverviewEditNetwork
          :gis-rows="networkData_ref ? toGisRows(networkData_ref.issues) : undefined"
          :link-rows="networkData_ref ? toLinkRows(networkData_ref.pipes) : undefined"
          :node-rows="networkData_ref ? toNodeRows(networkData_ref.nodes) : undefined"
        />
      </div>
    </div>

    <!-- ===== BLOCKING OVERLAY — box-shadow spotlight with rounded cutout ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showBlockingOverlay" class="fixed inset-0 z-40 pointer-events-none">

          <!-- Visual: single div using box-shadow to cast dark overlay.
               border-radius matches ChooseInletNode so corners are naturally curved.
               pointer-events: none so map remains fully clickable. -->
          <div
            class="absolute pointer-events-none"
            :style="{
              top: cutout.top + 'px',
              left: cutout.left + 'px',
              width: cutout.width + 'px',
              height: cutout.height + 'px',
              borderRadius: '15px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
            }"
          ></div>

          <!-- Click-blocking: 4 invisible panels that capture pointer events
               on the dark surrounding area (corners are the tiny gap zones,
               clicks there fall through harmlessly to the page behind). -->
          <div class="absolute top-0 left-0 right-0 pointer-events-auto"
               :style="{ height: cutout.top + 'px' }"></div>
          <div class="absolute left-0 right-0 bottom-0 pointer-events-auto"
               :style="{ top: (cutout.top + cutout.height) + 'px' }"></div>
          <div class="absolute left-0 pointer-events-auto"
               :style="{ top: cutout.top + 'px', height: cutout.height + 'px', width: cutout.left + 'px' }"></div>
          <div class="absolute right-0 pointer-events-auto"
               :style="{ top: cutout.top + 'px', height: cutout.height + 'px', left: (cutout.left + cutout.width) + 'px' }"></div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== PROGRESS DIALOG ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showProgressDialog"
          class="fixed inset-0 z-[60] flex items-center justify-center"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative bg-[#1e1e1e] border border-white/10 rounded-xl p-8 shadow-2xl text-center max-w-sm w-full mx-4">
            <h3 class="text-white font-montserrat font-semibold text-lg mb-4">Processing Network</h3>
            
            <!-- Progress Bar -->
            <div class="w-full h-2 bg-[#333] rounded-full overflow-hidden mb-4">
              <div 
                class="h-full bg-[#529B26] transition-all duration-300 ease-out"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
            
            <div class="flex justify-between items-center mb-2">
              <span class="text-[#A7A7A7] font-inter text-sm">{{ progressMessage }}</span>
              <span class="text-white font-montserrat font-semibold text-sm">{{ Math.round(progressPercent) }}%</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onBeforeUnmount } from 'vue'
import StepItem from './StepItem.vue'
import DisplayConfiguration from './steps/DisplayConfiguration.vue'
import AddNetworkFiles from './steps/AddNetworkFiles.vue'
import ChooseInletNode from './steps/ChooseInletNode.vue'
import OverviewEditNetwork from './steps/OverviewEditNetwork.vue'
import type { NetworkGraphData } from '@/services/NetworkGraphService'
import { toGisRows, toLinkRows, toNodeRows } from '@/services/NetworkGraphService'
import ZoneService from '@/services/ZoneService'
import { useNetworkStore } from '@/stores/network'

const networkStore = useNetworkStore()

const props = defineProps<{
  zoneId?: string
}>()

const emit = defineEmits<{
  finish: []
}>()

const currentView = ref<'steps' | 'overview'>('steps')
const currentStep = ref(1)

// Network data state
const networkData_ref = ref<NetworkGraphData | null>(null)
const networkData = networkData_ref  // alias used in template
const isProcessing = ref(false)
const isStep3Enabled = ref(false)
const isStep3Completed = ref(false)
const showBlockingOverlay = ref(false)
const showProgressDialog = ref(false)

// Refs
const stepsContainer = ref<HTMLElement | null>(null)
const step3Ref = ref<InstanceType<typeof StepItem> | null>(null)
const chooseInletRef = ref<InstanceType<typeof ChooseInletNode> | null>(null)

// Cutout rect for the blocking overlay hole
const cutout = reactive({ top: 0, left: 0, width: 0, height: 0 })

// Update cutout position — use the root element of ChooseInletNode
// so the border/glow aligns with its outer rounded border
function updateCutoutRect() {
  const el = chooseInletRef.value?.$el as HTMLElement | undefined
  if (!el) return

  const rect = el.getBoundingClientRect()
  cutout.top = rect.top
  cutout.left = rect.left
  cutout.width = rect.width
  cutout.height = rect.height
}

// ResizeObserver for dynamic updates
let resizeObserver: ResizeObserver | null = null

function startObservingCutout() {
  updateCutoutRect()

  // Observe resize on root element of ChooseInletNode
  const el = chooseInletRef.value?.$el as HTMLElement | undefined
  if (el) {
    resizeObserver = new ResizeObserver(() => updateCutoutRect())
    resizeObserver.observe(el)
  }

  // Also update on scroll and window resize
  stepsContainer.value?.addEventListener('scroll', updateCutoutRect)
  window.addEventListener('resize', updateCutoutRect)
}

function stopObservingCutout() {
  resizeObserver?.disconnect()
  resizeObserver = null
  stepsContainer.value?.removeEventListener('scroll', updateCutoutRect)
  window.removeEventListener('resize', updateCutoutRect)
}

onBeforeUnmount(() => {
  stopObservingCutout()
})

const toggleStep = (step: number) => {
  if (step === 3 && !isStep3Enabled.value) return

  if (currentStep.value === step) {
    if (step === 3 && showBlockingOverlay.value) return
    currentStep.value = 0
  } else {
    currentStep.value = step
  }
}

const goToStep = (step: number) => {
  currentStep.value = step
}

const goToOverview = () => {
  currentView.value = 'overview'
}

/**
 * Called when Step 2 initiates an async background parse task.
 * @param taskId - ID of the parsing task
 */
const progressPercent = ref(0)
const progressMessage = ref('Initializing...')
let pollInterval: ReturnType<typeof setInterval> | null = null

const startPolling = (taskId: string) => {
    if (!props.zoneId) return

    showProgressDialog.value = true
    isProcessing.value = true
    progressPercent.value = 0
    progressMessage.value = 'Loading network data from server...'

    if (pollInterval) clearInterval(pollInterval)

    let isPolling = false
    pollInterval = setInterval(async () => {
        if (isPolling) return
        isPolling = true
        try {
            const { parseNetworkResponse } = await import('@/services/NetworkGraphService')
            const NetworkService = (await import('@/services/NetworkService')).default
            
            const status = await NetworkService.getParseTaskStatus(props.zoneId as string, taskId)
            progressPercent.value = status.percentage || 0
            progressMessage.value = status.message || 'Processing...'

            if (status.completed) {
                if (pollInterval) clearInterval(pollInterval)
                pollInterval = null
                
                if (status.hasError) {
                    throw new Error(status.errorDetails || 'Backend syntax error parsing shapefiles')
                }

                if (status.network) {
                    const parsedData = parseNetworkResponse(status.network, Number(props.zoneId) || 0)
                    handleFilesSubmitted(parsedData)
                } else {
                    handleFilesSubmitted(null)
                }
            }
        } catch (error) {
            if (pollInterval) clearInterval(pollInterval)
            pollInterval = null
            console.error('[NetworkSetupWizard] Error polling task:', error)
            alert('Error parsing network: ' + (error instanceof Error ? error.message : 'Unknown error'))
            showProgressDialog.value = false
            isProcessing.value = false
        } finally {
            isPolling = false
        }
    }, 1000)
}

/**
 * Called when Step 2 emits 'next' after role confirmation.
 * @param networkData - parsed NetworkGraphData from the save-roles response, or null
 */
const handleFilesSubmitted = async (networkData: NetworkGraphData | null) => {
  if (!networkData) {
    // No network data (user cancelled or no shapefiles parsed) — skip to step 3 anyway
    isStep3Enabled.value = true
    await nextTick()
    currentStep.value = 3
    return
  }

  showProgressDialog.value = true
  isProcessing.value = true

  try {
    // Data already parsed from API response — just assign it
    networkData_ref.value = networkData
    // Persist to network store so Map.vue can render it automatically
    networkStore.setNetworkData(networkData, Number(props.zoneId) || 0)
    console.log(
      '[NetworkSetupWizard] Network data received:',
      networkData.nodes.length, 'nodes,',
      networkData.pipes.length, 'pipes,',
      networkData.issues.length, 'issues'
    )

    showProgressDialog.value = false
    isProcessing.value = false

    // Enable and auto-expand Step 3
    isStep3Enabled.value = true
    await nextTick()
    currentStep.value = 3

    // Wait for Step 3 to fully expand, then show overlay with cutout
    await nextTick()
    setTimeout(async () => {
      scrollToStep3()
      await nextTick()
      setTimeout(() => {
        updateCutoutRect()
        showBlockingOverlay.value = true
        startObservingCutout()
      }, 600)
    }, 350)
  } catch (error) {
    console.error('[NetworkSetupWizard] Failed to process network:', error)
    showProgressDialog.value = false
    isProcessing.value = false
  }
}

const scrollToStep3 = () => {
  if (step3Ref.value?.$el && stepsContainer.value) {
    const stepEl = step3Ref.value.$el as HTMLElement
    const containerEl = stepsContainer.value
    const stepRect = stepEl.getBoundingClientRect()
    const containerRect = containerEl.getBoundingClientRect()
    const scrollOffset = stepRect.top - containerRect.top + containerEl.scrollTop

    containerEl.scrollTo({
      top: scrollOffset,
      behavior: 'smooth'
    })
  }
}

const handleInletDone = async (labels: string[]) => {
  console.log('[NetworkSetupWizard] Inlet nodes selected:', labels)

  try {
    showProgressDialog.value = true
    isProcessing.value = true
    progressMessage.value = 'Saving inlet configuration...'
    progressPercent.value = 50

    await ZoneService.updateZoneInlets({
      zoneId: Number(props.zoneId) || 0,
      inlets: labels
    })

    progressPercent.value = 100
  } catch (error) {
    console.error('[NetworkSetupWizard] Failed to save inlets:', error)
    alert('Failed to save inlet configuration. Please try again.')
    // Note: We might still want to proceed or stop here depending on requirements.
  } finally {
    showProgressDialog.value = false
    isProcessing.value = false
  }

  showBlockingOverlay.value = false
  stopObservingCutout()
  isStep3Enabled.value = false   // Back to disabled
  isStep3Completed.value = true
  currentStep.value = 0

  nextTick(() => {
    goToOverview()
  })
}

const handleFinish = () => {
  emit('finish')
}
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

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
