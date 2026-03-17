<template>
  <div class="flex flex-col h-full">

    <!-- Tab Bar -->
    <div class="flex items-center gap-1 mb-1">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.id"
        @click="activeTab = i"
        class="px-4 py-2 rounded font-montserrat font-semibold text-sm transition-all duration-200"
        :class="activeTab === i
          ? 'bg-white/10 text-white'
          : 'text-[#A7A7A7] hover:text-white hover:bg-white/5'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center bg-white/10 rounded px-3 py-2 mb-2 gap-3">
      <!-- Filter button (tabs 0,1,2) -->
      <button
        v-if="activeTab !== 3"
        @click="showFilterPanel = !showFilterPanel"
        class="flex items-center gap-2 px-3 py-1.5 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-white text-xs font-montserrat rounded transition-colors"
      >
        <svg class="w-3.5 h-3" viewBox="0 0 17 12" fill="currentColor">
          <path d="M6.5 11h4v-2h-4v2zm-4-5h12V4H2.5v2zM0 0v2h17V0H0z"/>
        </svg>
        Filter
      </button>
      <!-- Export button (tab 3) -->
      <button
        v-if="activeTab === 3"
        @click="$emit('export-gis')"
        class="px-3 py-1.5 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-white text-xs font-montserrat rounded transition-colors"
      >
        Export
      </button>

      <!-- Quick Fix & Report dropdowns (tab 0 only) -->
      <div v-if="activeTab === 0" class="flex items-center gap-2 ml-auto">
        <div class="relative" ref="quickFixRef">
          <button
            @click="quickFixOpen = !quickFixOpen"
            class="px-3 py-1.5 bg-[#7A7A7A] hover:bg-[#8A8A8A] text-white text-xs font-montserrat rounded transition-colors"
          >Quick Fix</button>
          <div v-if="quickFixOpen" class="absolute right-0 mt-1 bg-[#2B2B2B] border border-[#1A1A1A] rounded shadow-xl z-20 w-40">
            <button
              v-for="opt in quickFixOptions"
              :key="opt"
              @click="onQuickFix(opt)"
              class="w-full text-left px-3 py-2 text-xs font-montserrat text-[#A7A7A7] hover:text-white hover:bg-white/10 transition-colors"
            >{{ opt }}</button>
          </div>
        </div>
        <div class="relative" ref="reportRef">
          <button
            @click="reportOpen = !reportOpen"
            class="px-3 py-1.5 bg-[#7A7A7A] hover:bg-[#8A8A8A] text-white text-xs font-montserrat rounded transition-colors"
          >Report</button>
          <div v-if="reportOpen" class="absolute right-0 mt-1 bg-[#2B2B2B] border border-[#1A1A1A] rounded shadow-xl z-20 w-28">
            <button
              v-for="opt in ['PDF', 'CSV']"
              :key="opt"
              @click="onReport(opt)"
              class="w-full text-left px-3 py-2 text-xs font-montserrat text-[#A7A7A7] hover:text-white hover:bg-white/10 transition-colors"
            >{{ opt }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Panel (simple column filter, collapsible) -->
    <div
      v-if="showFilterPanel && activeTab !== 3"
      class="bg-white/5 border border-[#5D5D5D] rounded px-4 py-3 mb-2 flex items-center gap-3"
    >
      <span class="text-[#A7A7A7] font-montserrat text-xs">Filter by column:</span>
      <select
        v-model="filterColumn"
        class="bg-[#1a1a1a] border border-[#5D5D5D] text-white text-xs font-montserrat rounded px-2 py-1"
      >
        <option value="">-- All --</option>
        <option v-for="col in currentColumns" :key="col" :value="col">{{ col }}</option>
      </select>
      <input
        v-model="filterValue"
        placeholder="Search..."
        class="bg-[#1a1a1a] border border-[#5D5D5D] text-white text-xs font-montserrat rounded px-2 py-1 w-48 focus:border-[#529B26] outline-none"
      />
      <button @click="clearFilter" class="text-[#A7A7A7] hover:text-white text-xs font-montserrat">Clear</button>
    </div>

    <!-- Table Area -->
    <div class="flex-1 overflow-hidden rounded">
      <GisDataTable
        v-show="activeTab === 0"
        :rows="filteredGisRows"
        @show-in-map="(id: string) => $emit('show-in-map', id)"
        class="h-full"
      />
      <LinkDataTable
        v-show="activeTab === 1"
        :rows="filteredLinkRows"
        @edit="(row: LinkRow) => $emit('edit-link', row)"
        @delete="(label: string) => $emit('delete-link', label)"
        @show-in-map="(id: string) => $emit('show-in-map', id)"
        class="h-full"
      />
      <NodeDataTable
        v-show="activeTab === 2"
        :rows="filteredNodeRows"
        @edit="(row: NodeRow) => $emit('edit-node', row)"
        @show-in-map="(id: string) => $emit('show-in-map', id)"
        class="h-full"
      />
      <ExportGISTable
        v-show="activeTab === 3"
        :groups="exportGroups"
        @attribute-toggle="$emit('attribute-toggle', $event)"
        class="h-full"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GisDataTable from '../tables/GisDataTable.vue'
import LinkDataTable from '../tables/LinkDataTable.vue'
import NodeDataTable from '../tables/NodeDataTable.vue'
import ExportGISTable from '../tables/ExportGISTable.vue'
// Inline types to avoid module resolution issues with separate .ts files
type GisRow = { issue: string; description: string; severity: 'CRITICAL' | 'IMPACTED' | ''; related_obj_id?: string }
type LinkRow = { label: string; start_node: string; stop_node: string; length: string | number; diameter: string | number; material: string; status: string }
type NodeRow = { label: string; elevation: string | number; latitude: string | number; longitude: string | number; status: string }
type AttributeOption = { name: string; selected: boolean }
type AttributeGroup = { label: string; attributes: AttributeOption[] }

const props = withDefaults(defineProps<{
  gisRows?: GisRow[]
  linkRows?: LinkRow[]
  nodeRows?: NodeRow[]
  exportGroups?: AttributeGroup[]
}>(), {
  gisRows: () => [],
  linkRows: () => [],
  nodeRows: () => [],
  exportGroups: () => [
    { label: 'Main Pipe',     attributes: [] },
    { label: 'Lateral Pipe',  attributes: [] },
    { label: 'Meter',         attributes: [] },
    { label: 'Logger',        attributes: [] },
    { label: 'Valve',         attributes: [] },
    { label: 'Pump',          attributes: [] },
    { label: 'Tank',          attributes: [] },
  ]
})

defineEmits<{
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
  { id: 'link',     label: 'Link' },
  { id: 'node',     label: 'Node' },
  { id: 'export',   label: 'Export GIS' },
]

const activeTab = ref(0)
const showFilterPanel = ref(false)
const filterColumn = ref('')
const filterValue = ref('')
const quickFixOpen = ref(false)
const reportOpen = ref(false)

const quickFixOptions = ['Auto-connect', 'Reconstruct', 'Custom curves', 'Re-check connected', 'Find Loop']

const currentColumns = computed(() => {
  if (activeTab.value === 0) return ['issue', 'description', 'severity']
  if (activeTab.value === 1) return ['label', 'start_node', 'stop_node', 'length', 'diameter', 'material', 'status']
  if (activeTab.value === 2) return ['label', 'elevation', 'latitude', 'longitude', 'status']
  return []
})

const clearFilter = () => { filterColumn.value = ''; filterValue.value = '' }

const applyFilter = <T extends Record<string, unknown>>(rows: T[]) => {
  if (!filterValue.value) return rows
  const col = filterColumn.value
  const val = filterValue.value.toLowerCase()
  return rows.filter(row => {
    if (col) return String(row[col] ?? '').toLowerCase().includes(val)
    return Object.values(row).some(v => String(v ?? '').toLowerCase().includes(val))
  })
}

const filteredGisRows = computed(() => applyFilter(props.gisRows as Record<string, unknown>[]) as GisRow[])
const filteredLinkRows = computed(() => applyFilter(props.linkRows as Record<string, unknown>[]) as LinkRow[])
const filteredNodeRows = computed(() => applyFilter(props.nodeRows as Record<string, unknown>[]) as NodeRow[])

const onQuickFix = (_action: string) => {
  quickFixOpen.value = false
}

const onReport = (_format: string) => {
  reportOpen.value = false
}

// Close dropdowns on outside click
function handleOutsideClick(_e: MouseEvent) {
  quickFixOpen.value = false
  reportOpen.value = false
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>
