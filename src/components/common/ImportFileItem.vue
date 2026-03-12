<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- File list (shown when files are added) -->
    <div v-if="files.length > 0" class="flex flex-col gap-1 mb-1">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="flex items-center justify-between bg-white/10 rounded px-2 py-1"
      >
        <div class="flex items-center gap-2 min-w-0">
          <svg class="w-3 h-3 text-[#5DB22A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
          </svg>
          <span class="text-[#bebebe] text-xs truncate font-inter">{{ getFileName(file.name) }}</span>
        </div>
        <button
          @click.stop="removeFile(index)"
          class="text-[#5D5D5D] hover:text-red-400 transition-colors ml-2 flex-shrink-0"
          title="Remove"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Drop Zone -->
    <div
      class="relative rounded-[10px] transition-colors duration-200 cursor-pointer overflow-hidden group"
      :class="[
        files.length > 0 ? 'h-20' : 'h-[120px]',
        isDraggingOver ? 'bg-white/10' : 'bg-[#5D5D5D] hover:bg-white/5',
      ]"
      @dragover.prevent="isDraggingOver = true"
      @dragleave.prevent="isDraggingOver = false"
      @drop.prevent="handleDrop"
      @click="openFilePicker"
    >
      <!-- Dashed border drawn with CSS border-dashed -->
      <div
        class="absolute inset-0 rounded-[10px] border border-dashed border-[#5D5D5D] pointer-events-none transition-colors"
        :class="{ 'border-[#5DB22A]/60': isDraggingOver, 'group-hover:border-[#529B26]': !isDraggingOver }"
      />
      
      <div class="relative h-full flex flex-col items-center justify-center gap-2 p-3">
        <slot name="icon">
           <svg
             class="transition-colors duration-200"
             :class="isDraggingOver ? 'text-[#5DB22A]' : 'text-[#5D5D5D] group-hover:text-white'"
             width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
           >
             <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
           </svg>
        </slot>
        <p class="text-[#A7A7A7] group-hover:text-white text-xs font-inter text-center leading-snug transition-colors">
          Drag &amp; Drop or <span class="text-[#5DB22A] font-medium">click</span> to select file(s)
        </p>
        <p class="text-[#5D5D5D] text-[10px] font-inter">{{ hint }}</p>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      :accept="accept"
      class="hidden"
      @change="handleFileInputChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FileData {
  name: string
  size: number
  file: File
}

interface Props {
  accept?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: '.csv,.shp,.tif,.txt',
  hint: 'Accepted: .csv, .shp, .tif, .txt'
})

const emit = defineEmits<{
  'update:files': [files: FileData[]]
}>()

const files = ref<FileData[]>([])
const isDraggingOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const getFileName = (name: string): string => {
  return name.split(/[\\/]/).pop() ?? name
}

const addFiles = (newFiles: File[]): void => {
  const MAX_FILES = 10
  for (const file of newFiles) {
    if (files.value.length >= MAX_FILES) break
    // Avoid duplicates by name
    if (!files.value.some(f => f.name === file.name)) {
      files.value.push({ name: file.name, size: file.size, file })
    }
  }
  emit('update:files', files.value)
}

const removeFile = (index: number): void => {
  files.value.splice(index, 1)
  emit('update:files', files.value)
}

const handleDrop = (event: DragEvent): void => {
  isDraggingOver.value = false
  const droppedFiles = Array.from(event.dataTransfer?.files ?? [])
  addFiles(droppedFiles)
}

const handleFileInputChange = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files ?? [])
  addFiles(selectedFiles)
  // Reset input so same file can be selected again
  input.value = ''
}

const openFilePicker = (): void => {
  fileInputRef.value?.click()
}

const clear = (): void => {
  files.value = []
  emit('update:files', [])
}

defineExpose({ clear })
</script>
