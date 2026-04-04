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

          <!-- ShapeFile mode: 3-column grid (original layout) -->
          <div v-if="parserType === 'shapefile'" class="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
            <div v-for="role in SHP_FILE_ROLES" :key="role.key" class="flex items-center gap-4">
              <span class="text-[#A7A7A7] text-sm whitespace-nowrap w-32">{{ role.label }}</span>
              <div class="flex-1 min-w-[140px]">
                <BaseSelect
                  v-model="selections.files[role.key]"
                  :options="fileOptions"
                  placeholder="NO FILE"
                  @update:model-value="onFileChange(role.key)"
                />
              </div>
            </div>
          </div>

          <!-- CSV mode: 2-column grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div v-for="role in CSV_FILE_ROLES" :key="role.key" class="flex items-center gap-4">
              <span class="text-[#A7A7A7] text-sm whitespace-nowrap w-32">{{ role.label }}</span>
              <div class="flex-1 min-w-[140px]">
                <BaseSelect
                  v-model="selections.files[role.key]"
                  :options="fileOptions"
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
            <div v-for="attr in visibleAttributeRoles" :key="attr.key" class="flex items-center gap-6">
              <span class="text-[#A7A7A7] text-sm whitespace-nowrap w-48">{{ attr.label }}</span>
              <div class="flex-1 min-w-[200px]">
                <BaseSelect
                  v-model="selections.attributes[attr.key]"
                  :options="getAttributeOptions(attr.parentFileRole)"
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

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type ParserType = 'shapefile' | 'csv'

interface Props {
  show: boolean
  /** Map of filename → list of column names returned by upload-gis API */
  attributes: Record<string, string[]>
  /** 'shapefile' (default) or 'csv' */
  parserType?: ParserType
}

const props = withDefaults(defineProps<Props>(), { parserType: 'shapefile' })
const emit = defineEmits(['save', 'cancel'])

// ─────────────────────────────────────────────
// File roles
// QML fileResultStringList order (indices used in setFileNames):
//   [0] main_pipe  [1] lateral_pipe  [2] meter  [3] valve  [4] logger_point
//   [5] junction   [6] pipeline      [7] pump   [8] tank   [9] reservoir
// ─────────────────────────────────────────────
const SHP_FILE_ROLES = [
  { key: 'main_pipe',    label: 'Main Pipe File' },
  { key: 'lateral_pipe', label: 'Lateral Pipe File' },
  { key: 'meter',        label: 'Meter File' },
  { key: 'valve',        label: 'Valve File' },
  { key: 'logger_point', label: 'Logger Point File' },
  { key: 'pump',         label: 'Booster Pump File' },
  { key: 'tank',         label: 'Storage Tank File' },
  { key: 'reservoir',    label: 'Reservoir File' },
]

const CSV_FILE_ROLES = [
  { key: 'junction', label: 'Junction File' },
  { key: 'pipeline', label: 'Pipeline File' },
]

// ─────────────────────────────────────────────
// Attribute roles – DISPLAY order (per mode)
//
// Shapefile: matches original Vue layout
//   Left column : Main Pipe Label | Install Date | Material | Diameter | Depth | Pump Label | Pump Model | Lateral Pipe Label | Valve Label | Valve Type | Valve Size
//   Right column: Tank Label | Tank Lift | Tank Diameter | Tank Min | Tank Max | Meter Label | Logger Point Label | Reservoir Label
//
// CSV: matches image / QML parserType==1 visible items
//   Left column : Main Pipe Label | Install Date | Material | Diameter | Depth | Start node | Stop node | Elevation | Valve Type | Valve Size
//   Right column: Pump Model | Tank Lift | Tank Diameter | Tank Min | Tank Max
// ─────────────────────────────────────────────
const SHP_ATTRIBUTE_ROLES = [
  // — left column —
  { key: 'main_pipe_label',        label: 'Main Pipe Label',       parentFileRole: 'main_pipe' },
  { key: 'main_pipe_install_date', label: 'Main Pipe Install Date',parentFileRole: 'main_pipe' },
  { key: 'main_pipe_material',     label: 'Main Pipe Material',    parentFileRole: 'main_pipe' },
  { key: 'main_pipe_diameter',     label: 'Main Pipe Diameter',    parentFileRole: 'main_pipe' },
  { key: 'main_pipe_depth',        label: 'Main Pipe Depth',       parentFileRole: 'main_pipe' },
  { key: 'pump_label',             label: 'Pump Label',            parentFileRole: 'pump' },
  { key: 'pump_model',             label: 'Pump Model',            parentFileRole: 'pump' },
  { key: 'lateral_pipe_label',     label: 'Lateral Pipe Label',    parentFileRole: 'lateral_pipe' },
  { key: 'valve_label',            label: 'Valve Label',           parentFileRole: 'valve' },
  { key: 'valve_type',             label: 'Valve Type',            parentFileRole: 'valve' },
  { key: 'valve_size',             label: 'Valve Size',            parentFileRole: 'valve' },
  // — right column —
  { key: 'tank_label',             label: 'Tank Label',            parentFileRole: 'tank' },
  { key: 'tank_lift',              label: 'Tank Lift',             parentFileRole: 'tank' },
  { key: 'tank_diameter',          label: 'Tank Diameter',         parentFileRole: 'tank' },
  { key: 'tank_min_level',         label: 'Tank Min Level',        parentFileRole: 'tank' },
  { key: 'tank_max_level',         label: 'Tank Max Level',        parentFileRole: 'tank' },
  { key: 'meter_label',            label: 'Meter Label',           parentFileRole: 'meter' },
  { key: 'logger_point_label',     label: 'Logger Point Label',    parentFileRole: 'logger_point' },
  { key: 'reservoir_label',        label: 'Reservoir Label',       parentFileRole: 'reservoir' },
]

const CSV_ATTRIBUTE_ROLES = [
  // — left column (pipeline file attrs) —
  { key: 'main_pipe_label',        label: 'Main Pipe Label',       parentFileRole: 'pipeline' },
  { key: 'main_pipe_install_date', label: 'Main Pipe Install Date',parentFileRole: 'pipeline' },
  { key: 'main_pipe_material',     label: 'Main Pipe Material',    parentFileRole: 'pipeline' },
  { key: 'main_pipe_diameter',     label: 'Main Pipe Diameter',    parentFileRole: 'pipeline' },
  { key: 'main_pipe_depth',        label: 'Main Pipe Depth',       parentFileRole: 'pipeline' },
  { key: 'start_node',             label: 'Start node of Pipe',    parentFileRole: 'pipeline' },
  { key: 'stop_node',              label: 'Stop node of Pipe',     parentFileRole: 'pipeline' },
  // — left column (junction file attrs) —
  { key: 'elevation',              label: 'Elevation Data',        parentFileRole: 'junction' },
  { key: 'valve_type',             label: 'Valve Type',            parentFileRole: 'junction' },
  { key: 'valve_size',             label: 'Valve Size',            parentFileRole: 'junction' },
  // — right column (junction file attrs) —
  { key: 'pump_model',             label: 'Pump Model',            parentFileRole: 'junction' },
  { key: 'tank_lift',              label: 'Tank Lift',             parentFileRole: 'junction' },
  { key: 'tank_diameter',          label: 'Tank Diameter',         parentFileRole: 'junction' },
  { key: 'tank_min_level',         label: 'Tank Min Level',        parentFileRole: 'junction' },
  { key: 'tank_max_level',         label: 'Tank Max Level',        parentFileRole: 'junction' },
]

// All unique attribute keys (union of both modes) – used for initialising selections
const ALL_ATTR_KEYS = [...new Set([
  ...SHP_ATTRIBUTE_ROLES.map(a => a.key),
  ...CSV_ATTRIBUTE_ROLES.map(a => a.key),
])]

// All unique file keys
const ALL_FILE_KEYS = [...new Set([
  ...SHP_FILE_ROLES.map(r => r.key),
  ...CSV_FILE_ROLES.map(r => r.key),
])]

const visibleAttributeRoles = computed(() =>
  props.parserType === 'shapefile' ? SHP_ATTRIBUTE_ROLES : CSV_ATTRIBUTE_ROLES
)

// ─────────────────────────────────────────────
// Options helpers
// ─────────────────────────────────────────────
const fileOptions = computed(() => [
  { label: 'NO FILE', value: '' },
  ...Object.keys(props.attributes).map(n => ({ label: n, value: n })),
])

const getAttributeOptions = (parentFileRole: string) => {
  const fname = selections.files[parentFileRole]
  if (!fname) return [{ label: 'NO INFORMATION', value: '' }]
  const cols = props.attributes[fname] ?? []
  return [{ label: 'NO INFORMATION', value: '' }, ...cols.map(c => ({ label: c, value: c }))]
}

const isParentFileSelected = (parentFileRole: string) => !!selections.files[parentFileRole]

// ─────────────────────────────────────────────
// Reactive state
// ─────────────────────────────────────────────
const selections = reactive({
  files:      ALL_FILE_KEYS.reduce((acc, k) => ({ ...acc, [k]: '' }), {} as Record<string, string>),
  attributes: ALL_ATTR_KEYS.reduce((acc, k) => ({ ...acc, [k]: '' }), {} as Record<string, string>),
})

const onFileChange = (fileRoleKey: string) => {
  // Reset attributes whose parent file just changed
  const currentAttrs = props.parserType === 'shapefile' ? SHP_ATTRIBUTE_ROLES : CSV_ATTRIBUTE_ROLES
  currentAttrs.forEach(a => {
    if (a.parentFileRole === fileRoleKey) selections.attributes[a.key] = ''
  })
}

// ─────────────────────────────────────────────
// Payload – MUST follow QML onPositiveClicked order
//
// attributeResultList[0..21] (QML attributeResultStringList):
//   [0]  pipeLabelName        → main_pipe_label
//   [1]  lateralPipeLabelName → lateral_pipe_label
//   [2]  meterLabelName       → meter_label
//   [3]  valveLabelName       → valve_label
//   [4]  loggerPointLabelName → logger_point_label
//   [5]  materialName         → main_pipe_material
//   [6]  diameterName         → main_pipe_diameter
//   [7]  elevationName        → elevation
//   [8]  startNodeName        → start_node
//   [9]  stopNodeName         → stop_node
//   [10] valveTypeName        → valve_type
//   [11] valveSizeName        → valve_size
//   [12] pumpLabel            → pump_label
//   [13] tankLabel            → tank_label
//   [14] tankDiameter         → tank_diameter
//   [15] tankLift             → tank_lift
//   [16] tankMin              → tank_min_level
//   [17] tankMax              → tank_max_level
//   [18] reservoirLabel       → reservoir_label
//   [19] pipeInstalledYear    → main_pipe_install_date
//   [20] pumpModel            → pump_model
//   [21] pipeDepth            → main_pipe_depth
//
// fileResultList[0..9] (QML fileResultStringList):
//   [0] main_pipe  [1] lateral_pipe  [2] meter  [3] valve  [4] logger_point
//   [5] junction   [6] pipeline      [7] pump   [8] tank   [9] reservoir
// ─────────────────────────────────────────────
const ATTR_KEY_ORDER = [
  'main_pipe_label', 'lateral_pipe_label', 'meter_label', 'valve_label', 'logger_point_label',
  'main_pipe_material', 'main_pipe_diameter',
  'elevation', 'start_node', 'stop_node',
  'valve_type', 'valve_size',
  'pump_label', 'tank_label', 'tank_diameter', 'tank_lift', 'tank_min_level', 'tank_max_level',
  'reservoir_label', 'main_pipe_install_date', 'pump_model', 'main_pipe_depth',
]

const FILE_KEY_ORDER = [
  'main_pipe', 'lateral_pipe', 'meter', 'valve', 'logger_point',
  'junction', 'pipeline', 'pump', 'tank', 'reservoir',
]

const handleConfirm = () => {
  const attributeResultList = ATTR_KEY_ORDER.map(k => selections.attributes[k] ?? '')
  const fileResultList      = FILE_KEY_ORDER.map(k => selections.files[k] ?? '')

  const payload = {
    // Ordered arrays consumed by C++ setAttributeNames / setFileNames
    attributeResultList,
    fileResultList,
    // Role-keyed maps for backend UPSERT per file
    files: Object.fromEntries(
      FILE_KEY_ORDER
        .filter(k => selections.files[k])
        .map(k => [k, selections.files[k]])
    ),
    attributes: Object.fromEntries(
      ATTR_KEY_ORDER
        .filter(k => selections.attributes[k])
        .map(k => [k, selections.attributes[k]])
    ),
  }

  emit('save', payload)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
</style>
