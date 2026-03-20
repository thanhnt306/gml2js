<template>
  <div class="h-full bg-[#202020] rounded-[15px] p-8 flex flex-col font-montserrat overflow-hidden">
    <!-- Header -->
    <div class="mb-6 shrink-0">
      <h1 class="text-white text-2xl font-bold mb-4">Settings</h1>
      <div class="h-[1px] bg-[#5D5D5D] w-full"></div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar pr-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- General Section -->
        <div class="bg-white/5 rounded-lg p-6 border border-white/5">
          <h2 class="text-white text-lg font-bold mb-6">General</h2>
          <div class="space-y-4">
            <InfoLine 
              label="First name" 
              :content="authStore.user?.firstName || ''" 
              showEdit
              @edit="openEdit('firstName', 'First name', authStore.user?.firstName)"
            />
            <InfoLine 
              label="Last name" 
              :content="authStore.user?.lastName || ''" 
              showEdit
              @edit="openEdit('lastName', 'Last name', authStore.user?.lastName)"
            />
            <InfoLine 
              label="User name" 
              :content="authStore.user?.username || ''" 
              :showEdit="authStore.user?.username !== 'admin'"
              @edit="openEdit('username', 'User name', authStore.user?.username)"
            />
            <InfoLine 
              label="Password" 
              content="•••••••••" 
              showEdit
              @edit="openEdit('password', 'Password', '')"
            />
            <InfoLine 
              label="Email" 
              :content="authStore.user?.email || ''" 
              showEdit
              @edit="openEdit('email', 'Email', authStore.user?.email)"
            />
            <InfoLine 
              label="License" 
              content="••••••••••••••••••" 
              showEdit
              @edit="openEdit('license', 'License', '')"
            />
            
            <!-- Language Selection -->
            <div class="flex items-center pt-2">
              <div class="w-32 md:w-36 shrink-0">
                <span class="text-[#A7A7A7] font-montserrat font-semibold text-sm">Language:</span>
              </div>
              <div class="flex-1 max-w-[200px]">
                <BaseSelect 
                  v-model="selectedLanguage"
                  :options="['English', 'Vietnamese', 'Thai']"
                  customClass="bg-white/5 border border-[#5D5D5D] rounded-md px-3 py-1 text-xs text-[#A7A7A7]"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Zones Section -->
        <div class="bg-white/5 rounded-lg p-6 border border-white/5 flex flex-col">
          <h2 class="text-white text-lg font-bold mb-6">Zones</h2>
          
          <!-- Compute Resources -->
          <div class="flex items-center mb-6">
            <div class="w-44 shrink-0">
              <span class="text-[#A7A7A7] font-montserrat font-semibold text-sm">Compute resources:</span>
            </div>
            <div class="flex-1 max-w-[150px]">
              <BaseSelect 
                v-model="computeResources"
                :options="['Default', 'High', 'Medium', 'Low']"
                customClass="bg-white/5 border border-[#5D5D5D] rounded-md px-3 py-1 text-xs text-[#A7A7A7]"
              />
            </div>
          </div>

          <!-- Zone Removal Accordion -->
          <div class="flex-1">
            <button 
              @click="isZoneExpanded = !isZoneExpanded"
              class="w-full flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-md hover:bg-white/10 transition-colors"
            >
              <span class="text-[#A7A7A7] font-montserrat font-semibold text-sm">Zone Removal</span>
              <img 
                src="@/assets/images/expand_more_down_24x24.svg" 
                class="w-5 h-5 transition-transform duration-300 opacity-60"
                :class="{ 'rotate-180': isZoneExpanded }"
              />
            </button>

            <div v-show="isZoneExpanded" class="mt-2 space-y-2 bg-white/5 rounded-md p-3 border border-white/5">
              <div 
                v-for="zone in mockZones" 
                :key="zone.id"
                class="flex items-center justify-between bg-white/5 p-2 rounded-md group"
              >
                <span class="text-[#A7A7A7] font-inter text-sm">{{ zone.name }}</span>
                <button 
                  @click="confirmDelete(zone)"
                  class="opacity-0 group-hover:opacity-100 px-3 py-1 border border-[#FC6B6D] rounded-md text-[10px] text-[#FC6B6D] hover:bg-[#FC6B6D]/10 transition-all font-montserrat"
                >
                  Delete
                </button>
              </div>
              <div v-if="mockZones.length === 0" class="py-4 text-center text-[#5D5D5D] text-xs font-montserrat italic">
                No zones currently available
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Edit Dialog (Teleported or inline) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="editDialog.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div class="bg-[#1a1a1a] border border-[#3B3B3B] w-full max-w-[320px] rounded-xl shadow-2xl p-6 overflow-hidden">
            <h3 class="text-white text-xl font-bold font-montserrat mb-4">
              Edit {{ editDialog.label }}
            </h3>
            
            <div class="mb-6">
              <input 
                v-model="editDialog.value"
                :type="editDialog.key === 'password' ? 'password' : 'text'"
                class="w-full bg-transparent border border-[#5D5D5D] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#529B26] transition-colors font-inter"
                :placeholder="`Enter ${editDialog.label}`"
                @keyup.enter="saveEdit"
                ref="editInput"
              />
            </div>

            <div class="flex justify-end gap-3 text-sm">
              <button 
                @click="editDialog.show = false"
                class="px-6 py-2 bg-[#6A6A6A] text-white rounded-md hover:bg-[#5D5D5D] transition-colors font-montserrat"
              >
                Cancel
              </button>
              <button 
                @click="saveEdit"
                class="px-6 py-2 bg-[#529B26] text-white rounded-md hover:bg-[#63b334] transition-colors font-montserrat"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Success Message (Toast) -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="successMsg" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-[#529B26] text-white px-6 py-3 rounded-full shadow-lg font-montserrat text-sm border-2 border-white/20">
          Update {{ successMsg }} success!
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import InfoLine from '@/components/settings/InfoLine.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const authStore = useAuthStore()

const selectedLanguage = ref('English')
const computeResources = ref('Default')
const isZoneExpanded = ref(false)
const successMsg = ref('')

const mockZones = ref([
  { id: 1, name: 'Example Project 1' },
  { id: 2, name: 'Example Project 2' }
])

interface EditForm {
  show: boolean
  key: string
  label: string
  value: string
}

const editDialog = reactive<EditForm>({
  show: false,
  key: '',
  label: '',
  value: ''
})

const editInput = ref<HTMLInputElement | null>(null)

const openEdit = async (key: string, label: string, initialValue: string | undefined) => {
  editDialog.key = key
  editDialog.label = label
  editDialog.value = initialValue || ''
  editDialog.show = true
  
  await nextTick()
  editInput.value?.focus()
}

const saveEdit = async () => {
  if (editDialog.key === 'license') {
    const success = await authStore.activateLicense(editDialog.value)
    if (success) showToast('license key')
    editDialog.show = false
    return
  }

  const updatedData = { [editDialog.key]: editDialog.value }
  const success = await authStore.updateUser(updatedData)
  
  if (success) {
    showToast(editDialog.label.toLowerCase())
  }
  editDialog.show = false
}

const showToast = (content: string) => {
  successMsg.value = content
  setTimeout(() => {
    successMsg.value = ''
  }, 2000)
}

const confirmDelete = (zone: any) => {
  if (confirm(`Are you sure you want to delete "${zone.name}"?`)) {
    mockZones.value = mockZones.value.filter(z => z.id !== zone.id)
    showToast('zone deletion')
  }
}

watch(selectedLanguage, (val) => {
  console.log('Language changed:', val)
  // i18n logic here
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
.slide-up-enter-from { transform: translate(-50%, 100px); opacity: 0; }
.slide-up-leave-to { transform: translate(-50%, 50px); opacity: 0; }
</style>
