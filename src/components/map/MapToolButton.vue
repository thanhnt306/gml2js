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

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon?: string
  hoverIcon?: string
  activeIcon?: string
  active?: boolean
  tooltip?: string
}>()

const getIconSrc = computed<string>(() => {
    // Basic logic: if active, show activeIcon.
    // In a real app we might handle hover state with JS or CSS, 
    // but here we'll stick to simple logic for the icon source. 
    // Since images are in assets, we resolve them relative to root or public.
    const iconName = props.active ? props.activeIcon : props.icon
    if (!iconName) return ''
    return new URL(`../../assets/images/${iconName}`, import.meta.url).href
})
</script>
