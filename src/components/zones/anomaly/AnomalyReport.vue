<template>
  <div class="w-full flex flex-col gap-3 min-h-0">

    <!-- ─── HEADER ROW ─── -->
    <div class="grid grid-cols-3 items-center gap-4">
      <!-- Left: run date selector -->
      <div class="flex flex-col gap-1">
        <span class="text-[#529B26] font-montserrat font-light text-xs">Run analysis date:</span>
        <div class="flex items-center gap-2">
          <div class="w-[180px]">
            <BaseSelect
              v-model="selectedRunDate"
              :options="simulationRuns"
              labelKey="label"
              valueKey="value"
              customClass="bg-[#1A529B26] text-[#529B26] font-montserrat font-semibold text-xs border-none"
              customDropdownClass="bg-[#1e1e1e] border-[#5D5D5D]"
              customDropdownTextClass="text-[#529B26]"
              placeholder="Select Run"
            />
          </div>
          <span class="bg-[#1A529B26] text-[#529B26] font-montserrat font-semibold text-[10px] px-2 py-0.5 rounded">
            Latest
          </span>
        </div>
      </div>

      <!-- Center: overview donut widget -->
      <div class="flex flex-col items-center">
        <span class="text-white font-montserrat font-medium text-lg mb-4">Total Detected Anomalies</span>
        <div class="flex items-center gap-6">
          <!-- Donut chart -->
          <div class="relative w-[130px] h-[130px]">
            <svg viewBox="0 0 40 40" class="w-full h-full -rotate-90">
              <!-- thick outer background ring -->
              <circle cx="20" cy="20" r="18" fill="none" stroke="#4D4D4D" stroke-width="4"/>
              
              <!-- False Alert (orange) -->
              <circle v-if="falseAlertPct > 0" cx="20" cy="20" r="16" fill="none" stroke="#CE7829" stroke-width="2.5"
                :stroke-dasharray="`${Math.max(0, falseAlertPct - 1)} ${100 - Math.max(0, falseAlertPct - 1)}`"
                stroke-dashoffset="0" stroke-linecap="round"/>
              <!-- Abnormal (yellow) -->
              <circle v-if="abnormalPct > 0" cx="20" cy="20" r="16" fill="none" stroke="#BEAE00" stroke-width="2.5"
                :stroke-dasharray="`${Math.max(0, abnormalPct - 1)} ${100 - Math.max(0, abnormalPct - 1)}`"
                :stroke-dashoffset="`${-falseAlertPct}`" stroke-linecap="round"/>
              <!-- Identified (green) -->
              <circle v-if="identifiedPct > 0" cx="20" cy="20" r="16" fill="none" stroke="#529B26" stroke-width="2.5"
                :stroke-dasharray="`${Math.max(0, identifiedPct - 1)} ${100 - Math.max(0, identifiedPct - 1)}`"
                :stroke-dashoffset="`${-(falseAlertPct + abnormalPct)}`" stroke-linecap="round"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-white font-montserrat font-bold text-4xl leading-none">{{ summary.total }}</span>
            </div>
          </div>

          <!-- Legend -->
          <div class="flex flex-col gap-2">
            <!-- False Alert -->
            <div class="border border-[#CE7829] rounded-[4px] flex flex-col items-center justify-center w-[90px] h-[40px] bg-transparent">
              <span class="text-[#CE7829] font-inter text-[10px] leading-tight">False Alert</span>
              <span class="text-white font-montserrat font-semibold text-[15px] leading-tight">{{ summary.falseAlert }}</span>
            </div>
            <!-- Abnormal -->
            <div class="border border-[#BEAE00] rounded-[4px] flex flex-col items-center justify-center w-[90px] h-[40px] bg-transparent">
              <span class="text-[#BEAE00] font-inter text-[10px] leading-tight">Abnormal</span>
              <span class="text-white font-montserrat font-semibold text-[15px] leading-tight">{{ summary.abnormal }}</span>
            </div>
            <!-- Identified -->
            <div class="border border-[#529B26] rounded-[4px] flex flex-col items-center justify-center w-[90px] h-[40px] bg-transparent">
              <span class="text-[#529B26] font-inter text-[10px] leading-tight">Identified</span>
              <span class="text-white font-montserrat font-semibold text-[15px] leading-tight">{{ summary.identified }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: empty (reserved) -->
      <div/>
    </div>

    <!-- ─── TOOLBAR ─── -->
    <div class="bg-[#4D4D4D] rounded px-3 py-2 flex items-center gap-3">
      <!-- Generate Work Order toggle -->
      <button
        @click="toggleWorkOrderMode"
        class="px-4 py-1.5 rounded font-inter font-semibold text-[10px] leading-tight text-center transition-colors duration-150"
        :class="workOrderMode
          ? 'bg-[#6A6A6A] text-white border border-[#8A8A8A]'
          : 'bg-[#529B26] text-white hover:bg-[#6cc537] box-border border border-[#529B26]'"
      >
        Generate<br/>Work Order
      </button>
      <!-- Generate Selected (only visible in work-order mode) -->
      <button
        v-if="workOrderMode"
        @click="generateSelected"
        class="px-4 py-1.5 rounded font-inter font-semibold text-[10px] leading-tight text-center bg-[#529B26] text-white hover:bg-[#6cc537] transition-colors border border-[#529B26]"
      >
        Generate<br/>Selected
      </button>

      <!-- Filter -->
      <AnomalyFilterPanel
        v-model="filters"
        @clear="clearFilters"
        :detectionStatusOptions="detectionStatusOptions"
        :repairedStatusOptions="repairedStatusOptions"
        :systemAnomalyTypeOptions="systemAnomalyTypeOptions"
        :anomalyTypeOptions="anomalyTypeOptions"
        :volumeOptions="volumeOptions"
        :confidenceOptions="confidenceOptions"
        :networkTypeOptions="networkTypeOptions"
        :lengthOptions="lengthOptions"
        :diameterOptions="diameterOptions"
        :materialOptions="materialOptions"
      />
    </div>

    <!-- ─── DATA TABLE ─── -->
    <div class="h-[480px] mt-1 relative bg-[#2E2E2E] border border-[#3a3a3a] rounded-[4px] overflow-hidden">
      <FluTableViewAny
        v-if="pagedRows.length > 0"
        :columns="displayColumns"
        :items="pagedRows"
        striped
        headerBgColor="#7A7A7A"
        headerFlush
        class="h-full"
      >
        <!-- Checkbox Header -->
        <template #checkbox-header>
          <div class="flex justify-center items-center h-full">
            <input 
              type="checkbox" 
              v-model="selectAll" 
              @change="toggleSelectAll"
              class="accent-[#529B26] cursor-pointer"
            />
          </div>
        </template>

        <!-- Sorting Headers -->
        <template #detectionTime-header="{ column }">
          <div class="flex items-center justify-center gap-1 cursor-pointer select-none" @click="setSort('detectionTime')">
            {{ column.title }}
            <span v-if="sortKey === 'detectionTime'" class="text-[#529B26]">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
          </div>
        </template>

        <template #location-header="{ column }">
          <div class="flex items-center justify-center gap-1 cursor-pointer select-none" @click="setSort('location')">
            {{ column.title }}
            <span v-if="sortKey === 'location'" class="text-[#529B26]">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
          </div>
        </template>

        <template #systemAnomalyType-header="{ column }">
          <div class="flex items-center justify-center gap-1 cursor-pointer select-none" @click="setSort('systemAnomalyType')">
            {{ column.title }}
            <span v-if="sortKey === 'systemAnomalyType'" class="text-[#529B26]">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
          </div>
        </template>

        <template #accuracy-header="{ column }">
          <div class="flex items-center justify-center gap-1 cursor-pointer select-none" @click="setSort('accuracy')">
            {{ column.title }}
            <span v-if="sortKey === 'accuracy'" class="text-[#529B26]">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
          </div>
        </template>

        <template #volume-header="{ column }">
          <div class="flex items-center justify-center gap-1 cursor-pointer select-none" @click="setSort('volume')">
            {{ column.title }}
            <span v-if="sortKey === 'volume'" class="text-[#529B26]">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
          </div>
        </template>

        <template #detectionStatus-header="{ column }">
          <div class="flex items-center justify-center gap-1 cursor-pointer select-none" @click="setSort('detectionStatus')">
            {{ column.title }}
            <span v-if="sortKey === 'detectionStatus'" class="text-[#529B26]">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
          </div>
        </template>

        <template #anomalyType-header="{ column }">
          <div class="flex items-center justify-center gap-1 cursor-pointer select-none" @click="setSort('anomalyType')">
            {{ column.title }}
            <span v-if="sortKey === 'anomalyType'" class="text-[#529B26]">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
          </div>
        </template>

        <template #repairedStatus-header="{ column }">
          <div class="flex items-center justify-center gap-1 cursor-pointer select-none" @click="setSort('repairedStatus')">
            {{ column.title }}
            <span v-if="sortKey === 'repairedStatus'" class="text-[#529B26]">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
          </div>
        </template>

        <!-- Checkbox slot (Work Order Mode) -->
        <template #checkbox="{ item }">
          <div class="flex justify-center items-center h-full">
            <input 
              type="checkbox" 
              :checked="selectedRows.has(item.id)" 
              @change="toggleRow(item.id)"
              class="accent-[#529B26] cursor-pointer"
            />
          </div>
        </template>

        <!-- Initial Report Date slot -->
        <template #detectionTime="{ item }">
          <div class="flex flex-col justify-center items-center h-full gap-0.5">
            <span class="font-inter text-xs text-white leading-tight">{{ item.detectionTime.split(' ')[0] }}</span>
            <span class="font-inter text-xs text-white leading-tight">{{ item.detectionTime.split(' ')[1] }}</span>
          </div>
        </template>

        <!-- Location slot -->
        <template #location="{ item }">
          <div class="flex justify-center items-center h-full">
            <button
              class="font-inter text-xs text-white bg-[#4D4D4D] border border-[#6D6D6D] rounded-[4px] px-3 py-1 transition-colors"
              @dblclick="showInMap(item.location)"
            >
              {{ item.location }}
            </button>
          </div>
        </template>

        <!-- Status Columns -->
        <template #detectionStatus="{ item }">
          <div class="flex justify-center items-center h-full">
            <span class="font-inter text-xs font-medium" :class="detectionStatusColor(item.detectionStatus)">
              {{ item.detectionStatus }}
            </span>
          </div>
        </template>
        
        <template #repairedStatus="{ item }">
          <div class="flex justify-center items-center h-full">
            <span class="font-inter text-xs font-medium" :class="repairStatusColor(item.repairedStatus)">
              {{ item.repairedStatus }}
            </span>
          </div>
        </template>
        
        <!-- Anomaly Type slot -->
        <template #anomalyType="{ item }">
          <div class="flex justify-center items-center h-full">
            <span class="font-inter text-xs text-white">
              {{ item.anomalyType }}
            </span>
          </div>
        </template>
        
        <!-- Action Options -->
        <template #action="{ item }">
          <div class="flex justify-center items-center h-full">
            <button @click="openEditor(item)" class="px-3 py-1 bg-[#529B26] hover:bg-[#6cc537] text-white text-xs font-montserrat rounded transition-colors whitespace-nowrap">
              Edit
            </button>
          </div>
        </template>
      </FluTableViewAny>
      
      <!-- Empty State -->
      <div v-else class="h-full flex flex-col items-center justify-center">
        <span class="text-[#7A7A7A] font-inter text-sm mb-2">No anomalies match the current filters.</span>
        <button @click="clearFilters" class="text-[#529B26] hover:underline text-xs">Clear Filters</button>
      </div>
    </div>


    <!-- ─── PAGINATION ─── -->
    <div class="flex items-center justify-center gap-1 h-16 shrink-0">
      <template v-if="totalPages > 1">
        <button
          @click="goPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="w-8 h-8 flex items-center justify-center rounded text-[#7A7A7A] hover:text-white
                 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          v-for="p in pageButtons"
          :key="p"
          @click="goPage(p)"
          class="w-8 h-8 rounded font-montserrat text-xs transition-colors"
          :class="p === currentPage
            ? 'bg-[#529B26] text-white'
            : 'text-[#7A7A7A] hover:text-white hover:bg-white/10'"
        >
          {{ p }}
        </button>
        <button
          @click="goPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="w-8 h-8 flex items-center justify-center rounded text-[#7A7A7A] hover:text-white
                 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </template>
    </div>

    <!-- ─── EDIT DIALOG ─── -->
    <Transition name="dialog">
      <div
        v-if="editingRow"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="editingRow = null"
      >
        <div class="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl p-6 w-[420px] shadow-2xl">
          <h3 class="text-white font-montserrat font-semibold text-base mb-4">
            Edit Anomaly — <span class="text-[#529B26]">{{ editingRow.location }}</span>
          </h3>
          <div class="flex flex-col gap-3">
            <div>
              <label class="text-[#A7A7A7] font-inter text-xs mb-1 block">Detection Status</label>
              <BaseSelect
                v-model="editForm.detectionStatus"
                :options="detectionStatusOptions"
                labelKey="label"
                valueKey="value"
                customClass="bg-white/10 border-[#3a3a3a] text-white font-inter text-sm rounded-lg"
                customDropdownClass="bg-[#1e1e1e] border-[#3a3a3a]"
              />
            </div>
            <div>
              <label class="text-[#A7A7A7] font-inter text-xs mb-1 block">Anomaly Type</label>
              <BaseSelect
                v-model="editForm.anomalyType"
                :options="anomalyTypeOptions"
                customClass="bg-white/10 border-[#3a3a3a] text-white font-inter text-sm rounded-lg"
                customDropdownClass="bg-[#1e1e1e] border-[#3a3a3a]"
              />
            </div>
            <div>
              <label class="text-[#A7A7A7] font-inter text-xs mb-1 block">Repaired Status</label>
              <BaseSelect
                v-model="editForm.repairedStatus"
                :options="repairedStatusOptions"
                customClass="bg-white/10 border-[#3a3a3a] text-white font-inter text-sm rounded-lg"
                customDropdownClass="bg-[#1e1e1e] border-[#3a3a3a]"
              />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-5">
            <button @click="editingRow = null"
              class="px-4 py-2 rounded-lg font-montserrat font-semibold text-sm text-[#A7A7A7]
                     border border-[#5D5D5D] hover:text-white transition-colors">
              Cancel
            </button>
            <button @click="saveEdit"
              class="px-4 py-2 rounded-lg font-montserrat font-semibold text-sm text-white
                     bg-[#529B26] hover:bg-[#6cc537] transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import FluTableView from '../../fluentui/FluTableView.vue'
import AnomalyFilterPanel from './components/AnomalyFilterPanel.vue'
const FluTableViewAny = FluTableView as any

interface TableColumn {
  title: string
  key: string
  width?: string
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface SimRun {
  value: string
  label: string
}

interface AnomalyRow {
  id: number
  detectionTime: string
  location: string
  systemAnomalyType: string
  accuracy: string
  volume: string | number
  detectionStatus: 'Identified' | 'Abnormal' | 'False Alert'
  anomalyType: 'Leak' | 'Clog' | 'Pilferage' | 'Excess' | 'N/A'
  repairedStatus: 'repaired' | 'not repaired'
}

// Removed old Column interface and columns array as they are replaced by displayColumns


// ─── State ────────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10

const simulationRuns = ref<SimRun[]>([
  { value: '2025-01-15T08:00:00', label: '01-15-2025 08:00:00' },
  { value: '2025-02-20T14:30:00', label: '02-20-2025 14:30:00' },
  { value: '2025-03-05T09:15:00', label: '03-05-2025 09:15:00' },
])
const selectedRunDate = ref(simulationRuns.value[simulationRuns.value.length - 1]?.value ?? '')

// Demo / placeholder data rows
const allRows = ref<AnomalyRow[]>([
  { id: 1,  detectionTime: '01-15-2025 08:01:22', location: 'PIPE-001', systemAnomalyType: 'Leak',       accuracy: '87%', volume: 142,  detectionStatus: 'Identified',  anomalyType: 'Leak',       repairedStatus: 'not repaired' },
  { id: 2,  detectionTime: '01-15-2025 08:03:45', location: 'PIPE-008', systemAnomalyType: 'Clog',       accuracy: '72%', volume: 56,   detectionStatus: 'Abnormal',    anomalyType: 'Clog',       repairedStatus: 'not repaired' },
  { id: 3,  detectionTime: '01-15-2025 08:10:01', location: 'JUNC-012', systemAnomalyType: 'Excess',     accuracy: '65%', volume: 301,  detectionStatus: 'False Alert', anomalyType: 'Excess',     repairedStatus: 'not repaired' },
  { id: 4,  detectionTime: '01-15-2025 08:22:17', location: 'PIPE-023', systemAnomalyType: 'Leak',       accuracy: '91%', volume: 220,  detectionStatus: 'Identified',  anomalyType: 'Leak',       repairedStatus: 'repaired'     },
  { id: 5,  detectionTime: '01-15-2025 08:34:09', location: 'PIPE-031', systemAnomalyType: 'Pilferage',  accuracy: '78%', volume: 88,   detectionStatus: 'Identified',  anomalyType: 'Pilferage',  repairedStatus: 'not repaired' },
  { id: 6,  detectionTime: '01-15-2025 09:00:54', location: 'JUNC-007', systemAnomalyType: 'Clog',       accuracy: '55%', volume: 19,   detectionStatus: 'False Alert', anomalyType: 'N/A',        repairedStatus: 'not repaired' },
  { id: 7,  detectionTime: '01-15-2025 09:11:30', location: 'PIPE-044', systemAnomalyType: 'Leak',       accuracy: '83%', volume: 178,  detectionStatus: 'Abnormal',    anomalyType: 'Leak',       repairedStatus: 'not repaired' },
  { id: 8,  detectionTime: '01-15-2025 09:27:48', location: 'PIPE-055', systemAnomalyType: 'Excess',     accuracy: '69%', volume: 264,  detectionStatus: 'Identified',  anomalyType: 'Excess',     repairedStatus: 'repaired'     },
  { id: 9,  detectionTime: '01-15-2025 10:03:12', location: 'JUNC-020', systemAnomalyType: 'Pilferage',  accuracy: '88%', volume: 135,  detectionStatus: 'Identified',  anomalyType: 'Pilferage',  repairedStatus: 'not repaired' },
  { id: 10, detectionTime: '01-15-2025 10:44:55', location: 'PIPE-067', systemAnomalyType: 'Clog',       accuracy: '76%', volume: 42,   detectionStatus: 'Abnormal',    anomalyType: 'Clog',       repairedStatus: 'not repaired' },
  { id: 11, detectionTime: '01-15-2025 11:15:03', location: 'PIPE-078', systemAnomalyType: 'Leak',       accuracy: '94%', volume: 312,  detectionStatus: 'Identified',  anomalyType: 'Leak',       repairedStatus: 'not repaired' },
  { id: 12, detectionTime: '01-15-2025 11:58:22', location: 'JUNC-034', systemAnomalyType: 'Excess',     accuracy: '61%', volume: 98,   detectionStatus: 'False Alert', anomalyType: 'N/A',        repairedStatus: 'not repaired' },
])

// ─── Filter Options state ───
const detectionStatusOptions = [
  { value: 'Identified', label: 'Identified', color: 'text-[#FFFFFF]' },
  { value: 'Abnormal', label: 'Abnormal', color: 'text-[#FFFFFF]' },
  { value: 'False Alert', label: 'False Alert', color: 'text-[#FFFFFF]' }
]
const anomalyTypeOptions = ['Leak', 'Clog', 'Pilferage', 'Excess', 'N/A']
const systemAnomalyTypeOptions = ['Leak', 'Clog', 'Pilferage', 'Excess'] // No N/A
const repairedStatusOptions = ['repaired', 'not repaired']
const volumeOptions = ['< 50 L', '50 - 200 L', '> 200 L']
const networkTypeOptions = ['Pipe', 'Junction', 'Pump', 'Valve', 'Tank']
const confidenceOptions = [
  { label: '> 50%', value: 50 },
  { label: '> 70%', value: 70 },
  { label: '> 90%', value: 90 },
]
const lengthOptions = ['< 10m', '10m - 50m', '> 50m']
const diameterOptions = ['< 100mm', '100mm - 300mm', '> 300mm']
const materialOptions = ['PVC', 'Ductile Iron', 'Steel', 'HDPE']

// Active filters state
const filters = ref({
  detectionStatus: ['Identified', 'Abnormal', 'False Alert'], // default selected
  systemAnomalyType: [] as string[],
  repairedStatus: [] as string[],
  anomalyType: [] as string[],
  volume: [] as string[],
  networkType: [] as string[],
  confidenceLevel: null as number | null,
  length: [] as string[],
  diameter: [] as string[],
  material: [] as string[]
})

const clearFilters = () => {
  filters.value = {
    detectionStatus: ['Identified', 'Abnormal', 'False Alert'],
    systemAnomalyType: [],
    repairedStatus: [],
    anomalyType: [],
    volume: [],
    networkType: [],
    confidenceLevel: null,
    length: [],
    diameter: [],
    material: []
  }
}

const sortKey   = ref<keyof AnomalyRow | ''>('')
const sortDir   = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const workOrderMode = ref(false)
const selectedRows = ref<Set<number>>(new Set())
const selectAll    = ref(false)
const editingRow   = ref<AnomalyRow | null>(null)
const editForm     = reactive({ detectionStatus: '', anomalyType: '', repairedStatus: '' })

const displayColumns = computed<TableColumn[]>(() => {
  const cols: TableColumn[] = []
  
  if (workOrderMode.value) {
    cols.push({ title: '', key: 'checkbox', width: '40px' })
  }
  
  cols.push(
    { key: 'detectionTime',      title: 'Initial Report Date', width: '13%' },
    { key: 'location',           title: 'Location',            width: '10%' },
    { key: 'systemAnomalyType',  title: 'System Anomaly Type', width: '15%' },
    { key: 'accuracy',           title: 'Conf. Lvl',           width: '8%'  },
    { key: 'volume',             title: 'Volume',              width: '8%'  },
    { key: 'detectionStatus',    title: 'Detection Status',    width: '13%' },
    { key: 'anomalyType',        title: 'Anomaly Type',        width: '10%' },
    { key: 'repairedStatus',     title: 'Repaired Status',     width: '13%' },
    { key: 'action',             title: 'Options',             width: '8%'  }
  )
  
  return cols
})

// ─── Filtered + sorted rows ────────────────────────────────────────────────
const filteredRows = computed(() => {
  let rows = allRows.value.filter(row => {
    // detectionStatus
    if (filters.value.detectionStatus.length > 0 && !filters.value.detectionStatus.includes(row.detectionStatus)) return false
    
    // systemAnomalyType
    if (filters.value.systemAnomalyType.length > 0 && !filters.value.systemAnomalyType.includes(row.systemAnomalyType)) return false
    
    // repairedStatus
    if (filters.value.repairedStatus.length > 0 && !filters.value.repairedStatus.includes(row.repairedStatus)) return false
    
    // anomalyType
    if (filters.value.anomalyType.length > 0 && !filters.value.anomalyType.includes(row.anomalyType)) return false
    
    // volume (simple numeric parsing and binning for demo)
    if (filters.value.volume.length > 0) {
      const v = typeof row.volume === 'number' ? row.volume : parseInt(row.volume as string)
      let match = false
      if (filters.value.volume.includes('< 50 L') && v < 50) match = true
      if (filters.value.volume.includes('50 - 200 L') && v >= 50 && v <= 200) match = true
      if (filters.value.volume.includes('> 200 L') && v > 200) match = true
      if (!match) return false
    }

    // networkType (infer from location string for demo)
    if (filters.value.networkType.length > 0) {
      const rowNetType = row.location.startsWith('PIPE') ? 'Pipe' 
                       : (row.location.startsWith('JUNC') ? 'Junction' : 'Other')
      if (!filters.value.networkType.includes(rowNetType)) return false
    }

    // confidenceLevel - "accuracy" column parsing (e.g. '87%')
    if (filters.value.confidenceLevel !== null) {
      const acc = parseInt(row.accuracy.replace('%', ''))
      if (!isNaN(acc) && acc <= filters.value.confidenceLevel) return false
    }

    return true
  })

  if (sortKey.value) {
    const k = sortKey.value
    rows = [...rows].sort((a, b) => {
      const av = String(a[k]), bv = String(b[k])
      return sortDir.value === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }
  return rows
})

// ─── Pagination ────────────────────────────────────────────────────────────
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / ITEMS_PER_PAGE)))

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filteredRows.value.slice(start, start + ITEMS_PER_PAGE)
})

const pageButtons = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  const pages: number[] = []
  const range = 2
  for (let p = Math.max(1, cur - range); p <= Math.min(total, cur + range); p++) pages.push(p)
  return pages
})

// ─── Summary / donut ──────────────────────────────────────────────────────
const summary = computed(() => {
  const all = filteredRows.value
  return {
    total:      all.length,
    identified: all.filter(r => r.detectionStatus === 'Identified').length,
    abnormal:   all.filter(r => r.detectionStatus === 'Abnormal').length,
    falseAlert: all.filter(r => r.detectionStatus === 'False Alert').length,
  }
})
const identifiedPct  = computed(() => summary.value.total ? (summary.value.identified  / summary.value.total) * 100 : 0)
const abnormalPct    = computed(() => summary.value.total ? (summary.value.abnormal    / summary.value.total) * 100 : 0)
const falseAlertPct  = computed(() => summary.value.total ? (summary.value.falseAlert  / summary.value.total) * 100 : 0)

// ─── Helpers ─────────────────────────────────────────────────────────────
const detectionStatusColor = (s: string) => {
  if (s === 'Identified')  return 'text-[#529B26]'
  if (s === 'Abnormal')    return 'text-[#BEAE00]'
  if (s === 'False Alert') return 'text-[#CE7829]'
  return 'text-white'
}
const repairStatusColor = (s: string) => {
  if (s === 'repaired')     return 'text-[#529B26]'
  if (s === 'not repaired') return 'text-[#BEAE00]'
  return 'text-white'
}

const setSort = (key: keyof AnomalyRow) => {
  if (sortKey.value === key) { sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc' }
  else { sortKey.value = key; sortDir.value = 'asc' }
  currentPage.value = 1
}

const goPage = (p: number) => {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}

const toggleWorkOrderMode = () => {
  workOrderMode.value = !workOrderMode.value
  if (!workOrderMode.value) { selectedRows.value.clear(); selectAll.value = false }
}
const toggleSelectAll = () => {
  if (selectAll.value) { pagedRows.value.forEach(r => selectedRows.value.add(r.id)) }
  else { selectedRows.value.clear() }
}
const toggleRow = (id: number) => {
  if (selectedRows.value.has(id)) selectedRows.value.delete(id)
  else selectedRows.value.add(id)
}

const generateSelected = () => {
  console.log('Generate Work Order for:', [...selectedRows.value])
}
const showInMap = (location: string) => {
  console.log('Show in map:', location)
}

const openEditor = (row: AnomalyRow) => {
  editingRow.value = row
  editForm.detectionStatus = row.detectionStatus
  editForm.anomalyType     = row.anomalyType
  editForm.repairedStatus  = row.repairedStatus
}
const saveEdit = () => {
  if (!editingRow.value) return
  const idx = allRows.value.findIndex(r => r.id === editingRow.value!.id)
  if (idx !== -1) {
    allRows.value[idx] = {
      ...allRows.value[idx],
      detectionStatus: editForm.detectionStatus as AnomalyRow['detectionStatus'],
      anomalyType:     editForm.anomalyType     as AnomalyRow['anomalyType'],
      repairedStatus:  editForm.repairedStatus  as AnomalyRow['repairedStatus'],
    }
  }
  editingRow.value = null
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.dialog-enter-active, .dialog-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.dialog-enter-from, .dialog-leave-to { opacity: 0; transform: scale(0.95); }

/* Custom scrollbar for table */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #529B26; }
</style>
