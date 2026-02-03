<template>
  <div 
    class="relative cursor-pointer flex items-center justify-center transition-transform active:scale-95 hover:scale-110" 
    :style="{ width: size + 'px', height: size + 'px' }"
    @click.stop="toggle"
  >
     <svg 
        viewBox="0 0 24 24" 
        class="w-full h-full"
        :style="{ 
            fill: modelValue ? checkedColor : 'transparent',
            stroke: borderColor,
            strokeWidth: 2
        }"
     >
        <!-- Standard 5-point Star Path -->
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
     </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean
  checkedColor?: string
  borderColor?: string
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  checkedColor: '#7A7A7A',
  borderColor: '#7A7A7A',
  size: 20
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const toggle = (): void => {
    const newValue = !props.modelValue
    emit('update:modelValue', newValue)
    emit('change', newValue)
}
</script>
