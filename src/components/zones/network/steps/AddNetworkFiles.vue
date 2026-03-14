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
              :files="elevFiles"
              @update:files="elevFiles = $event"
            >
              <template #icon>
                <img src="@/assets/images/upload_13x13.svg" class="w-8 h-8 opacity-50 group-hover:opacity-100 mb-2 transition-opacity" />
              </template>
            </ImportFileItem>
            
             <div class="flex justify-end">
                <button 
                  @click="handleAddElev"
                  :disabled="elevFiles.length === 0 || isUploadingElev"
                  class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {{ isUploadingElev ? 'Uploading...' : 'Add' }}
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
              accept=".shp,.csv,.dbf,.prj,.shx,.cpg,.sbn,.sbx"
              hint="Click to upload .shp, .csv and related files"
              groupByExtension
              :files="networkFiles"
              @update:files="networkFiles = $event"
            >
              <template #icon>
                <img src="@/assets/images/drive_file_rename_outline_24x24.svg" class="w-8 h-8 opacity-50 group-hover:opacity-100 mb-2 transition-opacity" />
              </template>
            </ImportFileItem>

             <div class="flex justify-end">
                <button 
                  @click="handleAddGiz"
                  :disabled="networkFiles.length === 0 || isUploadingGiz"
                  class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {{ isUploadingGiz ? 'Uploading...' : 'Add' }}
                </button>
            </div>
        </div>
    </div>

    <!-- Role Selection Dialog -->
    <NetworkInfoSelectionDialog 
      :show="showRoleDialog"
      :attributes="serverAttributes"
      @save="handleSaveRoles"
      @cancel="handleCancelRoles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import ImportFileItem from '@/components/common/ImportFileItem.vue'
import NetworkInfoSelectionDialog from '../dialogs/NetworkInfoSelectionDialog.vue'
import NetworkService from '@/services/NetworkService'

const props = defineProps<{
  zoneId?: string
}>()

const emit = defineEmits<{
  (e: 'next'): void
}>()

const route = useRoute()
const zoneId = props.zoneId || route.params.id as string

const elevFiles = ref<any[]>([])
const networkFiles = ref<any[]>([])
const isUploadingElev = ref(false)
const isUploadingGiz = ref(false)
const showRoleDialog = ref(false)
const serverAttributes = ref<Record<string, string[]>>({})

const elevFileRef = ref<InstanceType<typeof ImportFileItem> | null>(null)
const networkFileRef = ref<InstanceType<typeof ImportFileItem> | null>(null)

const handleAddElev = async () => {
    if (elevFiles.value.length === 0) return
    
    isUploadingElev.value = true
    try {
        const file = elevFiles.value[0].file
        await NetworkService.uploadElevationFile(zoneId, file)
        console.log('Elevation file uploaded successfully')
        // Only clear after we are sure everything is done or if it's a simple upload
        elevFileRef.value?.clear()
        // Optional: emit next or show success
    } catch (error) {
        console.error('Failed to upload elevation file:', error)
        alert('Failed to upload elevation file. Please try again.')
    } finally {
        isUploadingElev.value = false
    }
}

const handleAddGiz = async () => {
    if (networkFiles.value.length === 0) return

    isUploadingGiz.value = true
    try {
        const files = networkFiles.value.map(f => f.file)
        console.log('Final file list being sent:', files.map(f => f.name))
        const response = await NetworkService.uploadGisFiles(zoneId, files)
        console.log('GIS files uploaded successfully:', response)
        
        if (response.attributes && Object.keys(response.attributes).length > 0) {
            serverAttributes.value = response.attributes
            showRoleDialog.value = true
        } else {
            // Nếu không có attributes (trường hợp hiếm), chuyển luôn sang bước tiếp theo
            emit('next')
        }
    } catch (error) {
        console.error('Failed to upload GIS files:', error)
        alert('Failed to upload GIS files. Please try again.')
        // If upload fails, maybe we also want to clear? 
        // User didn't specify, but usually better to stay so they can retry.
    } finally {
        isUploadingGiz.value = false
    }
}

const handleCancelRoles = () => {
    showRoleDialog.value = false
    // Clear everything to reset for next time
    clearGisData()
}

const clearGisData = () => {
    networkFiles.value = []
    serverAttributes.value = {}
    networkFileRef.value?.clear()
}

const handleSaveRoles = async (rolesConfig: any) => {
    isUploadingGiz.value = true // Show loading while saving roles
    try {
        await NetworkService.saveNetworkRoles(zoneId, rolesConfig)
        console.log('Network roles saved successfully')
        
        // Final clear after everything is successful
        clearGisData()
        
        showRoleDialog.value = false
        emit('next')
    } catch (error) {
        console.error('Failed to save network roles:', error)
        alert('Failed to save network configuration. Please try again.')
    } finally {
        isUploadingGiz.value = false
    }
}
</script>
