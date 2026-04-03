<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-[#1e1e1e] border border-white/10 rounded-[4px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-inter">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-white/10">
        <h2 class="text-2xl font-montserrat font-semibold text-white">Network Info</h2>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">

        <!-- Section 1: Match your files -->
        <div>
          <h3 class="text-white font-semibold text-base mb-5">Match your files</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-5">
            <div v-for="role in visibleFileRoles" :key="role.key" class="flex items-center gap-4">
              <span class="text-[#7A7A7A] text-sm whitespace-nowrap w-36">{{ role.label }}</span>
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
          <h3 class="text-white font-semibold text-base mb-5">Match the attributes from your file</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4">
            <div v-for="attr in visibleAttributeRoles" :key="attr.key" class="flex items-center gap-6">
              <span class="text-[#7A7A7A] text-sm whitespace-nowrap w-48">{{ attr.label }}</span>
              <div class="flex-1 min-w-[180px]">
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

// --- Types ---
type ParserType = 'shapefile' | 'csv'

interface Props {
  show: boolean
  // attributes: map of filename -> list of column names (returned by upload-gis API)
  attributes: Record<string, string[]>
  // Parser type: 'shapefile' (default) or 'csv'
  parserType?: ParserType
}

const props = withDefaults(defineProps<Props>(), {
  parserType: 'shapefile'
})
const emit = defineEmits(['save', 'cancel'])

// -------------------------------------------------------------------
// File role definitions
// fileResultStringList order (from QML onPositiveClicked line 826-834):
//   [0] mainPipeFileName
//   [1] lateralPipeFileName
//   [2] meterFileName
//   [3] valveFileName
//   [4] loggerPointFileName
//   [5] junctionFileName       ← CSV mode
//   [6] pipeLineFileName       ← CSV mode
//   [7] boosterPumpFileName
//   [8] tankFileName
//   [9] reservoirFileName
// -------------------------------------------------------------------
const ALL_FILE_ROLES = [
  { key: 'main_pipe',      label: 'Main Pipe File',      modes: ['shapefile'] as ParserType[] }, // [0]
  { key: 'lateral_pipe',   label: 'Lateral Pipe File',   modes: ['shapefile'] as ParserType[] }, // [1]
  { key: 'meter',          label: 'Meter File',          modes: ['shapefile'] as ParserType[] }, // [2]
  { key: 'valve',          label: 'Valve File',          modes: ['shapefile'] as ParserType[] }, // [3]
  { key: 'logger_point',   label: 'Logger Point File',   modes: ['shapefile'] as ParserType[] }, // [4]
  { key: 'junction',       label: 'Junction File',       modes: ['csv'] as ParserType[]       }, // [5]
  { key: 'pipeline',       label: 'Pipeline File',       modes: ['csv'] as ParserType[]       }, // [6]
  { key: 'pump',           label: 'Booster Pump File',   modes: ['shapefile'] as ParserType[] }, // [7]
  { key: 'tank',           label: 'Storage Tank File',   modes: ['shapefile'] as ParserType[] }, // [8]
  { key: 'reservoir',      label: 'Reservoir File',      modes: ['shapefile'] as ParserType[] }, // [9]
]

// -------------------------------------------------------------------
// Attribute role definitions
// attributeResultStringList order (from QML onPositiveClicked line 803-824):
//   [0]  pipeLabelName       → main_pipe_label
//   [1]  lateralPipeLabelName→ lateral_pipe_label
//   [2]  meterLabelName      → meter_label
//   [3]  valveLabelName      → valve_label
//   [4]  loggerPointLabelName→ logger_point_label
//   [5]  materialName        → main_pipe_material
//   [6]  diameterName        → main_pipe_diameter
//   [7]  elevationName       → elevation      ← CSV mode (junction file)
//   [8]  startNodeName       → start_node     ← CSV mode (pipeline file)
//   [9]  stopNodeName        → stop_node      ← CSV mode (pipeline file)
//   [10] valveTypeName       → valve_type
//   [11] valveSizeName       → valve_size
//   [12] pumpLabel           → pump_label
//   [13] tankLabel           → tank_label
//   [14] tankDiameter        → tank_diameter
//   [15] tankLift            → tank_lift
//   [16] tankMin             → tank_min_level
//   [17] tankMax             → tank_max_level
//   [18] reservoirLabel      → reservoir_label
//   [19] pipeInstalledYear   → main_pipe_install_date
//   [20] pumpModel           → pump_model
//   [21] pipeDepth           → main_pipe_depth
// -------------------------------------------------------------------
const ALL_ATTRIBUTE_ROLES = [
  // index 0
  { key: 'main_pipe_label',       label: 'Main Pipe Label',       parentFileRole: 'main_pipe',    modes: ['shapefile'] as ParserType[] },
  // index 1
  { key: 'lateral_pipe_label',    label: 'Lateral Pipe Label',    parentFileRole: 'lateral_pipe', modes: ['shapefile'] as ParserType[] },
  // index 2
  { key: 'meter_label',           label: 'Meter Label',           parentFileRole: 'meter',        modes: ['shapefile'] as ParserType[] },
  // index 3
  { key: 'valve_label',           label: 'Valve Label',           parentFileRole: 'valve',        modes: ['shapefile'] as ParserType[] },
  // index 4
  { key: 'logger_point_label',    label: 'Logger Point Label',    parentFileRole: 'logger_point', modes: ['shapefile'] as ParserType[] },
  // index 5
  { key: 'main_pipe_material',    label: 'Main Pipe Material',    parentFileRole: 'main_pipe',    modes: ['shapefile'] as ParserType[] },
  // index 6
  { key: 'main_pipe_diameter',    label: 'Main Pipe Diameter',    parentFileRole: 'main_pipe',    modes: ['shapefile'] as ParserType[] },
  // index 7 – junction file provides elevation in CSV mode
  { key: 'elevation',             label: 'Elevation Data',        parentFileRole: 'junction',     modes: ['csv'] as ParserType[]       },
  // index 8
  { key: 'start_node',            label: 'Start node of Pipe',    parentFileRole: 'pipeline',     modes: ['csv'] as ParserType[]       },
  // index 9
  { key: 'stop_node',             label: 'Stop node of Pipe',     parentFileRole: 'pipeline',     modes: ['csv'] as ParserType[]       },
  // index 10
  { key: 'valve_type',            label: 'Valve Type',            parentFileRole: 'valve',        modes: ['shapefile'] as ParserType[] },
  // index 11
  { key: 'valve_size',            label: 'Valve Size',            parentFileRole: 'valve',        modes: ['shapefile'] as ParserType[] },
  // index 12
  { key: 'pump_label',            label: 'Pump Label',            parentFileRole: 'pump',         modes: ['shapefile'] as ParserType[] },
  // index 13
  { key: 'tank_label',            label: 'Tank Label',            parentFileRole: 'tank',         modes: ['shapefile'] as ParserType[] },
  // index 14
  { key: 'tank_diameter',         label: 'Tank Diameter',         parentFileRole: 'tank',         modes: ['shapefile'] as ParserType[] },
  // index 15
  { key: 'tank_lift',             label: 'Tank Lift',             parentFileRole: 'tank',         modes: ['shapefile'] as ParserType[] },
  // index 16
  { key: 'tank_min_level',        label: 'Tank Min Level',        parentFileRole: 'tank',         modes: ['shapefile'] as ParserType[] },
  // index 17
  { key: 'tank_max_level',        label: 'Tank Max Level',        parentFileRole: 'tank',         modes: ['shapefile'] as ParserType[] },
  // index 18
  { key: 'reservoir_label',       label: 'Reservoir Label',       parentFileRole: 'reservoir',    modes: ['shapefile'] as ParserType[] },
  // index 19
  { key: 'main_pipe_install_date',label: 'Main Pipe Install Date',parentFileRole: 'main_pipe',    modes: ['shapefile'] as ParserType[] },
  // index 20
  { key: 'pump_model',            label: 'Pump Model',            parentFileRole: 'pump',         modes: ['shapefile'] as ParserType[] },
  // index 21
  { key: 'main_pipe_depth',       label: 'Main Pipe Depth',       parentFileRole: 'main_pipe',    modes: ['shapefile'] as ParserType[] },
]

// --- Computed: only show roles valid for current parserType ---
const visibleFileRoles = computed(() =>
  ALL_FILE_ROLES.filter(r => r.modes.includes(props.parserType))
)
const visibleAttributeRoles = computed(() =>
  ALL_ATTRIBUTE_ROLES.filter(a => a.modes.includes(props.parserType))
)

// --- Options ---
const fileOptions = computed(() => [
  { label: 'NO FILE', value: '' },
  ...Object.keys(props.attributes).map(name => ({ label: name, value: name }))
])

const getAttributeOptions = (parentFileRole: string) => {
  const selectedFileName = selections.files[parentFileRole]
  if (!selectedFileName) return [{ label: 'NO INFORMATION', value: '' }]
  const cols = props.attributes[selectedFileName] || []
  return [{ label: 'NO INFORMATION', value: '' }, ...cols.map(c => ({ label: c, value: c }))]
}

const isParentFileSelected = (parentFileRole: string): boolean => {
  return !!selections.files[parentFileRole]
}

// --- State ---
const selections = reactive({
  files:      ALL_FILE_ROLES.reduce((acc, r) => ({ ...acc, [r.key]: '' }), {} as Record<string, string>),
  attributes: ALL_ATTRIBUTE_ROLES.reduce((acc, a) => ({ ...acc, [a.key]: '' }), {} as Record<string, string>),
})

const onFileChange = (fileRoleKey: string) => {
  ALL_ATTRIBUTE_ROLES.forEach(attr => {
    if (attr.parentFileRole === fileRoleKey) {
      selections.attributes[attr.key] = ''
    }
  })
}

// --- Confirm: emit data in the same ordered structure as QML onPositiveClicked ---
const handleConfirm = () => {
  // attributeResultStringList (indices 0-21) – MUST match QML order exactly
  const attributeList = ALL_ATTRIBUTE_ROLES.map(a => selections.attributes[a.key] || '')

  // fileResultStringList (indices 0-9) – MUST match QML order exactly
  const fileList = ALL_FILE_ROLES.map(r => selections.files[r.key] || '')

  // Build the payload for /save-roles API:
  //   files:      { role_key: filename }    – non-empty entries only
  //   attributes: { attr_key: column_name } – non-empty entries only
  //   (ordered lists are included for setAttributeNames / setFileNames usage)
  const payload = {
    // Ordered arrays for C++ setAttributeNames / setFileNames
    attributeResultList: attributeList,
    fileResultList: fileList,
    // Role-keyed maps convenient for backend UPSERT per file
    files: Object.fromEntries(
      ALL_FILE_ROLES
        .filter(r => selections.files[r.key])
        .map(r => [r.key, selections.files[r.key]])
    ),
    attributes: Object.fromEntries(
      ALL_ATTRIBUTE_ROLES
        .filter(a => selections.attributes[a.key])
        .map(a => [a.key, selections.attributes[a.key]])
    ),
  }

  emit('save', payload)
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
