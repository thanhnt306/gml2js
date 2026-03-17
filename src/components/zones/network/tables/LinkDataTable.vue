<template>
  <div class="flex flex-col h-full">
    <!-- Table -->
    <div class="flex-1 overflow-auto custom-scrollbar">
      <table class="w-full border-collapse text-xs font-inter">
        <thead class="sticky top-0 z-10 bg-[#5C5C5C]">
          <tr>
            <th
              v-for="col in columns" :key="col.key"
              class="px-3 py-3 text-center text-white font-montserrat font-medium border border-[#7A7A7A]/50 cursor-pointer hover:bg-white/10 select-none"
              :style="col.widthClass ? { width: col.widthClass } : {}"
              @click="col.sortable && toggleSort(col.key)"
            >
              <span class="flex items-center justify-center gap-1">
                {{ col.label }}
                <span v-if="col.sortable" class="text-[10px] text-[#A7A7A7]">
                  {{ sortKey === col.key ? (sortAsc ? '▲' : '▼') : '⇅' }}
                </span>
              </span>
            </th>
            <th class="px-3 py-3 text-center text-white font-montserrat font-medium border border-[#7A7A7A]/50 w-28">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in paginatedRows"
            :key="i"
            class="border-b border-[#7A7A7A]/30 hover:bg-white/5 transition-colors"
            :class="selectedRow === i ? 'bg-white/10' : ''"
            @click="selectedRow = i"
          >
            <!-- Location -->
            <td class="px-2 py-2 border-r border-[#7A7A7A]/30">
              <button
                class="w-full text-center bg-[#959595] hover:bg-[#858585] text-black font-semibold font-inter text-xs px-2 py-1 rounded transition-colors truncate"
                @dblclick="$emit('show-in-map', row.label)"
                :title="row.label"
              >{{ row.label }}</button>
            </td>
            <td class="px-2 py-2 text-center text-black border-r border-[#7A7A7A]/30 truncate" :title="String(row.start_node)">{{ row.start_node }}</td>
            <td class="px-2 py-2 text-center text-black border-r border-[#7A7A7A]/30 truncate" :title="String(row.stop_node)">{{ row.stop_node }}</td>
            <td class="px-2 py-2 text-center text-black border-r border-[#7A7A7A]/30">{{ row.length }}</td>
            <td class="px-2 py-2 text-center text-black border-r border-[#7A7A7A]/30">{{ row.diameter }}</td>
            <td class="px-2 py-2 text-center text-black border-r border-[#7A7A7A]/30">{{ row.material }}</td>
            <td class="px-2 py-2 text-center text-black border-r border-[#7A7A7A]/30">{{ row.status }}</td>
            <!-- Actions -->
            <td class="px-2 py-2 text-center border-r border-[#7A7A7A]/30">
              <div class="flex items-center justify-center gap-1">
                <button
                  @click.stop="$emit('delete', row.label)"
                  class="px-2 py-0.5 rounded text-white text-xs bg-[#CA6409] hover:bg-orange-500 transition-colors"
                >Delete</button>
                <button
                  @click.stop="$emit('edit', row)"
                  class="px-2 py-0.5 rounded text-white text-xs bg-[#529B26] hover:bg-[#6cc537] transition-colors"
                >Edit</button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedRows.length === 0">
            <td colspan="8" class="py-12 text-center text-[#5D5D5D] font-inter text-sm">No link data available.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex-none bg-[#A5A5A5]/10 border-t border-[#7A7A7A]/30 px-4 py-2 flex items-center justify-center gap-2">
      <button @click="goToPage(1)" :disabled="currentPage === 1" class="pagination-btn">«</button>
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="pagination-btn">‹</button>
      <button
        v-for="p in visiblePages"
        :key="p"
        @click="goToPage(p)"
        class="pagination-btn"
        :class="p === currentPage ? 'bg-[#529B26] text-white' : ''"
      >{{ p }}</button>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === pageCount" class="pagination-btn">›</button>
      <button @click="goToPage(pageCount)" :disabled="currentPage === pageCount" class="pagination-btn">»</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface LinkRow {
  label: string
  start_node: string
  stop_node: string
  length: string | number
  diameter: string | number
  material: string
  status: string
}

const props = withDefaults(defineProps<{
  rows?: LinkRow[]
  itemsPerPage?: number
}>(), {
  rows: () => [],
  itemsPerPage: 100
})

defineEmits<{
  'show-in-map': [label: string]
  'edit': [row: LinkRow]
  'delete': [label: string]
}>()

const columns = [
  { key: 'label',    label: 'Location',     sortable: true,  widthClass: '14%' },
  { key: 'start_node', label: 'Start Node', sortable: true,  widthClass: '12%' },
  { key: 'stop_node',  label: 'Stop Node',  sortable: true,  widthClass: '12%' },
  { key: 'length',   label: 'Length (m)',   sortable: true,  widthClass: '10%' },
  { key: 'diameter', label: 'Diameter (m)', sortable: true,  widthClass: '9%'  },
  { key: 'material', label: 'Material',     sortable: true,  widthClass: '9%'  },
  { key: 'status',   label: 'Status',       sortable: false, widthClass: '22%' },
]

const currentPage = ref(1)
const selectedRow = ref(-1)
const sortKey = ref('')
const sortAsc = ref(true)

const toggleSort = (key: string) => {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else { sortKey.value = key; sortAsc.value = true }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const av = a[sortKey.value as keyof LinkRow] ?? ''
    const bv = b[sortKey.value as keyof LinkRow] ?? ''
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
