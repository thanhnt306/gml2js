<template>
  <div class="relative flex items-center justify-center" ref="triggerRef">
    <!-- Trigger Button -->
    <button 
        class="w-[24px] h-[24px] rounded hover:bg-white/5 flex items-center justify-center transition-colors"
        @click.stop="toggleMenu"
    >
        <img src="@/assets/images/more_24x24.svg" class="w-full h-full" />
    </button>

    <Teleport to="body">
      <!-- Backdrop to close menu when clicking outside -->
      <div 
          v-if="isOpen" 
          class="fixed inset-0 z-40 bg-transparent"
          @click="closeMenu"
      ></div>

      <!-- Dropdown Menu -->
      <div 
          v-if="isOpen" 
          class="fixed z-50 bg-[#222222] rounded-[8px] py-1 shadow-lg border border-[#5D5D5D]"
          :style="{ top: menuTop + 'px', left: menuLeft + 'px', width: '174px' }"
          @click.stop
      >
          <button 
              v-for="(action, index) in actions" 
              :key="index"
              class="w-full text-left px-[17px] py-[5px] text-white font-montserrat font-semibold text-[14px] hover:bg-white/10 transition-colors"
              @click="handleAction(action)"
          >
              {{ action.label }}
          </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  item?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  item: () => ({})
})

interface ActionItem {
  label: string
  key: string
}

interface ActionEvent {
  key: string
  item: Record<string, any>
}

const emit = defineEmits<{
  action: [event: ActionEvent]
}>()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuTop = ref(0)
const menuLeft = ref(0)

const actions: ActionItem[] = [
    { label: 'Rename', key: 'rename' },
    { label: 'Permission setting', key: 'permission' },
    { label: 'Delete', key: 'delete' }
]

const toggleMenu = (): void => {
    if (isOpen.value) {
        closeMenu()
        return
    }
    
    if (triggerRef.value) {
        const rect = triggerRef.value.getBoundingClientRect()
        // Position dropdown below button, aligned to its right edge
        menuTop.value = rect.bottom + 6
        menuLeft.value = rect.right - 174 // 174px is the menu width
    }
    
    isOpen.value = true
}

const closeMenu = (): void => {
    isOpen.value = false
}

const handleAction = (action: ActionItem): void => {
    emit('action', { key: action.key, item: props.item })
    closeMenu()
}
</script>
