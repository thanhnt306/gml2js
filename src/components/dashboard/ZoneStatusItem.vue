<template>
  <div class="w-full flex flex-col mb-4">
    <!-- Header: Name + Date -->
    <div class="flex justify-between items-center mb-1">
      <span class="text-white font-montserrat font-semibold text-sm truncate w-[55%]">
        {{ zoneName }}
      </span>
      <span class="text-[#A7A7A7] font-montserrat font-normal text-xs text-right truncate w-[40%]">
        {{ existDate }}
      </span>
    </div>

    <!-- Stacked Bar -->
    <div class="w-full h-[3px] flex bg-white/10 rounded-sm overflow-hidden mb-1">
       <div 
         v-for="(segment, index) in segments" 
         :key="index"
         :style="{ width: segment.percent + '%', backgroundColor: segment.color }"
         class="h-full transition-all duration-300 ease-in-out"
       ></div>
    </div>

    <!-- Labels (Category Name) -->
    <div class="w-full flex h-[14px] mb-[1px]">
        <div 
         v-for="(segment, index) in segments" 
         :key="`lbl-${index}`"
         :style="{ width: segment.percent + '%' }"
         class="text-xs font-montserrat font-medium truncate pr-1"
         :class="getTextColorClass(segment.color)"
       >
         {{ getCategoryLabel(segment.color) }}
       </div>
    </div>

     <!-- Labels (Value) -->
    <div class="w-full flex h-[14px]">
        <div 
         v-for="(segment, index) in segments" 
         :key="`val-${index}`"
         :style="{ width: segment.percent + '%' }"
         class="text-xs font-montserrat font-medium truncate pr-1"
         :class="getTextColorClass(segment.color)"
       >
         {{ segment.label ? '+' + segment.label : '' }}
       </div>
    </div>

  </div>
</template>

<script setup>
const props = defineProps({
  zoneName: { type: String, default: 'Zone Name' },
  existDate: { type: String, default: 'Date' },
  segments: { type: Array, default: () => [] }
})

const getCategoryLabel = (color) => {
    if (color === '#CE7829') return 'Abnormal'
    if (color === '#D6C402') return 'False Alert'
    if (color === '#529B26') return 'Identified'
    return ''
}

const getTextColorClass = (color) => {
    if (color === '#CE7829') return 'text-abnormal'
    if (color === '#D6C402') return 'text-false-alert'
    if (color === '#529B26') return 'text-identified'
    return 'text-[#1AB4B4B4]' // Default or gray
}
</script>

<style scoped>
/* Helper classes for specific text colors logic from QML */
.text-abnormal { color: #91531A; }
.text-false-alert { color: #8E8109; }
.text-identified { color: #529B26; }
</style>
