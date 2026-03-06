<template>
  <div class="bg-[#202020] rounded-[15px] border border-[#5D5D5D] w-full max-w-[800px] h-[400px] relative overflow-hidden flex flex-col">
      <!-- Title/Instruction Override if needed, but StepItem handles the label -->
      
      <!-- Map Placeholder -->
      <div class="flex-1 bg-black/40 flex items-center justify-center relative">
          <img src="@/assets/images/map_unpressed_26x26.svg" class="w-16 h-16 opacity-20 mb-2" />
          <span class="text-[#A7A7A7] text-sm absolute mt-12">Map Preview Placeholder</span>
          
          <!-- Mock Selection Overlay -->
          <div class="absolute top-4 left-4 bg-black/60 p-2 rounded text-white text-xs">
              Please select an Inlet Node
          </div>
      </div>

       <!-- Action Buttons -->
      <div class="absolute bottom-4 right-4 flex space-x-2">
           <button 
              @click="$emit('cancel')"
              class="bg-transparent hover:bg-white/10 text-[#A7A7A7] px-4 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="$emit('next')"
              class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Done
            </button>
      </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'next'): void
  (e: 'cancel'): void
}>()
</script>
