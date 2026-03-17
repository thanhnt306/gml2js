<template>
  <div class="flex flex-col w-full h-full">

    <!-- ===== PANEL 0: Steps Wizard ===== -->
    <div v-show="currentView === 'steps'" class="flex flex-col w-full h-full">
      <!-- Intro Text -->
      <div class="mb-8 pl-4">
        <h2 class="text-[#529B26] font-montserrat font-semibold text-2xl mb-2">Get started</h2>
        <p class="text-[#A7A7A7] font-inter font-light text-sm max-w-[600px]">
          Follow the 4 steps below to configure your network. Please ensure your data is complete and accurate.
        </p>
      </div>

      <!-- Steps Container -->
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-4">
        <div class="flex flex-col space-y-6 pl-4">

          <!-- Step 1: Display Configuration -->
          <StepItem
            label="Display Configuration"
            number="1"
            :isExpanded="currentStep === 1"
            @toggle="toggleStep(1)"
          >
            <DisplayConfiguration @next="goToStep(2)" />
          </StepItem>

          <!-- Step 2: Add Network Files -->
          <StepItem
            label="Add Network Files"
            number="2"
            :isExpanded="currentStep === 2"
            @toggle="toggleStep(2)"
          >
            <AddNetworkFiles :zoneId="props.zoneId" @next="goToStep(3)" />
          </StepItem>

          <!-- Step 3: Choose Inlet Node -->
          <StepItem
            label="Choose Inlet Node"
            number="3"
            :isExpanded="currentStep === 3"
            @toggle="toggleStep(3)"
          >
            <ChooseInletNode @next="goToOverview" @cancel="goToStep(2)" />
          </StepItem>

          <!-- Step 4: Overview and Edit — clicking navigates to overview panel -->
          <StepItem
            label="Overview and Edit network data"
            number="4"
            :isExpanded="false"
            :isLastStep="true"
            @toggle="goToOverview"
          />

        </div>
      </div>
    </div>

    <!-- ===== PANEL 1: Overview & Edit ===== -->
    <div v-show="currentView === 'overview'" class="flex flex-col w-full h-full">
      <!-- Header row -->
      <div class="flex items-center gap-3 mb-6 pl-4">
        <!-- Step badge -->
        <span class="w-9 h-9 rounded-full bg-[#529B26] flex items-center justify-center font-montserrat font-bold text-white text-sm flex-shrink-0">
          4
        </span>
        <!-- Title -->
        <h2 class="text-white font-montserrat font-semibold text-lg flex-1">
          General review and Edit network data
        </h2>
        <!-- Action buttons -->
        <div class="flex items-center gap-3">
          <button
            @click="currentView = 'steps'"
            class="px-5 py-1.5 rounded font-montserrat font-semibold text-sm text-white bg-[#6A6A6A] hover:bg-[#808080] transition-colors"
          >
            Back to previous steps
          </button>
          <button
            @click="handleFinish"
            class="px-5 py-1.5 rounded font-montserrat font-semibold text-sm text-white bg-[#529B26] hover:bg-[#6cc537] transition-colors"
          >
            Finish
          </button>
        </div>
      </div>

      <!-- Overview content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <OverviewEditNetwork />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StepItem from './StepItem.vue'
import DisplayConfiguration from './steps/DisplayConfiguration.vue'
import AddNetworkFiles from './steps/AddNetworkFiles.vue'
import ChooseInletNode from './steps/ChooseInletNode.vue'
import OverviewEditNetwork from './steps/OverviewEditNetwork.vue'

const props = defineProps<{
  zoneId?: string
}>()

const emit = defineEmits<{
  finish: []
}>()

// 'steps' = panel 0 (wizard), 'overview' = panel 1 (overview & edit)
const currentView = ref<'steps' | 'overview'>('steps')
const currentStep = ref(1)

const toggleStep = (step: number) => {
  if (currentStep.value === step) {
    currentStep.value = 0
  } else {
    currentStep.value = step
  }
}

const goToStep = (step: number) => {
  currentStep.value = step
}

const goToOverview = () => {
  currentView.value = 'overview'
}

const handleFinish = () => {
  emit('finish')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4B5563;
  border-radius: 20px;
}
</style>
