<template>
  <div class="w-full bg-[#FFFFFF1A] rounded-[5px] overflow-hidden transition-all duration-300">
      <!-- Header -->
      <div class="relative min-h-[100px] p-6 flex flex-col">
          <div class="flex flex-row justify-between items-start">
             <!-- Text Content -->
             <div class="flex flex-col ml-8">
                 <h2 class="text-white font-montserrat font-semibold text-2xl mb-1">{{ label }}</h2>
                 <p v-if="description" class="text-[#A7A7A7] font-inter font-light text-[13px] max-w-[700px] leading-tight">
                     {{ description }}
                 </p>
             </div>

             <!-- Action Button -->
             <button 
                class="px-4 py-1 rounded-[8px] font-inter font-medium text-sm transition-colors border-none outline-none"
                :class="isExpanded ? 'bg-[#FFFFFF1A] text-[#A7A7A7] hover:bg-[#FFFFFF2A]' : 'bg-[#529B26] text-white hover:bg-[#6cc537]'"
                @click="$emit('toggle')"
             >
                 {{ isExpanded ? 'Collapse' : 'Start' }}
             </button>
          </div>
      </div>

      <!-- Content Loader -->
      <div 
        class="transition-all duration-300 ease-in-out overflow-hidden"
        :style="{ maxHeight: isExpanded ? '1000px' : '0px', opacity: isExpanded ? 1 : 0 }"
      >
         <div class="p-6 pt-0 ml-8">
             <slot></slot>
         </div>
      </div>
  </div>
</template>

<script setup>
defineProps({
    label: String,
    description: String,
    isExpanded: Boolean
})

defineEmits(['toggle'])
</script>
