<template>
  <div class="relative inline-block">
    <!-- Trigger -->
    <div ref="triggerRef">
      <slot name="trigger" :toggle="toggle" :isOpen="modelValue">
        <button
          @click="toggle"
          class="flex items-center gap-2 px-4 py-2.5 rounded hover:bg-[#7A7A7A]
                 font-inter font-normal text-white text-[13px] transition-colors border border-[#8A8A8A]"
          :class="modelValue ? 'bg-[#7A7A7A]' : 'bg-[#6A6A6A]'"
        >
          <svg class="w-3.5 h-2.5" viewBox="0 0 17 12" fill="white">
            <path d="M0 0h17v2H0zm3 5h11v2H3zm3 5h5v2H6z"/>
          </svg>
          {{ label }}
        </button>
      </slot>
    </div>

    <!-- Dropdown (Teleported) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="modelValue"
          ref="menuRef"
          class="fixed z-50 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl w-64 flex flex-col max-h-[450px]"
          :style="dropdownStyle"
        >
          <!-- header -->
          <div class="px-4 py-3 border-b border-[#3a3a3a] flex justify-between items-center shrink-0">
            <span class="text-white font-montserrat font-semibold text-sm">{{ title }}</span>
            <slot name="headerExtra"></slot>
          </div>

          <!-- scrollable body -->
          <div class="p-4 overflow-y-auto flex flex-col gap-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#4D4D4D] [&::-webkit-scrollbar-thumb]:rounded-full">
            <slot></slot>
          </div>

          <!-- footer -->
          <div v-if="$slots.footer" class="px-4 py-3 border-t border-[#3a3a3a] shrink-0">
            <slot name="footer" :close="close"></slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  label?: string
  title?: string
}>(), {
  label: 'Filter',
  title: 'Filters'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

defineSlots<{
  default(): any
  trigger(props: { toggle: () => void, isOpen: boolean }): any
  headerExtra(): any
  footer(props: { close: () => void }): any
}>()

const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref({ top: '0px', left: '0px' })

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}

const close = () => {
  emit('update:modelValue', false)
}

const positionDropdown = () => {
  if (!triggerRef.value || !props.modelValue) return
  
  const rect = triggerRef.value.getBoundingClientRect()
  const top = rect.bottom + 8
  const left = rect.left
  
  // Basic bounds check
  const menuWidth = 256 // w-64
  const finalLeft = Math.min(left, window.innerWidth - menuWidth - 20)
  
  dropdownStyle.value = {
    top: `${top}px`,
    left: `${Math.max(20, finalLeft)}px`
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (!props.modelValue) return
  
  const target = e.target as HTMLElement
  const isTrigger = triggerRef.value?.contains(target)
  const isMenu = menuRef.value?.contains(target)
  
  if (!isTrigger && !isMenu) {
    close()
  }
}

watch(() => props.modelValue, async (val) => {
  if (val) {
    await nextTick()
    positionDropdown()
  }
})

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('resize', positionDropdown)
  window.addEventListener('scroll', positionDropdown, true)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', positionDropdown)
  window.removeEventListener('scroll', positionDropdown, true)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
