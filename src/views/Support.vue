<template>
  <div class="h-full bg-[#202020] rounded-[15px] p-8 flex flex-col font-montserrat overflow-hidden">
    <!-- Header -->
    <div class="mb-6 shrink-0">
      <h1 class="text-white text-2xl font-bold mb-4">Support</h1>
      <div class="h-[1px] bg-[#5D5D5D] w-full"></div>
    </div>

    <!-- Q&A Section -->
    <div class="flex-1 overflow-y-auto custom-scrollbar pr-4">
      <h2 class="text-white text-xl font-semibold mb-4">Q&A</h2>
      
      <div class="space-y-2">
        <div 
          v-for="(item, index) in qaItems" 
          :key="index"
          class="bg-white/5 border border-white/5 rounded-lg overflow-hidden transition-all duration-300"
        >
          <!-- Question -->
          <button 
            @click="toggleExpand(index)"
            class="w-full flex items-center justify-between p-4 text-left hover:bg-white/10 transition-colors"
          >
            <span 
              class="text-[#A7A7A7] font-medium text-sm md:text-base pr-4"
              v-html="item.question"
            ></span>
            <img 
              src="@/assets/images/expand_more_down_24x24.svg" 
              class="w-6 h-6 transition-transform duration-300 opacity-70"
              :class="{ 'rotate-180': expandedIndex === index }"
            />
          </button>

          <!-- Answer -->
          <div 
            v-show="expandedIndex === index"
            class="px-4 pb-4 pt-0"
          >
            <div 
              class="text-[#A7A7A7] text-sm md:text-base leading-relaxed whitespace-pre-line"
              v-html="formatAnswer(item.answer)"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Info -->
    <div class="mt-8 pt-6 border-t border-[#5D5D5D] shrink-0">
      <h3 class="text-white text-xl font-semibold mb-3">Have more questions?</h3>
      <div class="text-white font-inter text-sm md:text-base">
        Contact us at 
        <a href="mailto:customerservice@efastec.com" class="text-[#529B26] underline underline-offset-4 hover:text-[#63b334]">
          customerservice@efastec.com
        </a><br />
        or call us at 
        <a href="tel:888-800-3801" class="text-[#529B26] hover:text-[#63b334]">
          888-800-3801
        </a><br />
        We're here to help!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const expandedIndex = ref<number | null>(null)

const toggleExpand = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

const formatAnswer = (text: string) => {
  return text.replace(/<font color='red'>/g, '<span class="text-[#FC6B6D] font-semibold">')
             .replace(/<\/font>/g, '</span>')
}

const qaItems = [
  { 
    question: "1. What are the system and hardware requirements for GAILL?", 
    answer: "• Platform: Windows 10/11 (x64)\n• Diskspace: minimum 32GB of free space\n• Memory: minimum 8GB\n• Processor: minimum 2 cores\n• Video card: any"
  },
  { 
    question: "2. What file formats are supported for uploading GIS/network and operation data?", 
    answer: "• For elevation data: shapefile (.shp) and raster image (.tif)\n• For network data: shapefile (.shp) and worksheet (.csv)\n• For operation data: worksheet (.csv)"
  },
  { 
    question: "3. Do elevation data and the pipe’s burial depth matter?", 
    answer: "Yes. These data are crucial for hydraulic analysis. In fact, the elevation data only reflects the ground surface’s elevation, but the pipe’s elevation is actually needed. Therefore, the pipe’s burial depth, which can be below or above ground surface, acts as the calibration factor to the pipe’s elevation and helps achieve more accurate analysis."
  },
  { 
    question: "4. How should pipe data be structured in my file?", 
    answer: "Each pipe must have:\n• Unique ID\n• Start node and stop node ID and GPS coordinates\n• Length\n• Diameter\n• Material\n• Burial depth\n• Installation date"
  },
  { 
    question: "5. How should I provide meter information?", 
    answer: "Each meter record must include:\n• Unique ID\n• GPS coordinates\n• Consumption data (see GAILL requirements document)"
  },
  { 
    question: "6. Are valves required in the dataset?", 
    answer: "Yes, it is critical to include all control valves within the network, e.g., on-off valves, pressure-reducing valves, flow control valves, etc.\nEach valve must have:\n• Unique ID\n• GPS coordinates\n• Type\n• Size\n• Operation data (see GAILL requirements document)"
  },
  { 
    question: "7. Are pumps required in the dataset?", 
    answer: "Yes, it is important to include all active booster pumps within the network, i.e., pumps used to increase pressure after the inlet.\nEach pump must have:\n• Unique ID\n• GPS coordinates\n• Model (can be selected from GAILL’s documents or a customized curve)\n• Operation data (see GAILL requirements document)"
  },
  { 
    question: "8. Do I need to include storage tanks and reservoirs?", 
    answer: "Yes, if the network or a portion of it is gravity-fed by tanks or reservoirs, it will be essential to include them in the network.\nEach tank or reservoir must have:\n• Unique ID\n• GPS coordinates\n• Diameter, min/max level, and lift (for tank)\n• Initial level (for reservoir)\n• Operation data (see GAILL requirements document)"
  },
  { 
    question: "9. What operational data is mandatory for analysis?", 
    answer: "At least 90 consecutive days of <font color='red'>synchronous data</font>:\n• Inlet pressure and flow rate data at a minimum of 1-hour intervals\n• Customer consumption volume data (minimum monthly)\n• Pressure measurement within the network (other than the inlet) at the same or denser interval as the inlet\n• Valve, pump, tank, and reservoir data (if presented in the map)"
  },
  { 
    question: "10. What happens if different datasets don’t align in time?", 
    answer: "All operational datasets must cover the <font color='red'>same time window</font>, which is a supercritical requirement. Misaligned data will cause system errors or rejection during ingestion."
  },
  { 
    question: "11. Can I include leak detection & repair history?", 
    answer: "Yes, this dataset is optional, but it can improve the detection result accuracy. The input format can be found in GAILL’s requirement document."
  }
]
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
