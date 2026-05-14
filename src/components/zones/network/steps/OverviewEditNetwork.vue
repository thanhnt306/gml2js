<template>
  <div class="flex flex-col h-full">

    <!-- Tab Bar -->
    <div class="flex items-center gap-1 mb-1">
      <button v-for="(tab, i) in tabs" :key="tab.id" @click="activeTab = i"
        class="px-4 py-2 rounded font-montserrat font-semibold text-sm transition-all duration-200" :class="activeTab === i
          ? 'bg-white/10 text-white'
          : 'text-[#A7A7A7] hover:text-white hover:bg-white/5'">
        {{ tab.label }}
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center bg-white/10 rounded px-3 py-2 mb-2 gap-3">
      <!-- Filter button (tabs 0,1,2) -->
      <button v-if="activeTab !== 3" @click="showFilterPanel = !showFilterPanel"
        class="flex items-center gap-2 px-3 py-1.5 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-white text-xs font-montserrat rounded transition-colors">
        <svg class="w-3.5 h-3" viewBox="0 0 17 12" fill="currentColor">
          <path d="M6.5 11h4v-2h-4v2zm-4-5h12V4H2.5v2zM0 0v2h17V0H0z" />
        </svg>
        Filter
      </button>
      <!-- Export button (tab 3) -->
      <button v-if="activeTab === 3" @click="$emit('export-gis')"
        class="px-3 py-1.5 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-white text-xs font-montserrat rounded transition-colors">
        Export
      </button>

      <!-- Quick Fix & Report dropdowns (tab 0 only) -->
      <div v-if="activeTab === 0" class="flex items-center gap-2 ml-auto">
        <div class="relative" ref="quickFixRef">
          <button @click="quickFixOpen = !quickFixOpen"
            class="px-3 py-1.5 bg-[#7A7A7A] hover:bg-[#8A8A8A] text-white text-xs font-montserrat rounded transition-colors">Quick
            Fix</button>
          <div v-if="quickFixOpen"
            class="absolute right-0 mt-1 bg-[#2B2B2B] border border-[#1A1A1A] rounded shadow-xl z-20 w-40">
            <button v-for="opt in quickFixOptions" :key="opt" @click="onQuickFix(opt)"
              class="w-full text-left px-3 py-2 text-xs font-montserrat text-[#A7A7A7] hover:text-white hover:bg-white/10 transition-colors">{{
                opt }}</button>
          </div>
        </div>
        <div class="relative" ref="reportRef">
          <button @click="reportOpen = !reportOpen"
            class="px-3 py-1.5 bg-[#7A7A7A] hover:bg-[#8A8A8A] text-white text-xs font-montserrat rounded transition-colors">Report</button>
          <div v-if="reportOpen"
            class="absolute right-0 mt-1 bg-[#2B2B2B] border border-[#1A1A1A] rounded shadow-xl z-20 w-28">
            <button v-for="opt in ['PDF', 'CSV']" :key="opt" @click="onReport(opt)"
              class="w-full text-left px-3 py-2 text-xs font-montserrat text-[#A7A7A7] hover:text-white hover:bg-white/10 transition-colors">{{
                opt }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Panel (simple column filter, collapsible) -->
    <div v-if="showFilterPanel && activeTab !== 3"
      class="bg-white/5 border border-[#5D5D5D] rounded px-4 py-3 mb-2 flex items-center gap-3">
      <span class="text-[#A7A7A7] font-montserrat text-xs">Filter by column:</span>
      <select v-model="filterColumn"
        class="bg-[#1a1a1a] border border-[#5D5D5D] text-white text-xs font-montserrat rounded px-2 py-1">
        <option value="">-- All --</option>
        <option v-for="col in currentColumns" :key="col" :value="col">{{ col }}</option>
      </select>
      <input v-model="filterValue" placeholder="Search..."
        class="bg-[#1a1a1a] border border-[#5D5D5D] text-white text-xs font-montserrat rounded px-2 py-1 w-48 focus:border-[#529B26] outline-none" />
      <button @click="clearFilter" class="text-[#A7A7A7] hover:text-white text-xs font-montserrat">Clear</button>
    </div>

    <!-- Table Area -->
    <div class="flex-1 overflow-hidden rounded">
      <GisDataTable v-show="activeTab === 0" :rows="filteredGisRows"
        @show-in-map="(id: string) => $emit('show-in-map', id)" class="h-full" />
      <LinkDataTable v-show="activeTab === 1" :rows="filteredLinkRows" @edit="(row: LinkRow) => $emit('edit-link', row)"
        @delete="(label: string) => $emit('delete-link', label)" @show-in-map="(id: string) => $emit('show-in-map', id)"
        class="h-full" />
      <NodeDataTable v-show="activeTab === 2" :rows="filteredNodeRows" @edit="(row: NodeRow) => $emit('edit-node', row)"
        @show-in-map="(id: string) => $emit('show-in-map', id)" class="h-full" />
      <ExportGISTable v-show="activeTab === 3" :groups="exportGroups"
        @attribute-toggle="$emit('attribute-toggle', $event)" class="h-full" />
    </div>

  </div>

  <!-- Auto-connect Options Dialog -->
  <AutoConnectDialog v-model="showAutoConnect" @confirm="onAutoConnectConfirm" />

  <!-- Reconstruct Options Dialog -->
  <RebuildNetworkOptionDialog
    :is-open="showReconstruct"
    @close="showReconstruct = false"
    @confirm="onReconstructConfirm"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GisDataTable from '../tables/GisDataTable.vue'
import LinkDataTable from '../tables/LinkDataTable.vue'
import NodeDataTable from '../tables/NodeDataTable.vue'
import ExportGISTable from '../tables/ExportGISTable.vue'
import AutoConnectDialog from '../dialogs/AutoConnectDialog.vue'
import RebuildNetworkOptionDialog from './RebuildNetworkOptionDialog.vue'
import type { GisRow, LinkRow, NodeRow, AttributeGroup } from '../tables/types'

const props = defineProps<{
  gisRows?: GisRow[]
  linkRows?: LinkRow[]
  nodeRows?: NodeRow[]
  exportGroups?: AttributeGroup[]
}>()

// --- Mock data for reference (not used in production) ---
// gisRows: () => [
//   { issue: 'Point Outside Zone', description: 'Node J-12 is located outside the defined boundary of Zone 1.', severity: 'CRITICAL', related_obj_id: 'J-12',  related_junction_ids: ['J-12'],          related_pipeline_ids: [] },
//   { issue: 'Disconnected Pipe',  description: 'Pipe P-45 has no downstream connection.',                       severity: 'IMPACTED', related_obj_id: 'P-45',  related_junction_ids: [],                related_pipeline_ids: ['P-45'] },
//   { issue: 'Duplicate Node',     description: 'Nodes J-101 and J-102 have identical coordinates.',             severity: 'IMPACTED', related_obj_id: 'J-101', related_junction_ids: ['J-101', 'J-102'],  related_pipeline_ids: [] },
//   { issue: 'Missing Elevation',  description: 'Junction J-88 has an elevation of 0, which may be incorrect.', severity: '',         related_obj_id: 'J-88',  related_junction_ids: ['J-88'],           related_pipeline_ids: [] },
//   { issue: 'Isolated Network',   description: 'A cluster of 5 nodes and 4 pipes is not connected to any reservoir.', severity: 'CRITICAL', related_obj_id: 'RES-1', related_junction_ids: [], related_pipeline_ids: [] },
// ],
// linkRows: () => [
//   { label: 'P-001', start_node: 'J-1',   stop_node: 'J-2',   length: 125.5, diameter: 0.2,  material: 'PVC',          status: 'Open' },
//   { label: 'P-002', start_node: 'J-2',   stop_node: 'J-3',   length: 88.0,  diameter: 0.15, material: 'Ductile Iron', status: 'Closed' },
//   { label: 'P-003', start_node: 'J-3',   stop_node: 'J-4',   length: 210.2, diameter: 0.25, material: 'HDPE',         status: 'Open' },
//   { label: 'P-004', start_node: 'J-4',   stop_node: 'J-5',   length: 45.3,  diameter: 0.1,  material: 'Steel',        status: 'Open' },
//   { label: 'P-005', start_node: 'J-5',   stop_node: 'RES-1', length: 300.0, diameter: 0.4,  material: 'Cast Iron',    status: 'Open' },
//   { label: 'P-006', start_node: 'J-1',   stop_node: 'J-6',   length: 154.8, diameter: 0.2,  material: 'PVC',          status: 'Open' },
//   { label: 'P-007', start_node: 'J-6',   stop_node: 'J-7',   length: 92.1,  diameter: 0.15, material: 'HDPE',         status: 'Open' },
//   { label: 'P-008', start_node: 'J-7',   stop_node: 'J-8',   length: 112.5, diameter: 0.2,  material: 'PVC',          status: 'Closed' },
// ],
// nodeRows: () => [
//   { label: 'J-1',   elevation: 45.2, latitude: 21.0285, longitude: 105.8542, status: 'Active' },
//   { label: 'J-2',   elevation: 44.8, latitude: 21.0290, longitude: 105.8550, status: 'Active' },
//   { label: 'J-3',   elevation: 46.1, latitude: 21.0295, longitude: 105.8560, status: 'Maintenance' },
//   { label: 'J-4',   elevation: 43.5, latitude: 21.0300, longitude: 105.8570, status: 'Active' },
//   { label: 'J-5',   elevation: 42.9, latitude: 21.0310, longitude: 105.8580, status: 'Active' },
//   { label: 'RES-1', elevation: 50.0, latitude: 21.0320, longitude: 105.8600, status: 'Active (Source)' },
//   { label: 'J-6',   elevation: 44.5, latitude: 21.0270, longitude: 105.8530, status: 'Inactive' },
//   { label: 'J-7',   elevation: 45.0, latitude: 21.0260, longitude: 105.8520, status: 'Active' },
// ],
// exportGroups: () => [
//   { label: 'Main Pipe',    attributes: [{ name: 'OLDOFPIPE', selected: true }] },
//   { label: 'Lateral Pipe', attributes: [{ name: 'VATLIEU', selected: true }] },
//   { label: 'Meter',        attributes: [{ name: 'AUG_2023', selected: true }, { name: 'CODONGHO', selected: true }, { name: 'JUL_2023', selected: true }, { name: 'SEP_2023', selected: true }] },
//   { label: 'Logger',       attributes: [{ name: 'ApLuc', selected: true }, { name: 'Caretaker', selected: true }, { name: 'Channels', selected: true }, { name: 'CoDH', selected: true }, { name: 'CoVGA', selected: true }, { name: 'DVQL', selected: true }, { name: 'DiaChi', selected: true }, { name: 'GTAL', selected: true }, { name: 'GTLL', selected: true }, { name: 'GhiChu', selected: true }, { name: 'Hang', selected: true }] },
//   { label: 'Valve',        attributes: [{ name: 'LOAIVAN2', selected: true }] },
//   { label: 'Pump',         attributes: [] },
//   { label: 'Tank',         attributes: [] },
// ],


const emit = defineEmits<{
  'show-in-map': [id: string]
  'edit-link': [row: LinkRow]
  'delete-link': [label: string]
  'edit-node': [row: NodeRow]
  'export-gis': []
  'attribute-toggle': [{ group: string; name: string; selected: boolean }]
  'quick-fix': [action: string]
  'report': [format: string]
}>()

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'link', label: 'Link' },
  { id: 'node', label: 'Node' },
  { id: 'export', label: 'Export GIS' },
]

const activeTab = ref(0)
const showFilterPanel = ref(false)
const filterColumn = ref('')
const filterValue = ref('')
const quickFixOpen = ref(false)
const reportOpen = ref(false)
const showAutoConnect = ref(false)
const showReconstruct = ref(false)

const quickFixOptions = ['Auto-connect', 'Reconstruct', 'Custom curves', 'Re-check connected', 'Find Loop']

const currentColumns = computed(() => {
  if (activeTab.value === 0) return ['issue', 'description', 'severity']
  if (activeTab.value === 1) return ['label', 'start_node', 'stop_node', 'length', 'diameter', 'material', 'status']
  if (activeTab.value === 2) return ['label', 'elevation', 'latitude', 'longitude', 'status']
  return []
})

const clearFilter = () => { filterColumn.value = ''; filterValue.value = '' }

const applyFilter = <T>(rows: T[]): T[] => {
  if (!filterValue.value) return rows
  const col = filterColumn.value
  const val = filterValue.value.toLowerCase()
  return rows.filter(row => {
    const record = row as Record<string, unknown>
    if (col) return String(record[col] ?? '').toLowerCase().includes(val)
    return Object.values(record).some(v =>
      !Array.isArray(v) && String(v ?? '').toLowerCase().includes(val)
    )
  })
}

const filteredGisRows = computed(() => applyFilter(props.gisRows ?? []))
const filteredLinkRows = computed(() => applyFilter(props.linkRows ?? []))
const filteredNodeRows = computed(() => applyFilter(props.nodeRows ?? []))

const onQuickFix = (action: string) => {
  quickFixOpen.value = false
  if (action === 'Auto-connect') {
    showAutoConnect.value = true
    return
  }
  if (action === 'Reconstruct') {
    showReconstruct.value = true
    return
  }
  emit('quick-fix', action)
}

const onAutoConnectConfirm = (params: { distance: number; diameter: number }) => {
  emit('quick-fix', `Auto-connect:${params.distance}:${params.diameter}`)
}

const onReconstructConfirm = (payload: { reduceJunctions: number; pipeResolution: number }) => {
  showReconstruct.value = false
  emit('quick-fix', `Reconstruct:${payload.reduceJunctions}:${payload.pipeResolution}`)
}

const onReport = (_format: string) => {
  reportOpen.value = false
}

const quickFixRef = ref<HTMLElement | null>(null)
const reportRef = ref<HTMLElement | null>(null)

// Close dropdowns on outside click
function handleOutsideClick(e: MouseEvent) {
  if (quickFixRef.value && !quickFixRef.value.contains(e.target as Node)) {
    quickFixOpen.value = false
  }
  if (reportRef.value && !reportRef.value.contains(e.target as Node)) {
    reportOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>
