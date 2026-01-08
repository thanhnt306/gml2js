<template>
  <div class="relative w-full h-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  labels: {
    type: Array,
    default: () => ['2026-01-08', '2026-01-09']
  },
  identifiedData: {
    type: Array,
    default: () => [21, 22]
  },
  abnormalData: {
    type: Array,
    default: () => [8, 6]
  },
  falseAlertData: {
    type: Array,
    default: () => [4, 4]
  }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Identified',
      data: props.identifiedData,
      backgroundColor: '#529B26',
      borderRadius: 4,
      barThickness: 20
    },
    {
      label: 'Abnormal',
      data: props.abnormalData,
      backgroundColor: '#CE7829',
      borderRadius: 4,
      barThickness: 20
    },
    {
      label: 'FalseAlert',
      data: props.falseAlertData,
      backgroundColor: '#FC6B6D',
      borderRadius: 4,
      barThickness: 20
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false, drawBorder: true, color: '#FFFFFF' },
      border: { color: '#FFFFFF' },
      ticks: { color: '#FFFFFF', font: { family: 'Montserrat', size: 10 } }
    },
    y: {
      display: false, 
      grid: { display: false }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      titleColor: '#fff',
      bodyColor: '#fff',
      titleFont: { family: 'Montserrat' },
      bodyFont: { family: 'Montserrat' }
    }
  }
}))
</script>
