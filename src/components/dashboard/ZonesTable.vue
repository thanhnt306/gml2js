<template>
  <div class="w-full h-full flex flex-col bg-white/10 rounded-lg p-6 backdrop-blur-sm">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4 min-h-[32px]">
          <span class="text-white font-montserrat font-semibold text-2xl">Zones</span>
          
          <div class="flex items-center space-x-2">
             <!-- Search Field -->
             <div class="relative w-[211px] h-[32px]">
                 <input 
                    type="text" 
                    placeholder="Search for project"
                    class="w-full h-full bg-transparent border border-[#5D5D5D] rounded-[15px] px-4 text-[#bebebe] font-inter font-light text-[15px] placeholder-[#5D5D5D] focus:outline-none"
                 />
                 <img src="@/assets/images/filter_24x24.svg" class="absolute right-2 top-1 w-6 h-6 opacity-0" />
             </div>
          </div>
      </div>

      <!-- Table (Header Hidden) -->
      <div class="flex-1 overflow-hidden">
          <FluTableView 
            :columns="columns" 
            :items="items" 
            :showHeader="false" 
            borderColor="#5D5D5D"
            @row-click="handleRowClick"
          >
             <template #favorite="{ item }">
                 <FavoriteCheckbox 
                    v-model="item.favorite" 
                    checkedColor="#7A7A7A" 
                    borderColor="#7A7A7A" 
                    size="20"
                 />
             </template>
             <template #moreAction="{ item }">
                 <MoreAction :item="item" @action="handleMoreAction" />
             </template>
          </FluTableView>
      </div>
      
      <!-- Footer: Add Button + Pagination -->
      <div class="flex flex-col mt-4 space-y-3">
         <!-- Add New Zone (Full Width) -->
         <button class="w-full h-[32px] flex items-center justify-center space-x-2 border border-[#5D5D5D] rounded-[8px] hover:bg-white/5 transition-colors">
             <img src="@/assets/images/add_circle_20x20.svg" class="w-[20px] h-[20px]" />
             <span class="text-[#A7A7A7] font-montserrat text-[15px]">Add new Zone</span>
         </button>

         <!-- Pagination (Right Aligned or Centered as per QML, QML says Layout.alignment: Qt.AlignVCenter | Qt.AlignRight) -->
         <div class="flex justify-end text-[#A7A7A7]">
              <!-- Mock Pagination -->
              <div class="flex font-montserrat text-sm space-x-2">
                <button class="hover:text-white">&lt;</button>
                <span class="text-white font-bold">1</span>
                <span class="hover:text-white cursor-pointer">2</span>
                <span>...</span>
                <button class="hover:text-white">&gt;</button>
              </div>
         </div>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FluTableView from '../fluentui/FluTableView.vue'
import FavoriteCheckbox from '../common/FavoriteCheckbox.vue'
import MoreAction from '../common/MoreAction.vue'

const router = useRouter()
const emit = defineEmits(['open-zone']) // Define the event

const handleMoreAction = (payload) => {
    console.log('Action triggered:', payload.key, payload.item)
}

const handleRowClick = (item) => {
    // Emit event to parent (Zones.vue or Dashboard.vue)
    // Parent decides whether to switch view or navigate
    console.log('Row clicked:', item)
    emit('open-zone', item)
}

const columns = [
    { title: 'DMA Name', key: 'zoneName', width: '80%' },
    // Description is hidden by default in QML (width ~0)
    // { title: 'Description', key: 'description', width: '0%' },
    { title: 'Favorite', key: 'favorite', width: '10%' },
    { title: 'More Action', key: 'moreAction', width: '10%' }
]

const items = ref([
    { 
        zoneName: { text: "Example Project 1", bold: true, color: "#A7A7A7" }, 
        description: { text: "Description for Project 1", color: "#A7A7A7" },
        favorite: true, 
        moreAction: "..."
    },
    { 
        zoneName: { text: "Example Project 2", bold: true, color: "#A7A7A7" }, 
        description: { text: "Description for Project 2", color: "#A7A7A7" },
        favorite: false,
        moreAction: "..."
    }
    // Add more mock data if needed
])
</script>
