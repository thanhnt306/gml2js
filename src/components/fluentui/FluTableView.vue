<template>
  <div class="w-full flex-1 flex flex-col min-h-0 bg-transparent">
    <!-- Header Row -->
    <div v-if="showHeader" class="flex w-full h-[36px] items-center shrink-0" 
         :class="headerFlush ? 'mb-0 rounded-t-[4px] rounded-b-none' : 'mb-[7px] rounded-[4px]'"
         :style="{ backgroundColor: headerBgColor || '#202020' }">
      <div 
        v-for="(col, index) in columns" 
        :key="index"
        class="px-3 text-white font-montserrat font-bold text-sm flex items-center h-full min-w-0"
        :class="[
          col.align === 'left' ? 'justify-start' : col.align === 'right' ? 'justify-end' : 'justify-center'
        ]"
        :style="{ width: col.width ? col.width : (100 / columns.length) + '%' }"
      >
        <template v-if="$slots[col.key + '-header']">
          <slot :name="col.key + '-header'" :column="col"></slot>
        </template>
        <template v-else>
          {{ col.title }}
        </template>
      </div>
    </div>
    
    <!-- Data Rows -->
    <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col" :class="striped ? '' : 'space-y-[7px]'">
       <div 
         v-for="(item, rowIndex) in items" 
         :key="rowIndex"
         class="flex w-full min-h-[44px] transition-colors duration-150 items-stretch"
         :class="[
            striped ? 'border-b border-[#8A8A8A]/50' : 'rounded-[8px] border hover:bg-white/5 cursor-pointer',
            striped && theme === 'light' ? (rowIndex % 2 === 0 ? 'bg-[#BEBEBE]' : 'bg-[#D3D3D3]') : '',
            striped && theme === 'dark' ? (rowIndex % 2 === 0 ? 'bg-white/5' : 'bg-transparent') : ''
         ]"
         :style="{ borderColor: borderColor || (striped ? '' : 'transparent') }"
         @click="$emit('row-click', item)"
       >
          <div 
            v-for="(col, colIndex) in columns" 
            :key="colIndex"
            class="flex items-center py-2 px-3 overflow-hidden min-w-0"
            :class="[
              col.align === 'left' ? 'justify-start text-left' : col.align === 'right' ? 'justify-end text-right' : 'justify-center text-center'
            ]"
             :style="{ width: col.width ? col.width : (100 / columns.length) + '%' }"
          >
             <!-- Check if slot exists for this column -->
             <template v-if="$slots[col.key]">
                <slot :name="col.key" :item="item" :rowIndex="rowIndex" :column="col"></slot>
             </template>
             
             <!-- Default Text Rendering -->
             <template v-else>
                 <span 
                    class="font-inter text-[13px] truncate w-full"
                    :class="[
                        getCellBold(item[col.key]) ? 'font-bold' : 'font-medium',
                        getCellClass(item[col.key])
                    ]"
                    :style="{ color: getCellColor(item[col.key], theme) }"
                 >
                    {{ getCellText(item[col.key]) }}
                 </span>
             </template>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
interface TableColumn {
  title: string
  key: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

const props = withDefaults(defineProps<{
  columns: TableColumn[]
  items?: T[]
  showHeader?: boolean
  borderColor?: string | null
  theme?: 'dark' | 'light' | 'transparent'
  striped?: boolean
  headerBgColor?: string
  headerFlush?: boolean
}>(), {
  items: () => [],
  showHeader: true,
  borderColor: null,
  theme: 'transparent',
  striped: false,
  headerBgColor: '',
  headerFlush: false
})

// Define slots to allow any column key as a slot name
defineSlots<any>()

// Helper to extract text from potential object structure
const getCellText = (cellData: any) => {
    if (cellData && typeof cellData === 'object' && cellData.text !== undefined) {
        return cellData.text
    }
    return cellData
}

const getCellColor = (cellData: any, themeStr: string) => {
    if (cellData && typeof cellData === 'object' && cellData.color) {
        return cellData.color
    }
    return themeStr === 'light' ? '#000000' : '#A7A7A7' // Default color
}

const getCellBold = (cellData: any) => {
    if (cellData && typeof cellData === 'object' && cellData.bold) {
        return cellData.bold
    }
    return false
}

const getCellClass = (_cellData: any) => {
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
