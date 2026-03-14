<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-[#1e1e1e] border border-white/10 rounded-[4px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-inter">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-white/10">
        <h2 class="text-2xl font-montserrat font-semibold text-white">Network Info</h2>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
        
        <!-- Section 1: Match your files -->
        <div>
          <h3 class="text-white font-semibold text-base mb-6">Match your files</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
            <div v-for="role in fileRoles" :key="role.key" class="flex items-center gap-4">
              <span class="text-[#A7A7A7] text-sm whitespace-nowrap w-32">{{ role.label }}</span>
              <div class="flex-1 min-w-[140px]">
                <BaseSelect 
                  v-model="selections.files[role.key]" 
                  :options="[{ label: 'NO FILE', value: '' }, ...fileNames.map(name => ({ label: name, value: name }))]"
                  placeholder="NO FILE"
                  @update:model-value="onFileChange(role.key)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Match the attributes from your file -->
        <div>
          <h3 class="text-white font-semibold text-base mb-6">Match the attributes from your file</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4">
            <div v-for="attr in attributeRoles" :key="attr.key" class="flex items-center gap-6">
              <span class="text-[#A7A7A7] text-sm whitespace-nowrap w-48">{{ attr.label }}</span>
              <div class="flex-1 min-w-[200px]">
                <BaseSelect 
                  v-model="selections.attributes[attr.key]" 
                  :options="[{ label: 'NO INFORMATION', value: '' }, ...getAttributeOptions(attr.parentFileRole).map(opt => ({ label: opt, value: opt }))]"
                  placeholder="NO INFORMATION"
                  :disabled="!isParentFileSelected(attr.parentFileRole)"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="px-6 py-4 border-t border-white/10 bg-[#1e1e1e] flex justify-end gap-3">
        <button 
          @click="$emit('cancel')" 
          class="px-10 py-2 rounded-[4px] text-sm font-medium text-white bg-[#444444] hover:bg-[#555555] transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="handleConfirm"
          class="px-10 py-2 rounded-[4px] text-sm font-medium text-white bg-[#529B26] hover:bg-[#63bc2e] transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

interface Props {
  show: boolean
  attributes: Record<string, string[]>
}

const props = defineProps<Props>()
const emit = defineEmits(['save', 'cancel'])

const fileNames = computed(() => Object.keys(props.attributes))

const fileRoles = [
  { label: 'Main Pipe File', key: 'main_pipe' },
  { label: 'Lateral Pipe File', key: 'lateral_pipe' },
  { label: 'Meter File', key: 'meter' },
  { label: 'Valve File', key: 'valve' },
  { label: 'Logger Point File', key: 'logger_point' },
  { label: 'Booster Pump File', key: 'pump' },
  { label: 'Storage Tank File', key: 'tank' },
  { label: 'Reservoir File', key: 'reservoir' }
]

const attributeRoles = [
  { label: 'Main Pipe Label', key: 'main_pipe_label', parentFileRole: 'main_pipe' },
  { label: 'Main Pipe Install Date', key: 'main_pipe_install_date', parentFileRole: 'main_pipe' },
  { label: 'Main Pipe Material', key: 'main_pipe_material', parentFileRole: 'main_pipe' },
  { label: 'Main Pipe Diameter', key: 'main_pipe_diameter', parentFileRole: 'main_pipe' },
  { label: 'Main Pipe Depth', key: 'main_pipe_depth', parentFileRole: 'main_pipe' },
  
  { label: 'Pump Label', key: 'pump_label', parentFileRole: 'pump' },
  { label: 'Pump Model', key: 'pump_model', parentFileRole: 'pump' },
  
  { label: 'Lateral Pipe Label', key: 'lateral_pipe_label', parentFileRole: 'lateral_pipe' },
  
  { label: 'Tank Label', key: 'tank_label', parentFileRole: 'tank' },
  { label: 'Tank Lift', key: 'tank_lift', parentFileRole: 'tank' },
  { label: 'Tank Diameter', key: 'tank_diameter', parentFileRole: 'tank' },
  { label: 'Tank Min Level', key: 'tank_min_level', parentFileRole: 'tank' },
  { label: 'Tank Max Level', key: 'tank_max_level', parentFileRole: 'tank' },

  { label: 'Meter Label', key: 'meter_label', parentFileRole: 'meter' },
  
  { label: 'Logger Point Label', key: 'logger_point_label', parentFileRole: 'logger_point' },

  { label: 'Reservoir Label', key: 'reservoir_label', parentFileRole: 'reservoir' },

  { label: 'Valve Label', key: 'valve_label', parentFileRole: 'valve' },
  { label: 'Valve Type', key: 'valve_type', parentFileRole: 'valve' },
  { label: 'Valve Size', key: 'valve_size', parentFileRole: 'valve' }
]

const selections = reactive({
  files: fileRoles.reduce((acc, role) => ({ ...acc, [role.key]: '' }), {} as Record<string, string>),
  attributes: attributeRoles.reduce((acc, attr) => ({ ...acc, [attr.key]: '' }), {} as Record<string, string>)
})

const onFileChange = (fileRoleKey: string) => {
  // Reset corresponding attribute selections when file for that role changes
  attributeRoles.forEach(attr => {
    if (attr.parentFileRole === fileRoleKey) {
      selections.attributes[attr.key] = ''
    }
  })
}

const isParentFileSelected = (parentFileRole: string) => {
  return !!selections.files[parentFileRole]
}

const getAttributeOptions = (parentFileRole: string) => {
  const selectedFileName = selections.files[parentFileRole]
  if (!selectedFileName) return []
  return props.attributes[selectedFileName] || []
}

const handleConfirm = () => {
  // Structure data for server. We send the mapping from role to file/attribute.
  emit('save', JSON.parse(JSON.stringify(selections)))
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
