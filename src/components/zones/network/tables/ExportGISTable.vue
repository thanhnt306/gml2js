<template>
  <div class="flex flex-col h-full bg-[#D3D3D3] rounded-[4px] overflow-hidden">
    <!-- Header -->
    <div class="bg-[#5D5D5D] px-4 h-[36px] flex items-center shrink-0">
      <span class="text-white font-montserrat font-bold text-sm">Additional attributes export options</span>
    </div>

    <!-- Attribute rows -->
    <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-1 pb-3">
      <div
        v-for="group in attributeGroups"
        :key="group.label"
        class="flex items-center gap-4 px-4 min-h-[44px] w-full"
      >
        <!-- Label -->
        <span class="text-[#5C5C5C] font-inter text-[13px] font-medium w-[90px] flex-shrink-0">
          {{ group.label }}:
        </span>
        
        <!-- Chips Scroll Container -->
        <div class="flex-1 overflow-x-auto custom-scrollbar-horizontal flex items-center gap-2 py-1.5 pr-2">
          <!-- Chips -->
          <label
            v-for="attr in group.attributes"
            :key="attr.name"
            class="flex items-center gap-2 bg-[#6A6A6A] hover:bg-[#7A7A7A] rounded px-2 py-1 cursor-pointer select-none flex-shrink-0 transition-colors"
          >
            <input
              type="checkbox"
              v-model="attr.selected"
              class="hidden"
              @change="$emit('attribute-toggle', { group: group.label, name: attr.name, selected: attr.selected })"
            />
            <div
              class="w-3.5 h-3.5 rounded-[2px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-colors"
              :class="attr.selected
                ? 'bg-[#529B26] border-[#529B26]'
                : 'bg-transparent border-[#529B26]'"
            >
              <svg v-if="attr.selected" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-[#E0E0E0] font-inter text-[13px] whitespace-nowrap">{{ attr.name }}</span>
          </label>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="attributeGroups.every(g => g.attributes.length === 0)" class="flex-1 flex items-center justify-center text-[#5D5D5D] font-inter text-sm py-12">
        No attribute options available.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

export interface AttributeOption {
  name: string
  selected: boolean
}

export interface AttributeGroup {
  label: string
  attributes: AttributeOption[]
}

const props = withDefaults(defineProps<{
  groups?: AttributeGroup[]
}>(), {
  groups: () => []
})

const emit = defineEmits<{
  'attribute-toggle': [{ group: string, name: string, selected: boolean }]
}>()

const attributeGroups = reactive<AttributeGroup[]>(JSON.parse(JSON.stringify(props.groups)))

watch(() => props.groups, (newGroups) => {
  attributeGroups.splice(0, attributeGroups.length, ...JSON.parse(JSON.stringify(newGroups)))
}, { deep: true })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #8A8A8A; border-radius: 10px; }

.custom-scrollbar-horizontal::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar-horizontal::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-horizontal::-webkit-scrollbar-thumb { background-color: #8A8A8A; border-radius: 10px; }
.custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover { background-color: #5D5D5D; }
</style>
