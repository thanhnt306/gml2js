<template>
  <div class="relative w-full" ref="pickerRef">
    <!-- Trigger Input -->
    <div
      class="flex items-center bg-[#1a1a1a] border border-[#5D5D5D] text-white font-montserrat text-xs rounded-lg px-2 py-1.5 focus-within:border-[#529B26] cursor-pointer transition-colors"
      @click="toggle"
    >
      <span class="flex-1 select-none">{{ displayDate || placeholder }}</span>
      <svg class="w-4 h-4 text-[#A7A7A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>

    <!-- Calendar Popup -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="calendarRef"
        class="fixed z-[9999] bg-[#2B2B2B] border border-[#1A1A1A] rounded-lg shadow-2xl p-4 w-[280px] font-montserrat"
        :style="popupStyle"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 px-1">
          <button @click="prevMonth" class="p-1 hover:bg-white/10 rounded-full transition-colors text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <span class="text-white font-semibold text-sm select-none">
            {{ monthNames[viewDate.getMonth()] }} {{ viewDate.getFullYear() }}
          </span>

          <button @click="nextMonth" class="p-1 hover:bg-white/10 rounded-full transition-colors text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Days of week -->
        <div class="grid grid-cols-7 mb-2">
          <span v-for="day in weekDays" :key="day" class="text-center text-[10px] text-[#A7A7A7] font-medium uppercase py-1">
            {{ day }}
          </span>
        </div>

        <!-- Days grid -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="{ date, isCurrentMonth, isSelected, isToday } in calendarDays"
            :key="date.toISOString()"
            @click="selectDate(date)"
            class="h-8 flex items-center justify-center text-xs rounded-full cursor-pointer transition-all relative group"
            :class="[
              isCurrentMonth ? 'text-white' : 'text-white/20',
              isSelected ? 'bg-[#529B26] font-bold' : 'hover:bg-white/10'
            ]"
          >
            {{ date.getDate() }}
            <!-- Today indicator -->
            <div v-if="isToday && !isSelected" class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#529B26] rounded-full"></div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  modelValue: string // YYYY-MM-DD
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pick a date'
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const pickerRef = ref<HTMLElement | null>(null)
const calendarRef = ref<HTMLElement | null>(null)
const popupStyle = ref({})

// The date we are currently viewing in the calendar grid
const viewDate = ref(new Date())

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const displayDate = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue
})

const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date()
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const toggle = async () => {
  if (!isOpen.value) {
    // Sync viewDate with current value
    viewDate.value = parseDate(props.modelValue)
    isOpen.value = true
    await nextTick()
    updatePosition()
  } else {
    isOpen.value = false
  }
}

const updatePosition = () => {
  if (!pickerRef.value) return
  const rect = pickerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const popupHeight = 320 // estimated
  
  if (spaceBelow < popupHeight && rect.top > popupHeight) {
    // Show above
    popupStyle.value = {
      bottom: `${window.innerHeight - rect.top + 4}px`,
      left: `${rect.left}px`
    }
  } else {
    // Show below
    popupStyle.value = {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`
    }
  }
}

const prevMonth = () => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
}

const selectDate = (date: Date) => {
  emit('update:modelValue', formatDate(date))
  isOpen.value = false
}

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  
  // First day of current month
  const firstDay = new Date(year, month, 1)
  // Day of week of first day (0-6)
  const startDay = firstDay.getDay()
  
  // Last day of current month
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  
  // Fill leading days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
      isSelected: false,
      isToday: false
    })
  }
  
  // Fill current month days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selected = parseDate(props.modelValue)
  selected.setHours(0, 0, 0, 0)

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({
      date: d,
      isCurrentMonth: true,
      isSelected: d.getTime() === selected.getTime(),
      isToday: d.getTime() === today.getTime()
    })
  }
  
  // Fill trailing days for next month to complete 6 rows (42 days)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      isSelected: false,
      isToday: false
    })
  }
  
  return days
})

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node
  if (isOpen.value && 
      pickerRef.value && !pickerRef.value.contains(target) &&
      calendarRef.value && !calendarRef.value.contains(target)) {
    isOpen.value = false
  }
}

const handleScroll = () => {
  if (isOpen.value) isOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>
