<template>
  <div class="relative w-full" ref="selectRef">
    <!-- Select Trigger -->
    <button
      type="button"
      @click.stop="toggle"
      :disabled="disabled"
      class="w-full flex items-center justify-between bg-[#6D6D6D] border border-[#5D5D5D] text-white text-sm rounded px-3 py-2 outline-none focus:border-[#529B26] transition-colors"
      :class="{ 
        'border-[#529B26]': isOpen,
        'opacity-50 cursor-not-allowed': disabled
      }"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <img 
        src="@/assets/images/expand_down_white_24x24.svg" 
        class="w-4 h-4 opacity-70 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Options Dropdown Teleported -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="fixed z-[9999] bg-[#6D6D6D] border border-[#5D5D5D] rounded shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto custom-scrollbar"
        :style="dropdownStyle"
      >
        <div
          v-for="option in options"
          :key="getOptionValue(option)"
          @click.stop="selectOption(option)"
          class="px-3 py-2 text-sm text-white cursor-pointer transition-colors"
          :class="[
            isSelected(option) ? 'bg-[#529B26]/60' : 'hover:bg-[#529B26]/30',
            'hover:text-white'
          ]"
        >
          {{ getOptionLabel(option) }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'

interface Props {
  modelValue: any
  options: any[]
  labelKey?: string
  valueKey?: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select option',
  disabled: false
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref({})

const updatePosition = () => {
  if (!selectRef.value || !isOpen.value) return
  const rect = selectRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`
  }
}

const toggle = async () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    updatePosition()
  }
}

const getOptionLabel = (option: any) => {
  if (typeof option === 'string') return option
  return props.labelKey ? option[props.labelKey] : (option.label ?? option)
}

const getOptionValue = (option: any) => {
  if (typeof option === 'string') return option
  return props.valueKey ? option[props.valueKey] : (option.value ?? option)
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
  const target = event.target as Node
  const isClickInSelect = selectRef.value?.contains(target)
  const isClickInDropdown = dropdownRef.value?.contains(target)
  if (!isClickInSelect && !isClickInDropdown) {
    isOpen.value = false
  }
}

const handleScroll = (event: Event) => {
  if (isOpen.value && dropdownRef.value) {
    // If the scroll event originates from inside the dropdown, don't close it
    if (dropdownRef.value.contains(event.target as Node)) {
      return
    }
    isOpen.value = false
  }
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
