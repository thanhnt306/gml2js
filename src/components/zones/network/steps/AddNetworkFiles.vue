<template>
  <div class="bg-white/10 rounded-lg p-6 w-full max-w-[800px]">
    <div class="flex space-x-12">
        
        <!-- 2.1 Add Elevation File -->
        <div class="flex flex-col space-y-4 flex-1">
            <div class="flex items-center space-x-3">
                 <div class="w-6 h-6 rounded-full bg-[#529B26] flex items-center justify-center text-white text-xs font-bold">2.1</div>
                 <span class="text-white font-montserrat font-medium text-base">Add Elevation File</span>
            </div>

            <div class="bg-[#1A1A1A] border border-[#5D5D5D] border-dashed rounded-lg h-[150px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group">
                 <img src="@/assets/images/upload_13x13.svg" class="w-8 h-8 opacity-50 group-hover:opacity-100 mb-2" />
                 <span class="text-[#A7A7A7] text-xs group-hover:text-white">Click to upload .tif</span>
            </div>
            
             <div class="flex justify-end">
                <button 
                  @click="handleAddElev"
                  class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors"
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

            <div class="bg-[#1A1A1A] border border-[#5D5D5D] border-dashed rounded-lg h-[150px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group">
                 <img src="@/assets/images/drive_file_rename_outline_24x24.svg" class="w-8 h-8 opacity-50 group-hover:opacity-100 mb-2" />
                 <span class="text-[#A7A7A7] text-xs group-hover:text-white">Click to upload .shp, .csv</span>
            </div>

             <div class="flex justify-end">
                <button 
                  @click="handleAddGiz"
                  class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Add
                </button>
            </div>
        </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'next'): void
}>()

const handleAddElev = () => {
    console.log('Adding Elevation File mock')
}

const handleAddGiz = () => {
    console.log('Adding GIS File mock')
    // Assuming adding GIS file completes this step as per QML flow logic roughly
    emit('next') 
}
</script>
