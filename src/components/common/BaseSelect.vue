<template>
  <div class="relative w-full" ref="selectRef">
    <!-- Select Trigger -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between bg-[#6D6D6D] border border-[#5D5D5D] text-white text-sm rounded px-3 py-2 outline-none focus:border-[#529B26] transition-colors"
      :class="{ 'border-[#529B26]': isOpen }"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <img 
        src="@/assets/images/expand_down_white_24x24.svg" 
        class="w-4 h-4 opacity-70 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Options Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-[#6D6D6D] border border-[#5D5D5D] rounded shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto custom-scrollbar"
    >
      <div
        v-for="option in options"
        :key="getOptionValue(option)"
        @click="selectOption(option)"
        class="px-3 py-2 text-sm text-white cursor-pointer transition-colors"
        :class="[
          isSelected(option) ? 'bg-[#529B26]/60' : 'hover:bg-[#529B26]/30',
          'hover:text-white'
        ]"
      >
        {{ getOptionLabel(option) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Props {
  modelValue: any
  options: any[]
  labelKey?: string
  valueKey?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select option'
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const getOptionLabel = (option: any) => {
  if (typeof option === 'string') return option
  return props.labelKey ? option[props.labelKey] : option.label || option
}

const getOptionValue = (option: any) => {
  if (typeof option === 'string') return option
  return props.valueKey ? option[props.valueKey] : option.value || option
}

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => getOptionValue(opt) === props.modelValue)
  return selected ? getOptionLabel(selected) : props.placeholder
})

const isSelected = (option: any) => {
  return getOptionValue(option) === props.modelValue
}

const selectOption = (option: any) => {
  emit('update:modelValue', getOptionValue(option))
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4B5563;
  border-radius: 10px;
}
</style>
