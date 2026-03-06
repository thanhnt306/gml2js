<template>
  <div class="w-full h-full flex items-center justify-center bg-white/5 rounded-lg p-8">
      <div class="flex flex-col items-center">
          <img src="@/assets/images/network_pressed.png" class="w-16 h-16 mb-4 opacity-80" />
          <h3 class="text-white font-montserrat font-bold text-xl mb-2">Network Overview</h3>
          <p class="text-[#A7A7A7] text-sm text-center max-w-[400px]">
              Your network data has been configured. You can now proceed to edit the network topology or start analysis.
          </p>
          
           <div class="mt-8 flex space-x-4">
               <button class="bg-[#225486] hover:bg-[#2a68a5] text-white px-6 py-2 rounded font-medium transition-colors">
                   Edit Topology
               </button>
               <button class="bg-[#529B26] hover:bg-[#6cc537] text-white px-6 py-2 rounded font-medium transition-colors">
                   Start Analysis
               </button>
           </div>
      </div>
  </div>
</template>

<script setup lang="ts">
// Overview Step
</script>
