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

<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: {
    type: Number,
    default: 200
  },
  radius: {
    type: Number,
    default: 100
  },
  strokeWidth: {
    type: Number,
    default: 10
  },
  segments: {
    type: Array, // Array of values (e.g. [30, 50, 20])
    default: () => [30, 50, 20]
  },
  colors: {
    type: Array,
    default: () => ["#529B26", "#E2A408", "#FC6B6D"]
  },
  showNumber: {
    type: [Number, String],
    default: 45
  },
  scale: {
    type: Number,
    default: 1
  }
})

// Determine color based on number (logic from QML)
const numberColor = computed(() => {
  const num = parseFloat(props.showNumber)
  if (num < 25) return "#529B26"
  if (num >= 25 && num < 40) return "#E2A408"
  if (num >= 40) return "#FC6B6D"
  return "#529B26"
})

const computedSegments = computed(() => {
  const total = 100 // Fixed total as per QML (const total = 100)
  const cx = props.width / 2
  const cy = props.width / 2 // Bottom is at radius (since height is width/2, cy should be at the bottom line)
  // Actually in QML: width = 2*r + stroke, height = r + stroke... 
  // Let's simplify: ViewBox 0 0 width width/2. Center is width/2, width/2.
  // Wait, if height is width/2, then cy should be width/2.
  
  // QML: startAngle = Math.PI, endAngle = start + span.
  // We need to map this to SVG arc command.
  
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
    const sweepFlag = 1 // Clockwise? No, in SVG Y is down. 
    // Math.PI is 180 deg (left). 2*Math.PI is 360 (right).
    // cos(PI) = -1, sin(PI) = 0. -> (cx-r, cy)
    // In SVG, positive angles go clockwise from X-axis. 
    // We want a semi-circle from left to right (top half).
    // That means angle from PI to 0? No, PI to 2PI (if clockwise) or PI to 0 (counter-clockwise).
    
    // QML code: Math.PI to Math.PI + span. (180 to ...). 
    // If we increment angle, cos goes -1 -> 0 -> 1. sin goes 0 -> -1 -> 0?
    // In Canvas (y down), sin(PI) = 0, sin(1.5PI) = -1 (up), sin(2PI) = 0.
    // So mapping PI to 2PI draws the top half.
    
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
