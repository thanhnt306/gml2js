<template>
  <div class="flex flex-col h-full">
    <!-- Table -->
    <div class="flex-1 overflow-auto custom-scrollbar">
      <table class="w-full border-collapse text-xs font-inter">
        <thead class="sticky top-0 z-10 bg-[#5C5C5C]">
          <tr>
            <th class="px-2 py-3 text-center text-white font-montserrat font-medium w-12 border border-[#7A7A7A]/50">No</th>
            <th class="px-3 py-3 text-center text-white font-montserrat font-medium border border-[#7A7A7A]/50">Issue</th>
            <th class="px-3 py-3 text-center text-white font-montserrat font-medium border border-[#7A7A7A]/50">Description</th>
            <th class="px-3 py-3 text-center text-white font-montserrat font-medium w-36 border border-[#7A7A7A]/50">Severity</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in paginatedRows"
            :key="i"
            class="border-b border-[#7A7A7A]/30 hover:bg-white/5 transition-colors"
            :class="selectedRow === i ? 'bg-white/10' : 'bg-[#A5A5A5]/10'"
            @click="selectedRow = i"
          >
            <td class="px-2 py-2 text-center text-[#A7A7A7] border-r border-[#7A7A7A]/30">{{ startIndex + i + 1 }}</td>
            <td class="px-3 py-2 border-r border-[#7A7A7A]/30">
              <button
                class="w-full text-center bg-[#959595] hover:bg-[#858585] text-black font-semibold font-inter text-xs px-2 py-1 rounded transition-colors truncate"
                @dblclick="$emit('show-in-map', row.related_obj_id ?? '')"
                :title="row.issue"
              >
                {{ row.issue }}
              </button>
            </td>
            <td class="px-3 py-2 text-[#A7A7A7] border-r border-[#7A7A7A]/30 truncate max-w-0" :title="row.description">
              {{ row.description }}
            </td>
            <td class="px-2 py-2 text-center border-r border-[#7A7A7A]/30">
              <span
                v-if="row.severity"
                class="inline-block px-3 py-0.5 rounded-full border text-xs font-inter"
                :class="row.severity === 'CRITICAL'
                  ? 'border-red-600 text-red-500'
                  : 'border-orange-500 text-orange-400'"
              >
                {{ row.severity === 'CRITICAL' ? 'Critical Impact' : 'Minor Impact' }}
              </span>
            </td>
          </tr>
          <tr v-if="paginatedRows.length === 0">
            <td colspan="4" class="py-12 text-center text-[#5D5D5D] font-inter text-sm">No GIS issues found.</td>
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

export interface GisRow {
  issue: string
  description: string
  severity: 'CRITICAL' | 'IMPACTED' | ''
  related_obj_id?: string
}

const props = withDefaults(defineProps<{
  rows?: GisRow[]
  itemsPerPage?: number
}>(), {
  rows: () => [],
  itemsPerPage: 100
})

defineEmits<{ 'show-in-map': [id: string] }>()

const currentPage = ref(1)
const selectedRow = ref(-1)

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
