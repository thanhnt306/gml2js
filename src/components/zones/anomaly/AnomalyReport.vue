<template>
  <div class="w-full flex flex-col gap-3 min-h-0">

    <!-- ─── HEADER ROW ─── -->
    <div class="grid grid-cols-3 items-center gap-4">
      <!-- Left: run date selector -->
      <div class="flex flex-col gap-1">
        <span class="text-[#529B26] font-montserrat font-light text-xs">Run analysis date:</span>
        <div class="flex items-center gap-2">
          <select
            v-model="selectedRunDate"
            class="bg-[#1A529B26] text-[#529B26] font-montserrat font-semibold text-xs
                   rounded px-3 py-1 border-none focus:outline-none cursor-pointer"
          >
            <option v-for="run in simulationRuns" :key="run.value" :value="run.value">
              {{ run.label }}
            </option>
            <option v-if="simulationRuns.length === 0" value="" disabled>No runs available</option>
          </select>
          <span class="bg-[#1A529B26] text-[#529B26] font-montserrat font-semibold text-[10px] px-2 py-0.5 rounded">
            Latest
          </span>
        </div>
      </div>

      <!-- Center: overview donut widget -->
      <div class="flex flex-col items-center gap-2">
        <span class="text-white font-montserrat font-semibold text-sm">Total Detected Anomalies</span>
        <!-- Donut chart -->
        <div class="relative w-24 h-24">
          <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
            <!-- background ring -->
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ffffff18" stroke-width="3"/>
            <!-- Identified (green) -->
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#529B26" stroke-width="3"
              :stroke-dasharray="`${identifiedPct} ${100 - identifiedPct}`"
              stroke-dashoffset="0" stroke-linecap="round"/>
            <!-- Abnormal (yellow) -->
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#BEAE00" stroke-width="3"
              :stroke-dasharray="`${abnormalPct} ${100 - abnormalPct}`"
              :stroke-dashoffset="`${-identifiedPct}`" stroke-linecap="round"/>
            <!-- False Alert (orange) -->
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#CE7829" stroke-width="3"
              :stroke-dasharray="`${falseAlertPct} ${100 - falseAlertPct}`"
              :stroke-dashoffset="`${-(identifiedPct + abnormalPct)}`" stroke-linecap="round"/>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-white font-montserrat font-bold text-lg leading-none">{{ summary.total }}</span>
            <span class="text-[#A7A7A7] font-inter text-[9px]">anomalies</span>
          </div>
        </div>
        <!-- Legend -->
        <div class="flex gap-3">
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#529B26] flex-shrink-0"/>
            <span class="text-[#529B26] font-inter text-[10px]">Identified ({{ summary.identified }})</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#BEAE00] flex-shrink-0"/>
            <span class="text-[#BEAE00] font-inter text-[10px]">Abnormal ({{ summary.abnormal }})</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#CE7829] flex-shrink-0"/>
            <span class="text-[#CE7829] font-inter text-[10px]">False Alert ({{ summary.falseAlert }})</span>
          </div>
        </div>
      </div>

      <!-- Right: empty (reserved) -->
      <div/>
    </div>

    <!-- ─── TOOLBAR ─── -->
    <div class="bg-white/10 rounded px-3 py-1.5 flex items-center gap-2">
      <!-- Generate Work Order toggle -->
      <button
        @click="toggleWorkOrderMode"
        class="px-3 py-1 rounded font-montserrat font-semibold text-xs transition-colors duration-150"
        :class="workOrderMode
          ? 'bg-white/20 text-white'
          : 'bg-[#529B26] text-white hover:bg-[#6cc537]'"
      >
        Generate<br/>Work Order
      </button>
      <!-- Generate Selected (only visible in work-order mode) -->
      <button
        v-if="workOrderMode"
        @click="generateSelected"
        class="px-3 py-1 rounded font-montserrat font-semibold text-xs bg-[#529B26] text-white hover:bg-[#6cc537] transition-colors"
      >
        Generate<br/>Selected
      </button>

      <!-- Filter -->
      <div class="relative" ref="filterRef">
        <button
          @click="filterOpen = !filterOpen"
          class="flex items-center gap-1.5 px-3 py-1 rounded bg-white/20 hover:bg-white/30
                 font-montserrat font-normal text-white text-xs transition-colors"
        >
          <!-- funnel icon -->
          <svg class="w-3.5 h-2.5" viewBox="0 0 17 12" fill="white">
            <path d="M0 0h17v2H0zm3 5h11v2H3zm3 5h5v2H6z"/>
          </svg>
          Filter
        </button>
        <!-- Dropdown filter panel -->
        <Transition name="fade">
          <div
            v-if="filterOpen"
            class="absolute left-0 top-full mt-1 z-30 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-3 w-52 shadow-xl"
          >
            <p class="text-[#A7A7A7] font-montserrat text-xs font-semibold mb-2">Detection Status</p>
            <label v-for="f in statusFilters" :key="f.key" class="flex items-center gap-2 py-1 cursor-pointer group">
              <input type="checkbox" v-model="f.checked" class="hidden"/>
              <div
                class="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
                :class="f.checked ? 'border-[#529B26] bg-[#529B26]' : 'border-[#5D5D5D] bg-transparent'"
                @click="f.checked = !f.checked"
              >
                <svg v-if="f.checked" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span class="font-inter text-xs" :class="f.color">{{ f.label }}</span>
            </label>
            <div class="mt-2 pt-2 border-t border-white/10">
              <button @click="filterOpen = false" class="w-full text-center text-[#529B26] text-xs font-montserrat font-semibold">
                Apply
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ─── DATA TABLE ─── -->
    <div class="flex-1 min-h-0 overflow-auto rounded-lg">
      <table class="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr class="bg-[#7A7A7A]/40 text-white font-montserrat font-semibold text-xs">
            <th v-if="workOrderMode" class="px-2 py-3 text-center w-10">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll"
                class="accent-[#529B26] cursor-pointer"/>
            </th>
            <th v-for="col in columns" :key="col.key"
              class="px-3 py-3 text-center cursor-pointer hover:text-[#5DB22A] transition-colors select-none whitespace-nowrap"
              @click="setSort(col.key)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span v-if="sortKey === col.key" class="text-[#529B26]">
                  {{ sortDir === 'asc' ? '↑' : '↓' }}
                </span>
              </span>
            </th>
            <th class="px-3 py-3 text-center">Options</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pagedRows.length === 0">
            <td :colspan="workOrderMode ? columns.length + 2 : columns.length + 1"
              class="py-16 text-center text-[#5D5D5D] font-inter text-sm italic">
              No anomaly data available. Run an analysis first.
            </td>
          </tr>
          <tr
            v-for="(row, idx) in pagedRows"
            :key="row.id"
            class="border-b border-white/5 transition-colors"
            :class="[
              idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.03]',
              selectedRows.has(row.id) ? 'bg-white/10' : 'hover:bg-white/[0.06]'
            ]"
          >
            <td v-if="workOrderMode" class="px-2 py-2 text-center">
              <input type="checkbox" :checked="selectedRows.has(row.id)"
                @change="toggleRow(row.id)" class="accent-[#529B26] cursor-pointer"/>
            </td>
            <td class="px-3 py-2 text-center font-inter text-xs text-white whitespace-nowrap">{{ row.detectionTime }}</td>
            <td class="px-3 py-2 text-center">
              <button
                class="font-inter text-xs text-white bg-white/10 hover:bg-white/20 rounded px-2 py-0.5 transition-colors"
                @dblclick="showInMap(row.location)"
              >
                {{ row.location }}
              </button>
            </td>
            <td class="px-3 py-2 text-center font-inter text-xs text-white">{{ row.systemAnomalyType }}</td>
            <td class="px-3 py-2 text-center font-inter text-xs text-white">{{ row.accuracy }}</td>
            <td class="px-3 py-2 text-center font-inter text-xs text-white">{{ row.volume }}</td>
            <td class="px-3 py-2 text-center font-inter text-xs font-semibold" :class="detectionStatusColor(row.detectionStatus)">
              {{ row.detectionStatus }}
            </td>
            <td class="px-3 py-2 text-center font-inter text-xs text-white">{{ row.anomalyType }}</td>
            <td class="px-3 py-2 text-center font-inter text-xs font-semibold" :class="repairStatusColor(row.repairedStatus)">
              {{ row.repairedStatus }}
            </td>
            <td class="px-3 py-2 text-center">
              <button
                @click="openEditor(row)"
                class="px-2 py-1 text-xs font-montserrat font-semibold text-white bg-[#529B26] hover:bg-[#6cc537]
                       rounded transition-colors"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ─── PAGINATION ─── -->
    <div class="flex items-center justify-center gap-1 py-2">
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
              <select v-model="editForm.detectionStatus"
                class="w-full bg-white/10 border border-[#3a3a3a] text-white font-inter text-sm rounded-lg px-3 py-2
                       focus:outline-none focus:border-[#529B26]">
                <option>Identified</option>
                <option>Abnormal</option>
                <option>False Alert</option>
              </select>
            </div>
            <div>
              <label class="text-[#A7A7A7] font-inter text-xs mb-1 block">Anomaly Type</label>
              <select v-model="editForm.anomalyType"
                class="w-full bg-white/10 border border-[#3a3a3a] text-white font-inter text-sm rounded-lg px-3 py-2
                       focus:outline-none focus:border-[#529B26]">
                <option>Leak</option>
                <option>Clog</option>
                <option>Pilferage</option>
                <option>Excess</option>
                <option>N/A</option>
              </select>
            </div>
            <div>
              <label class="text-[#A7A7A7] font-inter text-xs mb-1 block">Repaired Status</label>
              <select v-model="editForm.repairedStatus"
                class="w-full bg-white/10 border border-[#3a3a3a] text-white font-inter text-sm rounded-lg px-3 py-2
                       focus:outline-none focus:border-[#529B26]">
                <option>not repaired</option>
                <option>repaired</option>
              </select>
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

interface Column {
  key: keyof AnomalyRow
  label: string
}

interface StatusFilter {
  key: string
  label: string
  checked: boolean
  color: string
}

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
  { id: 1,  detectionTime: '01-15-2025 08:01:22', location: 'PIPE-001', systemAnomalyType: 'Pressure Drop',  accuracy: '87%', volume: 142,  detectionStatus: 'Identified',  anomalyType: 'Leak',       repairedStatus: 'not repaired' },
  { id: 2,  detectionTime: '01-15-2025 08:03:45', location: 'PIPE-008', systemAnomalyType: 'Flow Reduction', accuracy: '72%', volume: 56,   detectionStatus: 'Abnormal',    anomalyType: 'Clog',       repairedStatus: 'not repaired' },
  { id: 3,  detectionTime: '01-15-2025 08:10:01', location: 'JUNC-012', systemAnomalyType: 'Excess Flow',    accuracy: '65%', volume: 301,  detectionStatus: 'False Alert', anomalyType: 'Excess',     repairedStatus: 'not repaired' },
  { id: 4,  detectionTime: '01-15-2025 08:22:17', location: 'PIPE-023', systemAnomalyType: 'Pressure Drop',  accuracy: '91%', volume: 220,  detectionStatus: 'Identified',  anomalyType: 'Leak',       repairedStatus: 'repaired'     },
  { id: 5,  detectionTime: '01-15-2025 08:34:09', location: 'PIPE-031', systemAnomalyType: 'Theft Pattern',  accuracy: '78%', volume: 88,   detectionStatus: 'Identified',  anomalyType: 'Pilferage',  repairedStatus: 'not repaired' },
  { id: 6,  detectionTime: '01-15-2025 09:00:54', location: 'JUNC-007', systemAnomalyType: 'Flow Reduction', accuracy: '55%', volume: 19,   detectionStatus: 'False Alert', anomalyType: 'N/A',        repairedStatus: 'not repaired' },
  { id: 7,  detectionTime: '01-15-2025 09:11:30', location: 'PIPE-044', systemAnomalyType: 'Pressure Drop',  accuracy: '83%', volume: 178,  detectionStatus: 'Abnormal',    anomalyType: 'Leak',       repairedStatus: 'not repaired' },
  { id: 8,  detectionTime: '01-15-2025 09:27:48', location: 'PIPE-055', systemAnomalyType: 'Excess Flow',    accuracy: '69%', volume: 264,  detectionStatus: 'Identified',  anomalyType: 'Excess',     repairedStatus: 'repaired'     },
  { id: 9,  detectionTime: '01-15-2025 10:03:12', location: 'JUNC-020', systemAnomalyType: 'Theft Pattern',  accuracy: '88%', volume: 135,  detectionStatus: 'Identified',  anomalyType: 'Pilferage',  repairedStatus: 'not repaired' },
  { id: 10, detectionTime: '01-15-2025 10:44:55', location: 'PIPE-067', systemAnomalyType: 'Flow Reduction', accuracy: '76%', volume: 42,   detectionStatus: 'Abnormal',    anomalyType: 'Clog',       repairedStatus: 'not repaired' },
  { id: 11, detectionTime: '01-15-2025 11:15:03', location: 'PIPE-078', systemAnomalyType: 'Pressure Drop',  accuracy: '94%', volume: 312,  detectionStatus: 'Identified',  anomalyType: 'Leak',       repairedStatus: 'not repaired' },
  { id: 12, detectionTime: '01-15-2025 11:58:22', location: 'JUNC-034', systemAnomalyType: 'Excess Flow',    accuracy: '61%', volume: 98,   detectionStatus: 'False Alert', anomalyType: 'N/A',        repairedStatus: 'not repaired' },
])

const statusFilters = reactive<StatusFilter[]>([
  { key: 'Identified',  label: 'Identified',  checked: true, color: 'text-[#529B26]'  },
  { key: 'Abnormal',    label: 'Abnormal',    checked: true, color: 'text-[#BEAE00]'  },
  { key: 'False Alert', label: 'False Alert', checked: true, color: 'text-[#CE7829]'  },
])

const columns: Column[] = [
  { key: 'detectionTime',      label: 'Initial Report Date' },
  { key: 'location',           label: 'Location'            },
  { key: 'systemAnomalyType',  label: 'System Anomaly Type' },
  { key: 'accuracy',           label: 'Conf. Lvl'           },
  { key: 'volume',             label: 'Volume'              },
  { key: 'detectionStatus',    label: 'Detection Status'    },
  { key: 'anomalyType',        label: 'Anomaly Type'        },
  { key: 'repairedStatus',     label: 'Repaired Status'     },
]

const sortKey   = ref<keyof AnomalyRow | ''>('')
const sortDir   = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const workOrderMode = ref(false)
const selectedRows = ref<Set<number>>(new Set())
const selectAll    = ref(false)
const filterOpen   = ref(false)
const editingRow   = ref<AnomalyRow | null>(null)
const editForm     = reactive({ detectionStatus: '', anomalyType: '', repairedStatus: '' })

// ─── Filtered + sorted rows ────────────────────────────────────────────────
const activeFilters = computed(() =>
  statusFilters.filter(f => f.checked).map(f => f.key)
)

const filteredRows = computed(() => {
  let rows = allRows.value.filter(r => activeFilters.value.includes(r.detectionStatus))
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
