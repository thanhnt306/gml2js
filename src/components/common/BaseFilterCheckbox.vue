<template>
  <label class="flex items-center gap-2 cursor-pointer group">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="absolute opacity-0 pointer-events-none w-0 h-0"
    />
    <div
      class="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
      :class="modelValue ? 'border-[#529B26] bg-[#529B26]' : 'border-[#5D5D5D] bg-transparent group-hover:border-[#7A7A7A]'"
    >
      <svg v-if="modelValue" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <slot>
      <span class="font-inter text-xs text-white">{{ label }}</span>
    </slot>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
