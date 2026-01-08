<template>
  <button
    class="flex items-center min-h-[54px] transition-colors duration-200 relative group"
    :class="[
      collapsed ? 'justify-center mx-2 w-[54px]' : 'mx-[8%] w-[84%]',
      active ? 'bg-[#C9C9C9]/20' : 'hover:bg-white/5'
    ]"
    @click="$emit('click')"
  >
    <div class="flex items-center" :class="collapsed ? 'justify-center' : 'pl-5'">
        <img
            :src="getIconPath"
            class="w-6 h-6 object-contain"
            :alt="label"
        />
        <span
            v-if="!collapsed"
            class="ml-5 font-montserrat text-[21px] whitespace-nowrap"
            :class="active ? 'text-white font-bold' : 'text-[#A7A7A7] font-medium'"
        >
            {{ label }}
        </span>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  icon: String,
  iconActive: String,
  active: Boolean,
  collapsed: Boolean
})

const getIconPath = computed(() => {
    // Determine which icon to use
    const iconName = props.active && props.iconActive ? props.iconActive : props.icon
    // Return absolute path relative to src/assets/images or use dynamic import mechanism if needed suited for Vite
    // For simplicity in Vite:
    return `/src/assets/images/${iconName}`
})
</script>
