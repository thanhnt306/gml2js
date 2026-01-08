<template>
  <button 
    class="w-10 h-10 flex items-center justify-center rounded transition-opacity duration-200"
    :title="tooltip"
    @click="$emit('click')"
  >
    <img 
        :src="getIconSrc" 
        class="w-full h-full object-contain"
        alt="tool-icon"
    />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: String,
  hoverIcon: String,
  activeIcon: String,
  active: Boolean,
  tooltip: String
})

const getIconSrc = computed(() => {
    // Basic logic: if active, show activeIcon.
    // In a real app we might handle hover state with JS or CSS, 
    // but here we'll stick to simple logic for the icon source. 
    // Since images are in assets, we resolve them relative to root or public.
    const iconName = props.active ? props.activeIcon : props.icon
    return `/src/assets/images/${iconName}`
})
</script>
