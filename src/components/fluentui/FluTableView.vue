<template>
  <div class="w-full h-full flex flex-col pt-2 bg-transparent">
    <!-- Header Row -->
    <div v-if="showHeader" class="flex w-full mb-[7px] bg-[#202020] rounded-[8px] h-[32px] items-center">
      <div 
        v-for="(col, index) in columns" 
        :key="index"
        class="px-1 text-white font-montserrat font-bold text-sm text-center flex items-center justify-center h-full"
        :style="{ width: col.width ? col.width : (100 / columns.length) + '%' }"
      >
        {{ col.title }}
      </div>
    </div>
    
    <!-- Data Rows -->
    <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-[7px]">
       <div 
         v-for="(item, rowIndex) in items" 
         :key="rowIndex"
         class="flex w-full h-[40px] hover:bg-white/5 transition-colors duration-150 rounded-[8px] px-2 items-center border cursor-pointer"
         :style="{ borderColor: borderColor || 'transparent' }"
         @click="$emit('row-click', item)"
       >
          <div 
            v-for="(col, colIndex) in columns" 
            :key="colIndex"
            class="flex items-center justify-center py-2 px-1"
             :style="{ width: col.width ? col.width : (100 / columns.length) + '%' }"
          >
             <!-- Check if slot exists for this column -->
             <template v-if="$slots[col.key]">
                <slot :name="col.key" :item="item" :row-index="rowIndex"></slot>
             </template>
             
             <!-- Default Text Rendering -->
             <template v-else>
                 <span 
                    class="font-montserrat text-sm truncate"
                    :class="[
                        getCellBold(item[col.key]) ? 'font-bold' : 'font-medium',
                        getCellClass(item[col.key])
                    ]"
                    :style="{ color: getCellColor(item[col.key]) }"
                 >
                    {{ getCellText(item[col.key]) }}
                 </span>
             </template>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true }, // [{ title: 'Name', key: 'name', width: '50%' }]
  items: { type: Array, default: () => [] },
  showHeader: { type: Boolean, default: true },
  borderColor: { type: String, default: null }
})

// Helper to extract text from potential object structure
const getCellText = (cellData) => {
    if (cellData && typeof cellData === 'object' && cellData.text !== undefined) {
        return cellData.text
    }
    return cellData
}

const getCellColor = (cellData) => {
    if (cellData && typeof cellData === 'object' && cellData.color) {
        return cellData.color
    }
    return '#A7A7A7' // Default color
}

const getCellBold = (cellData) => {
    if (cellData && typeof cellData === 'object' && cellData.bold) {
        return cellData.bold
    }
    return false
}

const getCellClass = (cellData) => {
     // Optional: map alignment or other props to classes
     return ''
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4B5563;
    border-radius: 20px;
}
</style>
