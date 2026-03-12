<template>
  <div class="flex flex-col w-full">
    <!-- Header -->
    <div 
      class="flex items-center cursor-pointer mb-4 tap-highlight-transparent"
      @click="handleToggle"
    >
      <!-- Step Icon/Number -->
      <div 
        class="flex-none flex items-center justify-center rounded-full transition-colors duration-200"
        :class="isExpanded ? 'bg-[#529B26]' : 'bg-[#A7A7A7]'"
        :style="{ width: iconSize + 'px', height: iconSize + 'px' }"
      >
        <span class="text-white font-montserrat font-bold text-sm">{{ number }}</span>
      </div>

      <!-- Label -->
      <span 
        class="ml-4 font-montserrat font-semibold text-lg transition-colors duration-200"
        :class="isExpanded ? 'text-white' : 'text-[#A7A7A7]'"
      >
        {{ label }}
      </span>
    </div>

    <!-- Content Area with connector line -->
    <div class="flex relative">
      <!-- Vertical Connector Line -->
      <div 
        v-if="!isLastStep"
        class="absolute bg-[#A7A7A7] w-[1px]"
        :class="isExpanded ? 'opacity-100' : 'opacity-100'"
        :style="{ 
           left: (iconSize / 2) + 'px', 
           top: '-5px', 
           bottom: '-10px'
        }"
      ></div>
      
      <!-- Content Container -->
      <div 
        class="flex-1 transition-all duration-300 overflow-hidden"
        :style="{ 
            paddingLeft: (iconSize + 16) + 'px',
            maxHeight: isExpanded ? '2000px' : '0px',
            opacity: isExpanded ? 1 : 0,
            marginBottom: isExpanded ? '24px' : '0px'
        }"
      >
         <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  label: string
  number: string
  isExpanded?: boolean
  isLastStep?: boolean
}>(), {
  isExpanded: false,
  isLastStep: false
})

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const iconSize = 32

const handleToggle = () => {
    emit('toggle')
}
</script>

<style scoped>
.tap-highlight-transparent {
    -webkit-tap-highlight-color: transparent;
}
</style>
