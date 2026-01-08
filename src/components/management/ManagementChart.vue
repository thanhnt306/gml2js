<template>
  <div class="relative w-full h-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  mode: {
    type: String,
    default: 'overview' // 'overview' or 'nrw'
  },
  dates: {
    type: Array,
    default: () => ['2024-04-10', '2024-04-11', '2024-04-12']
  },
  supplyData: {
    type: Array,
    default: () => [1200, 1300, 1250]
  },
  consumptionData: {
    type: Array,
    default: () => [1100, 1150, 1180]
  },
  nrwData: {
    type: Array,
    default: () => [100, 150, 70]
  }
})

const chartData = computed(() => {
  if (props.mode === 'overview') {
    return {
      labels: props.dates,
      datasets: [
        {
          label: 'Consumption',
          data: props.consumptionData,
          borderColor: '#39FF14',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: 'Supply',
          data: props.supplyData,
          borderColor: '#225486',
          // Fill to the previous dataset (Consumption) with NRW color (Orange)
          // Adjust opacity as needed. Using a semi-transparent orange.
          backgroundColor: 'rgba(201, 110, 20, 0.4)', 
          fill: '-1', 
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }
        // Removed explicit NRW line dataset as it is now represented by the area
      ]
    }
  } else {
    // NRW Mode
    return {
      labels: props.dates,
      datasets: [
        {
          label: 'NRW',
          data: props.nrwData,
          borderColor: '#C96E14',
          backgroundColor: 'rgba(201, 110, 20, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    }
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { color: '#FFFFFF', font: { family: 'Montserrat', size: 10 } }
    },
    y: {
      grid: { display: false, drawBorder: false },
      ticks: { color: '#FFFFFF', font: { family: 'Montserrat', size: 10 } },
      beginAtZero: true
    }
  },
  plugins: {
    legend: {
      display: false 
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      titleColor: '#fff',
      bodyColor: '#fff',
      titleFont: { family: 'Montserrat' },
      bodyFont: { family: 'Montserrat' }
    }
  },
  elements: {
    point: {
      radius: 0
    }
  },
}))
</script>
