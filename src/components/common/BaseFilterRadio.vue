<template>
  <label class="flex items-center gap-2 cursor-pointer group">
    <input
      type="radio"
      :value="value"
      :checked="modelValue === value"
      @change="$emit('update:modelValue', value)"
      class="absolute opacity-0 pointer-events-none w-0 h-0"
    />
    <div
      class="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors"
      :class="modelValue === value ? 'border-[#529B26]' : 'border-[#5D5D5D] group-hover:border-[#7A7A7A]'"
    >
      <div v-if="modelValue === value" class="w-2 h-2 rounded-full bg-[#529B26]"></div>
    </div>
    <slot>
      <span class="font-inter text-xs text-white">{{ label }}</span>
    </slot>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: any
  value: any
  label?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>
