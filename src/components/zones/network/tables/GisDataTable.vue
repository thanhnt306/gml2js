<template>
  <div class="flex flex-col h-full">
    <!-- Table using FluTableView -->
    <div class="flex-1 overflow-hidden">
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
        <!-- Column mappings using slots -->
        <template #index="{ rowIndex }">
          <span class="text-[#1A1A1A] font-inter text-[13px] font-semibold">{{ startIndex + rowIndex + 1 }}</span>
        </template>

        <template #issue="{ item }">
          <button
            class="w-[90%] max-w-[200px] text-center bg-[#B5B5B5] text-[#1A1A1A] font-inter text-[13px] px-2 py-[2px] rounded border border-[#A5A5A5] truncate focus:outline-none"
            @dblclick="$emit('show-in-map', item.related_obj_id ?? '')"
            :title="item.issue"
          >
            {{ item.issue }}
          </button>
        </template>

        <template #severity="{ item }">
          <span
            v-if="item.severity"
            class="inline-block px-4 py-[2px] rounded-full border-[1.5px] text-[13px] font-inter bg-transparent"
            :class="item.severity === 'CRITICAL'
              ? 'border-[#E04F4F] text-[#E04F4F]'
              : 'border-[#DC8230] text-[#DC8230]'"
          >
            {{ item.severity === 'CRITICAL' ? 'Critical Impact' : 'Minor Impact' }}
          </span>
        </template>
      </FluTableViewAny>
      
      <div v-if="paginatedRows.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span class="text-[#5D5D5D] font-inter text-sm">No GIS issues found.</span>
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
import type { GisRow } from './types'
const FluTableViewAny = FluTableView as any

interface TableColumn {
  title: string
  key: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

const props = withDefaults(defineProps<{
  rows?: GisRow[]
  itemsPerPage?: number
}>(), {
  rows: () => [
    { issue: 'Point Outside Zone', description: 'Node J-12 is located outside the defined boundary of Zone 1.', severity: 'CRITICAL', related_obj_id: 'J-12',  related_junction_ids: ['J-12'],       related_pipeline_ids: [] },
    { issue: 'Disconnected Pipe',  description: 'Pipe P-45 has no downstream connection.',                       severity: 'IMPACTED', related_obj_id: 'P-45',  related_junction_ids: [],              related_pipeline_ids: ['P-45'] },
    { issue: 'Duplicate Node',     description: 'Nodes J-101 and J-102 have identical coordinates.',             severity: 'IMPACTED', related_obj_id: 'J-101', related_junction_ids: ['J-101','J-102'], related_pipeline_ids: [] },
    { issue: 'Missing Elevation',  description: 'Junction J-88 has an elevation of 0, which may be incorrect.', severity: '',         related_obj_id: 'J-88',  related_junction_ids: ['J-88'],         related_pipeline_ids: [] },
    { issue: 'Isolated Network',   description: 'A cluster of 5 nodes and 4 pipes is not connected to any reservoir.', severity: 'CRITICAL', related_obj_id: 'RES-1', related_junction_ids: [], related_pipeline_ids: [] },
  ],
  itemsPerPage: 10
})

defineEmits<{ 'show-in-map': [id: string] }>()

const currentPage = ref(1)

const displayColumns: TableColumn[] = [
  { title: 'No', key: 'index', width: '8%', align: 'left' },
  { title: 'Issue', key: 'issue', width: '25%', align: 'center' },
  { title: 'Description', key: 'description', align: 'left' },
  { title: 'Severity', key: 'severity', width: '22%', align: 'center' },
]

const pageCount = computed(() => Math.max(1, Math.ceil(props.rows.length / props.itemsPerPage)))
const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage)
const paginatedRows = computed(() => props.rows.slice(startIndex.value, startIndex.value + props.itemsPerPage))

const visiblePages = computed(() => {
  const pages = []
  const total = pageCount.value
  const cur = currentPage.value
  const start = Math.max(1, cur - 2)
  const end = Math.min(total, cur + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const goToPage = (p: number) => {
  currentPage.value = Math.max(1, Math.min(pageCount.value, p))
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
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
