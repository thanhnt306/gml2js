<template>
  <div class="w-full flex flex-col mb-4 bg-transparent">
    <!-- Header: Zone Name & Subtitle -->
    <div class="flex flex-col mb-[2px] pl-1">
      <span class="text-white font-montserrat font-semibold text-sm leading-tight">{{ zoneName }}</span>
      <span class="text-white font-montserrat font-medium text-[11px] leading-tight mt-[1px]">NRW Health Index</span>
    </div>

    <!-- Border Container -->
    <div class="w-full h-[81px] border border-[#a7a7a7]/25 rounded-[4px] overflow-hidden flex relative">
       
       <!-- Layout Spacers and Columns based on QML percentages of parent width -->
       <!-- QML: Left Margin 6%, Right Margin (Spacing) 7.5%, Box Width 38.5% -->
       
       <!-- 6% Left Spacer -->
       <div class="w-[6%] flex-none"></div>

       <!-- Left Column (38.5%) -->
       <div class="w-[38.5%] flex flex-col pt-[7px]">
          <span class="text-[#7A7A7A] font-montserrat font-semibold text-xs leading-none mb-1">Cumulative Insights</span>
          <span class="text-[#7A7A7A] font-montserrat font-normal text-[8px] leading-none mb-[8px]">{{ cumulativeDate }}</span>
          
          <!-- Colored Box -->
          <div 
            class="w-full h-[34px] rounded-[6px] flex items-center justify-center transition-colors duration-300"
            :class="getBgColorClass(cumulativePercent)"
          >
             <span 
                class="font-montserrat font-medium text-lg"
                :class="getTextColorClass(cumulativePercent)"
             >
                {{ cumulativePercent }} %
             </span>
          </div>
       </div>

       <!-- 7.5% Middle Spacer -->
       <div class="w-[7.5%] flex-none"></div>

       <!-- Right Column (38.5%) -->
       <div class="w-[38.5%] flex flex-col pt-[7px]">
          <span class="text-[#7A7A7A] font-montserrat font-semibold text-xs leading-none mb-1">Latest Updates</span>
          <span class="text-[#7A7A7A] font-montserrat font-normal text-[8px] leading-none mb-[8px]">{{ lastUpdateDate }}</span>
          
          <!-- Colored Box -->
          <div 
            class="w-full h-[34px] rounded-[6px] flex items-center justify-center transition-colors duration-300"
            :class="getBgColorClass(lastUpdatePercent)"
          >
             <span 
                 class="font-montserrat font-medium text-lg"
                 :class="getTextColorClass(lastUpdatePercent)"
             >
                {{ lastUpdatePercent }} %
             </span>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  zoneName: { type: String, default: 'Zone Name' },
  cumulativePercent: { type: Number, default: 0 },
  cumulativeDate: { type: String, default: '' },
  lastUpdatePercent: { type: Number, default: 0 },
  lastUpdateDate: { type: String, default: '' }
})

// Logic from QML:
// Percent < 21: Green (#1A529B26 bg, #529B26 text)
// 21 <= Percent < 30: Yellow (#1AE2A408 bg, #E2A408 text)
// Percent >= 30: Red (#1AFC6B6D bg, #FC6B6D text)
// Default Green

const getBgColorClass = (percent) => {
    if (percent < 21) return 'bg-[#529B26]/10'
    if (percent >= 21 && percent < 30) return 'bg-[#E2A408]/10'
    if (percent >= 30) return 'bg-[#FC6B6D]/10'
    return 'bg-[#529B26]/10'
}

const getTextColorClass = (percent) => {
    // We can define custom classes in <style> or use arbitrary values
    if (percent < 21) return 'text-nrw-green'
    if (percent >= 21 && percent < 30) return 'text-nrw-yellow'
    if (percent >= 30) return 'text-nrw-red'
    return 'text-nrw-green' 
}
</script>

<style scoped>
.text-nrw-green { color: #529B26; }
.text-nrw-yellow { color: #E2A408; }
.text-nrw-red { color: #FC6B6D; }
</style>
