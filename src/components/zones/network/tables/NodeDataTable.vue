<template>
  <div class="flex flex-col h-full">
    <!-- Table using FluTableView -->
    <div class="flex-1 overflow-auto max-h-[476px] custom-scrollbar">
      <FluTableViewAny
        v-if="paginatedRows.length > 0"
        :columns="displayColumns" 
        :items="paginatedRows" 
        theme="light"
        striped
        headerBgColor="#5D5D5D"
        headerFlush
        class="h-full bg-[#E5E5E5] rounded-[4px]"
      >
        <!-- Location slot -->
        <template #label="{ item }">
          <button
            class="w-[90%] text-center bg-[#B5B5B5] text-[#1A1A1A] font-inter text-[13px] px-2 py-[2px] rounded border border-[#A5A5A5] truncate focus:outline-none"
            @dblclick="$emit('show-in-map', item.label)"
            :title="item.label"
          >{{ item.label }}</button>
        </template>

        <!-- Action slot -->
        <template #action="{ item }">
          <button
            @click.stop="$emit('edit', item)"
            class="px-5 py-1 rounded text-white text-[13px] font-inter bg-[#529B26] hover:bg-[#6cc537] transition-colors"
          >Edit</button>
        </template>
      </FluTableViewAny>

      <div v-if="paginatedRows.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span class="text-[#5D5D5D] font-inter text-sm">No node data available.</span>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex-none pt-3 flex items-center justify-center gap-3 bg-transparent pb-1">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="text-[#7A7A7A] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
      </button>
      <button
        v-for="p in visiblePages"
        :key="p"
        @click="goToPage(p)"
        class="text-[13px] font-montserrat w-6 h-6 flex items-center justify-center rounded transition-colors"
        :class="p === currentPage ? 'text-white font-bold' : 'text-[#7A7A7A] hover:text-white'"
      >{{ p }}</button>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === pageCount" class="text-[#7A7A7A] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FluTableView from '../../../fluentui/FluTableView.vue'
const FluTableViewAny = FluTableView as any

interface TableColumn {
  title: string
  key: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface NodeRow {
  label: string
  elevation: string | number
  latitude: string | number
  longitude: string | number
  status: string
}

const props = withDefaults(defineProps<{
  rows?: NodeRow[]
  itemsPerPage?: number
}>(), {
  rows: () => [
    { label: 'J-1',   elevation: 45.2, latitude: 21.0285, longitude: 105.8542, status: 'Active' },
    { label: 'J-2',   elevation: 44.8, latitude: 21.0290, longitude: 105.8550, status: 'Active' },
    { label: 'J-3',   elevation: 46.1, latitude: 21.0295, longitude: 105.8560, status: 'Maintenance' },
    { label: 'J-4',   elevation: 43.5, latitude: 21.0300, longitude: 105.8570, status: 'Active' },
    { label: 'J-5',   elevation: 42.9, latitude: 21.0310, longitude: 105.8580, status: 'Active' },
    { label: 'RES-1', elevation: 50.0, latitude: 21.0320, longitude: 105.8600, status: 'Active (Source)' },
    { label: 'J-6',   elevation: 44.5, latitude: 21.0270, longitude: 105.8530, status: 'Inactive' },
    { label: 'J-7',   elevation: 45.0, latitude: 21.0260, longitude: 105.8520, status: 'Active' },
  ],
  itemsPerPage: 100
})

defineEmits<{
  'show-in-map': [label: string]
  'edit': [row: NodeRow]
}>()

const displayColumns: TableColumn[] = [
  { key: 'label',     title: 'Location',   width: '18%', align: 'center' },
  { key: 'elevation', title: 'Elev(m)',    width: '12%', align: 'center' },
  { key: 'latitude',  title: 'Latitude',   width: '12%', align: 'center' },
  { key: 'longitude', title: 'Longitude',  width: '12%', align: 'center' },
  { key: 'status',    title: 'Status',     width: '36%', align: 'left'   },
  { key: 'action',    title: 'Action',     width: '10%', align: 'center' }
]

const currentPage = ref(1)
const sortKey = ref('')
const sortAsc = ref(true)

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const av = a[sortKey.value as keyof NodeRow] ?? ''
    const bv = b[sortKey.value as keyof NodeRow] ?? ''
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sortAsc.value ? cmp : -cmp
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / props.itemsPerPage)))
const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage)
const paginatedRows = computed(() => sortedRows.value.slice(startIndex.value, startIndex.value + props.itemsPerPage))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(pageCount.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const goToPage = (p: number) => {
  currentPage.value = Math.max(1, Math.min(pageCount.value, p))
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4B5563; border-radius: 10px; }
.pagination-btn {
  width: 2rem;
  height: 2rem;
  font-size: 0.75rem;
  color: #7A7A7A;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s;
  cursor: pointer;
  background: transparent;
  border: none;
}
.pagination-btn:hover {
  background-color: rgba(255,255,255,0.1);
}
.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
