<template>
  <div class="flex flex-col h-full overflow-auto custom-scrollbar">
    <!-- Header -->
    <div class="bg-[#5C5C5C] px-6 py-3">
      <span class="text-white font-montserrat font-medium text-sm">Additional attributes export options</span>
    </div>

    <!-- Attribute rows -->
    <div class="flex flex-col divide-y divide-[#7A7A7A]/30">
      <div
        v-for="group in attributeGroups"
        :key="group.label"
        class="flex items-center gap-4 px-6 py-3 bg-[#A5A5A5]/10"
      >
        <!-- Label -->
        <span class="text-[#5C5C5C] font-montserrat font-medium text-xs w-28 flex-shrink-0">
          {{ group.label }}:
        </span>
        <!-- Chips -->
        <div class="flex flex-wrap gap-2">
          <label
            v-for="attr in group.attributes"
            :key="attr.name"
            class="flex items-center gap-1.5 bg-[#5C5C5C] rounded px-2 py-1 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              v-model="attr.selected"
              class="accent-[#529B26] w-3 h-3"
              @change="$emit('attribute-toggle', { group: group.label, name: attr.name, selected: attr.selected })"
            />
            <span class="text-[#A7A7A7] font-montserrat text-xs">{{ attr.name }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="attributeGroups.every(g => g.attributes.length === 0)" class="flex-1 flex items-center justify-center text-[#5D5D5D] font-inter text-sm py-12">
      No attribute options available.
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

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
  groups: () => [
    { label: 'Main Pipe',     attributes: [] },
    { label: 'Lateral Pipe',  attributes: [] },
    { label: 'Meter',         attributes: [] },
    { label: 'Logger',        attributes: [] },
    { label: 'Valve',         attributes: [] },
    { label: 'Pump',          attributes: [] },
    { label: 'Tank',          attributes: [] },
  ]
})

defineEmits<{
  'attribute-toggle': [{ group: string, name: string, selected: boolean }]
}>()

// Each group is reactive so checkboxes work locally
const attributeGroups = reactive(props.groups)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4B5563; border-radius: 10px; }
</style>
