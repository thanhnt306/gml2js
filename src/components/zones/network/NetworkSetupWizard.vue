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
          <StepItem label="Display Configuration" number="1" :isExpanded="currentStep === 1" @toggle="toggleStep(1)">
            <DisplayConfiguration :zoneId="Number(props.zoneId)" @next="goToStep(2)" />
          </StepItem>

          <!-- Step 2: Add Network Files -->
          <StepItem label="Add Network Files" number="2" :isExpanded="currentStep === 2" @toggle="toggleStep(2)">
            <AddNetworkFiles :zoneId="props.zoneId" @next="handleFilesSubmitted" @start-task="startPolling" />
          </StepItem>

          <!-- Step 3: Choose Inlet Node (disabled until processing completes) -->
          <StepItem ref="step3Ref" label="Choose Inlet Node" number="3" :isExpanded="currentStep === 3"
            :disabled="!isStep3Enabled" @toggle="toggleStep(3)">
            <ChooseInletNode ref="chooseInletRef" :networkData="currentNetworkData" :isLoading="isProcessing"
              :isActive="showBlockingOverlay" @done="handleInletDone" />
          </StepItem>

          <!-- Step 4: Overview and Edit -->
          <StepItem label="Overview and Edit network data" number="4" :isExpanded="false" :isLastStep="true"
            @toggle="goToOverview" />

        </div>
      </div>
    </div>

    <!-- ===== PANEL 1: Overview & Edit ===== -->
    <div v-show="currentView === 'overview'" class="flex flex-col w-full h-full">
      <div class="flex items-center gap-3 mb-6 pl-4">
        <span
          class="w-9 h-9 rounded-full bg-[#529B26] flex items-center justify-center font-montserrat font-bold text-white text-sm flex-shrink-0">
          4
        </span>
        <h2 class="text-white font-montserrat font-semibold text-lg flex-1">
          General review and Edit network data
        </h2>
        <div class="flex items-center gap-3">
          <button @click="currentView = 'steps'"
            class="px-5 py-1.5 rounded font-montserrat font-semibold text-sm text-white bg-[#6A6A6A] hover:bg-[#808080] transition-colors">
            Back to previous steps
          </button>
          <button @click="handleFinish"
            class="px-5 py-1.5 rounded font-montserrat font-semibold text-sm text-white bg-[#529B26] hover:bg-[#6cc537] transition-colors">
            Finish
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <OverviewEditNetwork :gis-rows="gisRows" :link-rows="linkRows" :node-rows="nodeRows"
          :export-groups="exportGroups" @quick-fix="handleQuickFix" />
      </div>
    </div>

    <!-- ===== BLOCKING OVERLAY — box-shadow spotlight with rounded cutout ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showBlockingOverlay" class="fixed inset-0 z-40 pointer-events-none">

          <!-- Visual: single div using box-shadow to cast dark overlay.
               border-radius matches ChooseInletNode so corners are naturally curved.
               pointer-events: none so map remains fully clickable. -->
          <div class="absolute pointer-events-none" :style="{
            top: cutout.top + 'px',
            left: cutout.left + 'px',
            width: cutout.width + 'px',
            height: cutout.height + 'px',
            borderRadius: '15px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
          }"></div>

          <!-- Click-blocking: 4 invisible panels that capture pointer events
               on the dark surrounding area (corners are the tiny gap zones,
               clicks there fall through harmlessly to the page behind). -->
          <div class="absolute top-0 left-0 right-0 pointer-events-auto" :style="{ height: cutout.top + 'px' }"></div>
          <div class="absolute left-0 right-0 bottom-0 pointer-events-auto"
            :style="{ top: (cutout.top + cutout.height) + 'px' }"></div>
          <div class="absolute left-0 pointer-events-auto"
            :style="{ top: cutout.top + 'px', height: cutout.height + 'px', width: cutout.left + 'px' }"></div>
          <div class="absolute right-0 pointer-events-auto"
            :style="{ top: cutout.top + 'px', height: cutout.height + 'px', left: (cutout.left + cutout.width) + 'px' }">
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== PROGRESS DIALOG ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showProgressDialog" class="fixed inset-0 z-[60] flex items-center justify-center">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div
            class="relative bg-[#1e1e1e] border border-white/10 rounded-xl p-8 shadow-2xl text-center max-w-sm w-full mx-4">
            <h3 class="text-white font-montserrat font-semibold text-lg mb-4">Processing Network</h3>

            <!-- Progress Bar -->
            <div class="w-full h-2 bg-[#333] rounded-full overflow-hidden mb-4">
              <div class="h-full bg-[#529B26] transition-all duration-300 ease-out"
                :style="{ width: progressPercent + '%' }"></div>
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
import { ref, reactive, nextTick, computed, onBeforeUnmount } from 'vue'
import StepItem from './StepItem.vue'
import DisplayConfiguration from './steps/DisplayConfiguration.vue'
import AddNetworkFiles from './steps/AddNetworkFiles.vue'
import ChooseInletNode from './steps/ChooseInletNode.vue'
import OverviewEditNetwork from './steps/OverviewEditNetwork.vue'
import type { NetworkGraphData } from '@/services/NetworkGraphService'
import { toGisRows, toLinkRows, toNodeRows, parseNetworkResponse } from '@/services/NetworkGraphService'
import ZoneService from '@/services/ZoneService'
import NetworkService from '@/services/NetworkService'
import { useNetworkStore } from '@/stores/network'
import { useZoneStore } from '@/stores/zone'

const networkStore = useNetworkStore()
const zoneStore = useZoneStore()

const props = defineProps<{
  zoneId?: string
}>()

const emit = defineEmits<{
  finish: []
}>()

const currentView = ref<'steps' | 'overview'>('steps')
const currentStep = ref(1)

const networkData_ref = ref<NetworkGraphData | null>(null)
const isProcessing = ref(false)
const isStep3Enabled = ref(false)
const isStep3Completed = ref(false)
const showBlockingOverlay = ref(false)
const showProgressDialog = ref(false)

// Computed for the source of truth (local edit state OR store data)
const currentNetworkData = computed(() => networkStore.networkData || networkData_ref.value)

// Computed table rows
const gisRows = computed(() => currentNetworkData.value ? toGisRows(currentNetworkData.value.issues) : [])
const linkRows = computed(() => currentNetworkData.value ? toLinkRows(currentNetworkData.value.pipes) : [])
const nodeRows = computed(() => currentNetworkData.value ? toNodeRows(currentNetworkData.value.nodes) : [])
const exportGroups = computed(() => currentNetworkData.value?.exportGroups || [])

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

const handleQuickFix = async (action: string) => {
  if (action.startsWith('Auto-connect')) {
    const parts = action.split(':')
    const distance = parseFloat(parts[1])
    const diameter = parseFloat(parts[2])

    if (props.zoneId) {
      try {
        const zoneIdNum = Number(props.zoneId)
        const zone = zoneStore.zones.find(z => z.id === zoneIdNum)
        const inletLabels = zone?.inletLabels || []
        const taskId = await networkStore.startAutoConnect(zoneIdNum, distance, diameter, inletLabels)
        startAutoConnectPolling(taskId)
      } catch (err) {
        alert('Failed to start auto-connect task.')
      }
    }
  } else if (action === 'Re-check connected') {
    if (props.zoneId) {
      try {
        const zoneIdNum = Number(props.zoneId)
        const zone = zoneStore.zones.find(z => z.id === zoneIdNum)
        const inletLabels = zone?.inletLabels || []
        const taskId = await networkStore.startReCheckConnected(zoneIdNum, inletLabels)
        startReCheckConnectedPolling(taskId)
      } catch (err) {
        alert('Failed to start re-check connected task.')
      }
    }
  }
}

const startAutoConnectPolling = (taskId: string) => {
  if (!props.zoneId) return

  showProgressDialog.value = true
  isProcessing.value = true
  progressPercent.value = 0
  progressMessage.value = 'Auto-connecting disconnected components...'

  if (pollInterval) clearInterval(pollInterval)

  // Helper: apply auto-connect resultData (added/removed nodes & pipes) to networkStore
  const applyAutoConnectResult = (network: any) => {
    const data = networkStore.networkData
    if (!data) return

    // Remove pipes
    const removedPipesSet = new Set(network.removed_pipes || [])
    data.pipes = data.pipes.filter(p => !removedPipesSet.has(p.label))

    // Remove nodes (rebuild phase can remove junctions)
    const removedNodesSet = new Set(network.removed_nodes || [])
    if (removedNodesSet.size > 0) {
      data.nodes = data.nodes.filter(n => !removedNodesSet.has(n.label))
    }

    const nodesMap = new Map(data.nodes.map(n => [n.label, n]))

    for (const n of (network.added_nodes || [])) {
      const newNode = {
        label: n.label,
        elev_m: n.elevation,
        x: n.longitude,
        y: n.latitude,
        node_type: n.node_type || 'junction',
        status: 'Unknown',
        dma_id: n.dma_id || Number(props.zoneId) || 0,
        valve_type: n.valve_type || '',
        valve_size: n.valve_size || 0,
        pump_model: n.pump_model || '',
        raw: {}
      }
      data.nodes.push(newNode)
      nodesMap.set(n.label, newNode)
    }

    for (const p of (network.added_pipes || [])) {
      const n1 = nodesMap.get(p.start_node)
      const n2 = nodesMap.get(p.stop_node)
      const path: [number, number][] = []
      if (n1 && n2) {
        path.push([n1.x, n1.y], [n2.x, n2.y])
      }

      data.pipes.push({
        label: p.label,
        start_node: p.start_node,
        stop_node: p.stop_node,
        length_m: p.length,
        d_mm: p.diameter,
        material: p.material || 'No Information',
        status: p.status_string || 'Unknown',
        dma_id: p.dma_id || Number(props.zoneId) || 0,
        valve_type: p.valve_type || '',
        valve_size: p.valve_size || 0,
        pump_model: p.pump_model || '',
        path: path,
        raw: p.extra_attributes || {}
      })
    }

    // Force reactivity
    networkStore.setNetworkData({ ...data }, Number(props.zoneId))
  }

  let isPolling = false
  let lastEventIndex = -1

  // Helper: apply re-check resultData (status strings + issues) to networkStore
  const applyReCheckResult = (rd: any) => {
    const data = networkStore.networkData
    if (!data) return

    const newIssues = rd.new_issues ?? []

    // 1. Remove existing disconnected issues
    data.issues = data.issues.filter((issue: any) =>
      issue.name !== 'Disconnected Component ' && issue.name !== 'Object Disconnected '
    )

    // 2. Patch node/pipe status strings
    const junctionStatusStrings: Record<string, string> = rd.junction_status_strings ?? {}
    const pipeStatusStrings: Record<string, string> = rd.pipe_status_strings ?? {}
    for (const node of data.nodes) {
      if (junctionStatusStrings[node.label] !== undefined) {
        node.status = junctionStatusStrings[node.label]
      }
    }
    for (const pipe of data.pipes) {
      if (pipeStatusStrings[pipe.label] !== undefined) {
        pipe.status = pipeStatusStrings[pipe.label]
      }
    }

    // 3. Add new issues from re-check
    if (newIssues.length > 0) {
      const formattedIssues = newIssues.map((issue: any) => ({
        id: issue.id,
        name: issue.name,
        description: issue.description,
        level: issue.level,
        dma_id: issue.dma_id,
        relatedObjectIds: {
          junctionIds: issue.relatedObjectIds?.junctionIds || [],
          pipelineIds: issue.relatedObjectIds?.pipelineIds || []
        },
        status: 'Unknown'
      }))
      data.issues.push(...formattedIssues)
    }

    networkStore.setNetworkData({ ...data }, Number(props.zoneId))
  }

  pollInterval = setInterval(async () => {
    if (isPolling) return
    isPolling = true
    try {
      const status = await networkStore.checkAutoConnectStatus(taskId)
      progressPercent.value = status.percentage || 0
      progressMessage.value = status.message || 'Processing...'

      // Process all unhandled checkpoint events in order
      const events: any[] = status.events || []
      const newEvents = events.slice(lastEventIndex + 1)
      for (const event of newEvents) {
        lastEventIndex++
        if (event.message === 'Completed Auto-Connect') {
          applyAutoConnectResult(event.resultData)
        } else if (event.message === 'Re-check done, starting rebuild...') {
          applyReCheckResult(event.resultData)
        } else if (event.message === 'Rebuild completed') {
          applyAutoConnectResult(event.resultData)
        }
      }

      if (status.completed) {
        if (pollInterval) clearInterval(pollInterval)
        pollInterval = null

        if (status.hasError) {
          throw new Error(status.errorDetails || 'Auto-connect + rebuild failed')
        }

        // Show warnings from rebuild result (last event's resultData)
        const rebuildEvent = (status.events || []).findLast((e: any) => e.message === 'Rebuild completed')
        const rd = rebuildEvent?.resultData ?? status.resultData
        const warnings: string[] = []

        if (rd) {
          const unmodellable: string[] = rd.unmodellable_junctions || []
          if (unmodellable.length > 0) {
            warnings.push(`⚠️ ${unmodellable.length} junction(s) could not be modelled as valve/pump:\n  ${unmodellable.slice(0, 5).join(', ')}${unmodellable.length > 5 ? ` ... and ${unmodellable.length - 5} more` : ''}`)
          }

          const disconnectedValvePump: string[] = rd.disconnected_valve_pump_junctions || []
          if (disconnectedValvePump.length > 0) {
            warnings.push(`⚠️ ${disconnectedValvePump.length} valve/pump junction(s) remain in disconnected regions:\n  ${disconnectedValvePump.slice(0, 5).join(', ')}${disconnectedValvePump.length > 5 ? ` ... and ${disconnectedValvePump.length - 5} more` : ''}`)
          }

          const notConnected: string[] = rd.not_connected_junctions || []
          if (notConnected.length > 0) {
            warnings.push(`⚠️ ${notConnected.length} junction(s) could not be connected to the network:\n  ${notConnected.slice(0, 5).join(', ')}${notConnected.length > 5 ? ` ... and ${notConnected.length - 5} more` : ''}`)
          }
        }

        showProgressDialog.value = false
        isProcessing.value = false

        if (warnings.length > 0) {
          alert(`Auto-connect and rebuild completed with warnings:\n\n${warnings.join('\n\n')}`)
        } else {
          alert('✅ Auto-connect and rebuild completed successfully!')
        }
      }
    } catch (error) {
      if (pollInterval) clearInterval(pollInterval)
      pollInterval = null
      console.error('[NetworkSetupWizard] Error polling auto-connect task:', error)
      alert('Error auto-connecting: ' + (error instanceof Error ? error.message : 'Unknown error'))
      showProgressDialog.value = false
      isProcessing.value = false
    } finally {
      isPolling = false
    }
  }, 1000)
}

const startReCheckConnectedPolling = (taskId: string) => {
  if (!props.zoneId) return

  showProgressDialog.value = true
  isProcessing.value = true
  progressPercent.value = 0
  progressMessage.value = 'Checking network connectivity...'

  if (pollInterval) clearInterval(pollInterval)

  let isPolling = false
  pollInterval = setInterval(async () => {
    if (isPolling) return
    isPolling = true
    try {
      const status = await networkStore.checkAutoConnectStatus(taskId)
      progressPercent.value = status.percentage || 0
      progressMessage.value = status.message || 'Processing...'

      if (status.completed) {
        if (pollInterval) clearInterval(pollInterval)
        pollInterval = null

        if (status.hasError) {
          throw new Error(status.errorDetails || 'Re-check connected failed')
        }

        showProgressDialog.value = false
        isProcessing.value = false

        if (status.resultData) {
          const newIssues = status.resultData.new_issues ?? []

          // 1. Always remove existing disconnected issues from store first
          if (networkStore.networkData) {
            networkStore.networkData.issues = networkStore.networkData.issues.filter(issue =>
              issue.name !== 'Disconnected Component ' && issue.name !== 'Object Disconnected '
            )
          }

          // 2. Patch node/pipe status strings so NodeDataTable & LinkDataTable update reactively
          const junctionStatusStrings: Record<string, string> = status.resultData.junction_status_strings ?? {}
          const pipeStatusStrings: Record<string, string> = status.resultData.pipe_status_strings ?? {}
          if (networkStore.networkData) {
            for (const node of networkStore.networkData.nodes) {
              if (junctionStatusStrings[node.label] !== undefined) {
                node.status = junctionStatusStrings[node.label]
              }
            }
            for (const pipe of networkStore.networkData.pipes) {
              if (pipeStatusStrings[pipe.label] !== undefined) {
                pipe.status = pipeStatusStrings[pipe.label]
              }
            }
          }

          if (newIssues.length === 0) {
            alert('✅ Re-check completed.\n\nAll nodes are connected to the inlet!')
          } else {
            // 2. Add new issues from backend
            const formattedIssues = newIssues.map((issue: any) => ({
              id: issue.id,
              name: issue.name,
              description: issue.description,
              level: issue.level,
              dma_id: issue.dma_id,
              relatedObjectIds: {
                junctionIds: issue.relatedObjectIds?.junctionIds || [],
                pipelineIds: issue.relatedObjectIds?.pipelineIds || []
              },
              status: 'Unknown' // Default status for new issues
            }))

            if (networkStore.networkData) {
              networkStore.networkData.issues.push(...formattedIssues)
              // Force reactivity update
              networkStore.setNetworkData({ ...networkStore.networkData }, Number(props.zoneId) || 0)
            }

            // 3. Display summary message
            let msg = `⚠️ Re-check completed.\n\n`
            msg += `Found ${newIssues.length} disconnected issue(s).\n`

            newIssues.slice(0, 5).forEach((issue: any, i: number) => {
              const jCount = issue.relatedObjectIds?.junctionIds?.length || 0
              const pCount = issue.relatedObjectIds?.pipelineIds?.length || 0
              msg += `  [${i + 1}] ${issue.name} (${jCount} nodes, ${pCount} pipes)\n`
            })
            if (newIssues.length > 5) {
              msg += `  ... and ${newIssues.length - 5} more issues\n`
            }
            alert(msg)
          }
        }
      }
    } catch (error) {
      if (pollInterval) clearInterval(pollInterval)
      pollInterval = null
      console.error('[NetworkSetupWizard] Error polling re-check task:', error)
      alert('Error re-checking: ' + (error instanceof Error ? error.message : 'Unknown error'))
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

    zoneStore.setInletLabels(Number(props.zoneId) || 0, labels)
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
