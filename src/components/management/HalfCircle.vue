<template>
  <div class="relative flex justify-center items-end" :style="{ width: width + 'px', height: (width / 2) + 'px' }">
    <!-- Half Circle SVG -->
    <svg :width="width" :height="width / 2" :viewBox="`0 0 ${width} ${width / 2}`" class="overflow-visible">
      <!-- Background Arc (Optional, if needed, otherwise segments cover it) -->
      
      <!-- Segments -->
      <path
        v-for="(segment, index) in computedSegments"
        :key="index"
        :d="segment.d"
        :stroke="segment.color"
        :stroke-width="strokeWidth"
        fill="none"
        stroke-linecap="butt" 
      />
    </svg>

    <!-- Text -->
    <div class="absolute bottom-0 flex flex-col items-center mb-[-5px]">
      <span 
        class="font-montserrat font-medium"
        :style="{ 
          fontSize: (24 * scale) + 'px', 
          lineHeight: (24 * scale) + 'px',
          color: numberColor
        }"
      >
        {{ showNumber }} %
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  width?: number
  radius?: number
  strokeWidth?: number
  segments?: number[]
  colors?: string[]
  showNumber?: number | string
  scale?: number
}>(), {
  width: 200,
  radius: 100,
  strokeWidth: 10,
  segments: () => [30, 50, 20],
  colors: () => ["#529B26", "#E2A408", "#FC6B6D"],
  showNumber: 45,
  scale: 1
})

// Determine color based on number (logic from QML)
const numberColor = computed<string>(() => {
  const num = typeof props.showNumber === 'string' ? parseFloat(props.showNumber) : props.showNumber
  if (num < 25) return "#529B26"
  if (num >= 25 && num < 40) return "#E2A408"
  if (num >= 40) return "#FC6B6D"
  return "#529B26"
})

interface ArcSegment {
  d: string
  color: string
}

const computedSegments = computed<ArcSegment[]>(() => {
  const total = 100 // Fixed total as per QML (const total = 100)
  const cx = props.width / 2
  const cy = props.width / 2 // Bottom is at radius (since height is width/2, cy should be at the bottom line)
  
  let currentAngle = Math.PI
  const r = props.radius

  return props.segments.map((value, index) => {
    const ratio = value / total
    const angleSpan = Math.PI * ratio
    const endAngle = currentAngle + angleSpan

    // Calculate coordinates
    // SVG coords: 0,0 top-left.
    // Center: cx, cy.
    // x = cx + r * cos(a)
    // y = cy + r * sin(a)
    
    const startX = cx + r * Math.cos(currentAngle)
    const startY = cy + r * Math.sin(currentAngle)
    const endX = cx + r * Math.cos(endAngle)
    const endY = cy + r * Math.sin(endAngle)

    const largeArcFlag = angleSpan > Math.PI ? 1 : 0
    // Fix unused sweepFlag by removing it or using correct arc param logic. 
    // The path command uses constant '1' (clockwise)
    
    const d = [
      "M", startX, startY,
      "A", r, r, 0, largeArcFlag, 1, endX, endY
    ].join(" ")

    const color = props.colors[index % props.colors.length]
    
    currentAngle = endAngle
    
    return { d, color }
  })
})
</script>

<style scoped>
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
