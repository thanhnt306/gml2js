<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition name="ac-fade">
      <div
        v-if="modelValue"
        class="ac-backdrop"
        @mousedown.self="$emit('update:modelValue', false)"
      >
        <Transition name="ac-slide">
          <div v-if="modelValue" class="ac-dialog" role="dialog" aria-modal="true" aria-labelledby="ac-title">

            <!-- Header -->
            <div class="ac-header">
              <span id="ac-title" class="ac-title">Auto-connect option</span>
            </div>

            <!-- Content -->
            <div class="ac-content">

              <!-- Distance row -->
              <div class="ac-row">
                <div class="ac-label-wrap">
                  <span class="ac-label">Distance (m):</span>
                  <div class="ac-tooltip-anchor">
                    <svg class="ac-info-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    <div class="ac-tooltip">Maximum distance for autoconnect a node to a link</div>
                  </div>
                </div>
                <div class="ac-spinbox">
                  <button class="ac-spin-btn" @click="stepDistance(-1)" tabindex="-1">−</button>
                  <input
                    id="ac-distance-input"
                    v-model="distanceInput"
                    type="number"
                    :min="DISTANCE_MIN"
                    :max="DISTANCE_MAX"
                    :step="0.01"
                    class="ac-spin-input"
                    @blur="clampDistance"
                    @keydown.enter="clampDistance"
                  />
                  <button class="ac-spin-btn" @click="stepDistance(1)" tabindex="-1">+</button>
                </div>
              </div>

              <!-- Diameter row -->
              <div class="ac-row">
                <div class="ac-label-wrap">
                  <span class="ac-label">Diameter (mm):</span>
                  <div class="ac-tooltip-anchor">
                    <svg class="ac-info-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    <div class="ac-tooltip">Priority diameter set for new created link</div>
                  </div>
                </div>
                <div class="ac-spinbox">
                  <button class="ac-spin-btn" @click="stepDiameter(-1)" tabindex="-1">−</button>
                  <input
                    id="ac-diameter-input"
                    v-model="diameterInput"
                    type="number"
                    :min="DIAMETER_MIN"
                    :max="DIAMETER_MAX"
                    :step="0.1"
                    class="ac-spin-input"
                    @blur="clampDiameter"
                    @keydown.enter="clampDiameter"
                  />
                  <button class="ac-spin-btn" @click="stepDiameter(1)" tabindex="-1">+</button>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="ac-footer">
              <button class="ac-btn ac-btn-cancel" @click="$emit('update:modelValue', false)">Cancel</button>
              <button class="ac-btn ac-btn-confirm" @click="onConfirm">Confirm</button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// ── Constants (mirrors QML SpinBox ranges) ──────────────────────────────────
const DISTANCE_MIN  = 0.5
const DISTANCE_MAX  = 1.0
const DISTANCE_STEP = 0.01

const DIAMETER_MIN  = 15.0
const DIAMETER_MAX  = 2000.0
const DIAMETER_STEP = 0.1

// ── Props & Emits ───────────────────────────────────────────────────────────
const props = defineProps<{ modelValue: boolean }>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [params: { distance: number; diameter: number }]
}>()

// ── Local state ─────────────────────────────────────────────────────────────
const distanceInput = ref<number>(DISTANCE_MIN)
const diameterInput = ref<number>(DIAMETER_MIN)

// Reset values every time the dialog opens
watch(() => props.modelValue, (open) => {
  if (open) {
    distanceInput.value = DISTANCE_MIN
    diameterInput.value = DIAMETER_MIN
  }
})

// ── Helpers ─────────────────────────────────────────────────────────────────
function clamp(val: number, min: number, max: number, decimals: number) {
  const factor = Math.pow(10, decimals)
  return Math.round(Math.min(Math.max(Number(val) || min, min), max) * factor) / factor
}

function clampDistance() {
  distanceInput.value = clamp(distanceInput.value, DISTANCE_MIN, DISTANCE_MAX, 2)
}

function clampDiameter() {
  diameterInput.value = clamp(diameterInput.value, DIAMETER_MIN, DIAMETER_MAX, 1)
}

function stepDistance(dir: 1 | -1) {
  distanceInput.value = clamp(distanceInput.value + dir * DISTANCE_STEP, DISTANCE_MIN, DISTANCE_MAX, 2)
}

function stepDiameter(dir: 1 | -1) {
  diameterInput.value = clamp(diameterInput.value + dir * DIAMETER_STEP, DIAMETER_MIN, DIAMETER_MAX, 1)
}

// ── Actions ──────────────────────────────────────────────────────────────────
function onConfirm() {
  clampDistance()
  clampDiameter()
  emit('confirm', { distance: distanceInput.value, diameter: diameterInput.value })
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* ── Backdrop ─────────────────────────────────────────────────────────────── */
.ac-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

/* ── Dialog card ─────────────────────────────────────────────────────────── */
.ac-dialog {
  width: 360px;
  background: rgba(0, 0, 0, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.ac-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ac-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.3px;
}

/* ── Content ─────────────────────────────────────────────────────────────── */
.ac-content {
  padding: 20px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ac-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ac-label-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 140px;
}

.ac-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #ffffff;
  white-space: nowrap;
}

/* ── Tooltip ─────────────────────────────────────────────────────────────── */
.ac-tooltip-anchor {
  position: relative;
  display: flex;
  align-items: center;
}

.ac-info-icon {
  width: 14px;
  height: 14px;
  color: #A7A7A7;
  cursor: help;
  flex-shrink: 0;
}

.ac-tooltip {
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(30, 30, 30, 0.97);
  border: 1px solid rgba(255,255,255,0.12);
  color: #e0e0e0;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 6px;
  width: 200px;
  white-space: normal;
  line-height: 1.4;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}

.ac-tooltip-anchor:hover .ac-tooltip {
  opacity: 1;
}

/* ── SpinBox ─────────────────────────────────────────────────────────────── */
.ac-spinbox {
  display: flex;
  align-items: center;
  border: 1px solid #A7A7A7;
  border-radius: 7px;
  overflow: hidden;
  height: 38px;
  width: 150px;
  flex-shrink: 0;
  background: transparent;
  transition: border-color 0.15s ease;
}

.ac-spinbox:focus-within {
  border-color: #529B26;
  box-shadow: 0 0 0 2px rgba(82, 155, 38, 0.18);
}

.ac-spin-btn {
  width: 36px;
  height: 100%;
  background: transparent;
  border: none;
  color: #A7A7A7;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease, color 0.12s ease;
  flex-shrink: 0;
  user-select: none;
}

.ac-spin-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.ac-spin-btn:active {
  background: rgba(255, 255, 255, 0.18);
}

.ac-spin-input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  text-align: center;
  min-width: 0;
  /* Hide native number arrows */
  -moz-appearance: textfield;
}

.ac-spin-input::-webkit-inner-spin-button,
.ac-spin-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
.ac-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px 16px;
  background: rgba(255, 255, 255, 0.04);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.ac-btn {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
  letter-spacing: 0.3px;
}

.ac-btn:active {
  transform: scale(0.97);
}

.ac-btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: #A7A7A7;
}

.ac-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.ac-btn-confirm {
  background: #529B26;
  color: #ffffff;
}

.ac-btn-confirm:hover {
  background: #60b32c;
}

/* ── Transitions ─────────────────────────────────────────────────────────── */
.ac-fade-enter-active,
.ac-fade-leave-active { transition: opacity 0.2s ease; }
.ac-fade-enter-from,
.ac-fade-leave-to    { opacity: 0; }

.ac-slide-enter-active,
.ac-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.ac-slide-enter-from,
.ac-slide-leave-to     { opacity: 0; transform: scale(0.95) translateY(-8px); }
</style>
