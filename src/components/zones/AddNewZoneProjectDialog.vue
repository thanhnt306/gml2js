<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
        
        <!-- Modal Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]" @click="close"></div>
        
        <!-- Modal Content -->
        <div class="relative w-[609px] min-h-[458px] bg-[#000000DA] border border-[#3B3B3B] rounded-lg flex flex-col pt-[39px] pl-[60px] pb-[39px] pr-[60px]">
          
          <!-- Title -->
          <h2 class="text-white font-montserrat font-semibold text-[36px] leading-[50px] mb-9 tracking-tight">
            New Zone
          </h2>

          <!-- Project Name Row -->
          <div class="flex items-center mb-[15px] space-x-[13px]">
            <div class="flex items-center w-[166px] space-x-3">
              <img src="@/assets/images/drive_file_rename_outline_24x24.svg" class="w-6 h-6 object-contain" alt="Name Icon" />
              <span class="text-[#A7A7A7] font-montserrat font-medium text-[20px] leading-[24px]">Project Name</span>
            </div>
            
            <input 
              v-model="projectName"
              type="text"
              placeholder="Fill the name of the zone"
              class="w-[279px] h-[34px] bg-transparent border border-[#bebebe] rounded-[4px] px-3 font-montserrat text-xs text-[#bebebe] focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <!-- Description Row -->
          <div class="flex items-center mb-[15px] space-x-[13px]">
            <div class="flex items-center w-[166px] space-x-3">
              <img src="@/assets/images/description_24x24.svg" class="w-6 h-6 object-contain" alt="Desc Icon" />
              <span class="text-[#A7A7A7] font-montserrat font-medium text-[20px] leading-[24px]">Description</span>
            </div>
            
            <input 
              v-model="projectDesc"
              type="text"
              placeholder="Write description here"
              class="w-[279px] h-[34px] bg-transparent border border-[#bebebe] rounded-[4px] px-3 font-montserrat text-xs text-[#bebebe] focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <!-- Permissions Row -->
          <div class="flex items-start mb-[15px] space-x-[13px]">
            <div class="flex items-center w-[166px] space-x-3 mt-1">
              <img src="@/assets/images/category_24x24.svg" class="w-6 h-6 object-contain" alt="Permission Icon" />
              <span class="text-[#A7A7A7] font-montserrat font-medium text-[20px] leading-[24px]">Permission</span>
            </div>
            
            <div class="w-[279px] h-[197px] bg-transparent border border-[#5D5D5D] rounded-[5px] overflow-hidden flex flex-col">
              
              <!-- Loading State -->
              <div v-if="isLoadingUsers" class="flex-1 flex items-center justify-center">
                <span class="text-[#A7A7A7] font-montserrat text-sm">Loading users...</span>
              </div>
              
              <!-- Empty State -->
              <div v-else-if="!permissionData || permissionData.userIds.length === 0" class="flex-1 flex items-center justify-center">
                 <span class="text-[#A7A7A7] font-montserrat text-sm">No users found.</span>
              </div>

              <!-- Permission List -->
              <div v-else class="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
                <div 
                  v-for="(id, index) in permissionData.userIds" 
                  :key="id"
                  class="flex items-center justify-between py-2 group cursor-pointer"
                  @click="togglePermission(index)"
                >
                  <span class="text-[#bebebe] font-montserrat text-sm">{{ permissionData.userNames[index] }}</span>
                  
                  <button class="focus:outline-none text-[#bebebe] opacity-70 group-hover:opacity-100 transition-opacity">
                    <img v-if="permissionData.permissions[index]" src="@/assets/images/visibility_on_11x8.svg" class="w-[18px] h-[18px]" alt="Visible" />
                    <img v-else src="@/assets/images/visibility_off_12x12.svg" class="w-[18px] h-[18px]" alt="Hidden" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- Buttons Row -->
          <div class="flex justify-end mt-auto space-x-3">
             <button 
                @click="close"
                class="w-[88px] h-[34px] bg-[#6A6A6A] hover:bg-[#6A6A6A]/80 active:bg-[#6A6A6A]/60 text-white font-montserrat text-sm rounded-[4px] transition-colors"
             >
                Cancel
             </button>
             <button 
                @click="handleSave"
                :disabled="isSaving"
                class="w-[135px] h-[34px] bg-[#529B26] hover:bg-[#6cc537] active:bg-[#4a8b22] text-white font-montserrat text-sm rounded-[4px] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <span v-if="isSaving">Saving...</span>
                <span v-else>Save & Open</span>
             </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ZoneService, { PermissionData } from '@/services/ZoneService'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'zone-created': [zoneId: number]
}>()

const authStore = useAuthStore()

const isLoadingUsers = ref(false)
const isSaving = ref(false)

const permissionData = ref<PermissionData | null>(null)

// State for the form
const projectName = ref('')
const projectDesc = ref('')

// Reset form and fetch users when dialog opens
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    projectName.value = ''
    projectDesc.value = ''
    permissionData.value = null
    await loadUsers()
  }
})

const loadUsers = async () => {
  isLoadingUsers.value = true
  try {
    const userId = authStore.user?.id || 0
    const company = authStore.user?.company || 'EFAS'
    const fetchedData = await ZoneService.getPermissionUsers(userId, company)
    
    // Default: 'admin' user is always permitted and current user is permitted
    for (let i = 0; i < fetchedData.userIds.length; i++) {
        const uId = fetchedData.userIds[i]
        const uName = fetchedData.userNames[i]
        if (uName.toLowerCase() === 'admin' || (authStore.user && uId === authStore.user.id)) {
            fetchedData.permissions[i] = true
        }
    }
    
    permissionData.value = fetchedData

  } catch (error) {
    console.error('Failed to load users for permission list', error)
  } finally {
    isLoadingUsers.value = false
  }
}

const togglePermission = (index: number) => {
  if (!permissionData.value) return
  
  const uName = permissionData.value.userNames[index]
  
  // Prevent admin from removing their own or the global admin's permission to avoid locking out the zone
  const isTargetAdmin = uName.toLowerCase() === 'admin'
  if (isTargetAdmin) {
    // Admin is forcibly permitted, optionally block here or just show a console message
    console.warn("Cannot remove permission for 'admin'.")
    return
  }

  // Toggle logic
  permissionData.value.permissions[index] = !permissionData.value.permissions[index]
}

const close = () => {
  if (isSaving.value) return // Prevent closing while saving
  emit('update:modelValue', false)
}

const handleSave = async () => {
  if (!projectName.value.trim()) {
    alert('Zones name cannot be empty!')
    return
  }

  isSaving.value = true
  try {
    const authorizedIds: number[] = []
    if (permissionData.value) {
        for (let i = 0; i < permissionData.value.userIds.length; i++) {
            if (permissionData.value.permissions[i]) {
                authorizedIds.push(permissionData.value.userIds[i])
            }
        }
    }
    
    const newZone = await ZoneService.createZone({
      name: projectName.value.trim(),
      description: projectDesc.value.trim(),
      userId: authStore.user?.id || 0,
      userIds: authorizedIds
    })

    console.log('[AddNewZone] Successfully created zone:', newZone)
    emit('zone-created', newZone.id)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('[AddNewZone] Error saving zone:', error)
    alert('Failed to create new zone. Please check the console.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
/* Basic fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar for permission list */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #5D5D5D;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #7A7A7A;
}
</style>
