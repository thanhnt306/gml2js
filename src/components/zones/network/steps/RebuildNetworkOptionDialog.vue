<template>
  <!-- Reconstruct Options Dialog -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl w-[400px] overflow-hidden flex flex-col font-inter">
        
        <!-- Header -->
        <div class="px-5 py-4 border-b border-[#333] flex items-center justify-between">
          <h3 class="text-white text-base font-semibold">Network adjust option</h3>
          <button @click="close" class="text-[#888] hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-6">
          
          <!-- Reduce Junctions -->
          <div class="flex items-center justify-between group">
            <div class="flex flex-col">
              <span class="text-white text-sm" title="Adjust the maximum length for a pipe segment.">
                Reduce Junctions
              </span>
              <span class="text-xs text-[#888] mt-1 max-w-[200px]">
                Remove unnecessary intermediate junctions.
              </span>
            </div>
            <select
              v-model="reduceJunctions"
              class="w-[120px] bg-black/50 border border-[#444] text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[#529B26]"
            >
              <option :value="0">No</option>
              <option :value="1">Yes</option>
            </select>
          </div>

          <!-- Pipe Resolution -->
          <div class="flex items-center justify-between group">
            <div class="flex flex-col">
              <span class="text-white text-sm" title="Adjust the maximum length for a pipe segment.">
                Pipe Resolution
              </span>
              <span class="text-xs text-[#888] mt-1 max-w-[200px] leading-tight">
                Coarse (50m), Medium (20m), Fine (10m).
              </span>
            </div>
            <select
              v-model="pipeResolution"
              class="w-[120px] bg-black/50 border border-[#444] text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[#529B26]"
            >
              <option :value="0">No</option>
              <option :value="1">Coarse</option>
              <option :value="2">Medium</option>
              <option :value="3">Fine</option>
            </select>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-5 py-4 bg-[#111] flex justify-end space-x-3 border-t border-[#333]">
          <button
            @click="close"
            class="px-4 py-2 bg-transparent text-[#aaa] hover:text-white rounded text-sm transition-colors border border-[#444] hover:border-[#666]"
          >
            Cancel
          </button>
          <button
            @click="confirm"
            class="px-4 py-2 bg-[#529B26] hover:bg-[#6cc537] text-white rounded text-sm font-medium transition-colors"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', payload: { reduceJunctions: number; pipeResolution: number }): void
}>()

// 0: No, 1: Yes
const reduceJunctions = ref<number>(0)

// 0: No, 1: Coarse, 2: Medium, 3: Fine
const pipeResolution = ref<number>(3)

function close() {
  emit('close')
}

function confirm() {
  emit('confirm', {
    reduceJunctions: reduceJunctions.value,
    pipeResolution: pipeResolution.value
  })
}
</script>
