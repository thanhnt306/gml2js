<template>
  <div class="flex flex-col w-full h-full">
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
                  <AddNetworkFiles @next="goToStep(3)" />
              </StepItem>

              <!-- Step 3: Choose Inlet Node -->
              <StepItem 
                label="Choose Inlet Node" 
                number="3" 
                :isExpanded="currentStep === 3"
                @toggle="toggleStep(3)"
              >
                  <ChooseInletNode @next="goToStep(4)" @cancel="goToStep(2)" />
              </StepItem>

              <!-- Step 4: Overview and Edit -->
              <StepItem 
                label="Overview and Edit network data" 
                number="4" 
                :isExpanded="currentStep === 4"
                :isLastStep="true"
                @toggle="toggleStep(4)"
              >
                  <OverviewEditNetwork />
              </StepItem>

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

const currentStep = ref(1)

const toggleStep = (step: number) => {
    // Basic accordion behavior: click to expand/collapse
    if (currentStep.value === step) {
        // Optional: collapse if clicked again? Or just stay open.
        // QML logic seems to allow clicking title to expand.
        currentStep.value = 0
    } else {
        currentStep.value = step
    }
}

const goToStep = (step: number) => {
    currentStep.value = step
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
