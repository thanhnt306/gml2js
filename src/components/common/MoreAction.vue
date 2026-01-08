<template>
  <div class="relative flex items-center justify-center">
    <!-- Trigger Button -->
    <button 
        class="w-[24px] h-[24px] rounded hover:bg-white/5 flex items-center justify-center transition-colors"
        @click.stop="toggleMenu"
    >
        <img src="@/assets/images/more_24x24.svg" class="w-full h-full" />
    </button>

    <!-- Dropdown Menu -->
    <div 
        v-if="isOpen" 
        class="absolute right-0 top-[30px] w-[174px] bg-[#222222] rounded-[8px] py-1 z-50 shadow-lg border border-[#5D5D5D]"
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

    <!-- Backdrop to close menu when clicking outside -->
    <div 
        v-if="isOpen" 
        class="fixed inset-0 z-40 bg-transparent"
        @click="closeMenu"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    // You can pass the item/row data here if needed to emit with the action
    item: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['action'])

const isOpen = ref(false)

const actions = [
    { label: 'Rename', key: 'rename' },
    { label: 'Permission setting', key: 'permission' },
    { label: 'Delete', key: 'delete' }
]

const toggleMenu = () => {
    isOpen.value = !isOpen.value
}

const closeMenu = () => {
    isOpen.value = false
}

const handleAction = (action) => {
    emit('action', { key: action.key, item: props.item })
    closeMenu()
}
</script>
