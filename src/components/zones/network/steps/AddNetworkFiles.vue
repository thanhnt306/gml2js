<template>
  <div class="bg-transparent rounded-lg p-6 w-full max-w-[800px]">
    <div class="flex space-x-12">
        
        <!-- 2.1 Add Elevation File -->
        <div class="flex flex-col space-y-4 flex-1">
            <div class="flex items-center space-x-3">
                 <div class="w-6 h-6 rounded-full bg-[#529B26] flex items-center justify-center text-white text-xs font-bold">2.1</div>
                 <span class="text-white font-montserrat font-medium text-base">Add Elevation File</span>
            </div>

            <ImportFileItem
              ref="elevFileRef"
              accept=".tif"
              hint="Click to upload .tif"
              @update:files="elevFiles = $event"
            >
              <template #icon>
                <img src="@/assets/images/upload_13x13.svg" class="w-8 h-8 opacity-50 group-hover:opacity-100 mb-2 transition-opacity" />
              </template>
            </ImportFileItem>
            
             <div class="flex justify-end">
                <button 
                  @click="handleAddElev"
                  :disabled="elevFiles.length === 0"
                  class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Add
                </button>
            </div>
        </div>

        <!-- 2.2 Add Network Data File -->
        <div class="flex flex-col space-y-4 flex-1">
             <div class="flex items-center space-x-3">
                 <div class="w-6 h-6 rounded-full bg-[#529B26] flex items-center justify-center text-white text-xs font-bold">2.2</div>
                 <span class="text-white font-montserrat font-medium text-base">Add Network Data File</span>
            </div>

            <ImportFileItem
              ref="networkFileRef"
              accept=".shp,.csv"
              hint="Click to upload .shp, .csv"
              @update:files="networkFiles = $event"
            >
              <template #icon>
                <img src="@/assets/images/drive_file_rename_outline_24x24.svg" class="w-8 h-8 opacity-50 group-hover:opacity-100 mb-2 transition-opacity" />
              </template>
            </ImportFileItem>

             <div class="flex justify-end">
                <button 
                  @click="handleAddGiz"
                  :disabled="networkFiles.length === 0"
                  class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Add
                </button>
            </div>
        </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImportFileItem from '@/components/common/ImportFileItem.vue'

const emit = defineEmits<{
  (e: 'next'): void
}>()

const elevFiles = ref<any[]>([])
const networkFiles = ref<any[]>([])

const handleAddElev = () => {
    console.log('Adding Elevation File:', elevFiles.value)
}

const handleAddGiz = () => {
    console.log('Adding GIS File:', networkFiles.value)
    // Assuming adding GIS file completes this step as per QML flow logic roughly
    emit('next') 
}
</script>
