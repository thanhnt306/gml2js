<template>
  <div class="flex items-center text-sm md:text-base">
    <!-- Label -->
    <div class="w-32 md:w-36 shrink-0">
      <span class="text-[#A7A7A7] font-montserrat font-semibold">
        {{ label }}:
      </span>
    </div>

    <!-- Content + Edit Button -->
    <div class="flex-1 flex items-center justify-between min-w-0">
      <div class="truncate pr-4">
        <span class="text-[#A7A7A7] font-inter font-light">
          {{ content }}
        </span>
      </div>

      <button 
        v-if="showEdit"
        @click="$emit('edit')"
        class="shrink-0 px-3 py-1 border border-[#A7A7A7] rounded-md text-[10px] md:text-xs text-[#A7A7A7] font-montserrat font-light hover:bg-white/5 hover:text-white hover:border-white transition-all"
      >
        Edit
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  content: string
  showEdit?: boolean
}>()

defineEmits<{
  (e: 'edit'): void
}>()
</script>
