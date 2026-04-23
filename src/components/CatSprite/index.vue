<template>
  <div class="cat-sprite" :class="[`stage-${stage}`, `body-${bodyType}`, `emotion-${emotion}`, currentAction]">
    <div class="cat-glow" v-if="stage >= 6"></div>
    <div class="cat-container" :class="currentAction">
      <svg viewBox="0 0 200 220" class="cat-svg">
        <defs>
          <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" :stop-color="furColorLight" />
            <stop offset="100%" :stop-color="furColor" />
          </radialGradient>
          <radialGradient id="bellyGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" :stop-color="bellyColorLight" />
            <stop offset="100%" :stop-color="bellyColor" />
          </radialGradient>
          <filter id="glow" v-if="stage >= 6">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="starGlow" v-if="stage >= 6">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g :transform="`translate(100,110) scale(${scale}) translate(-100,-110)`" :filter="stage >= 6 ? 'url(#glow)' : ''">
          <!-- Tail -->
          <g class="cat-tail-group" :style="tailTransformStyle">
            <path :d="tailPath" :fill="furColor" />
          </g>

          <!-- Cape (behind body) -->
          <template v-if="clothing === 'cloth_cape'">
            <path :d="capePath" fill="#c62828" opacity="0.85" />
            <path :d="capeInnerPath" fill="#b71c1c" opacity="0.6" />
          </template>

          <!-- Body -->
          <ellipse :cx="bodyCx" :cy="bodyCy" :rx="bodyRx" :ry="bodyRy" fill="url(#bodyGrad)" />

          <!-- Belly -->
          <ellipse :cx="bellyCx" :cy="bellyCy" :rx="bellyRx" :ry="bellyRy" fill="url(#bellyGrad)" />

          <!-- Dress (on body) -->
          <template v-if="clothing === 'cloth_dress'">
            <path :d="dressPath" fill="#ff69b4" opacity="0.9" />
            <ellipse :cx="bodyCx" :cy="bodyCy - bodyRy * 0.3" :rx="bodyRx * 0.7" :ry="bodyRy * 0.15" fill="#ff1493" opacity="0.7" />
            <circle :cx="bodyCx" :cy="bodyCy - bodyRy * 0.3" :r="2" fill="#fff" opacity="0.8" />
          </template>

          <!-- Scarf (on neck) -->
          <template v-if="clothing === 'cloth_scarf'">
            <ellipse :cx="bodyCx" :cy="headCy + headR * 0.55" :rx="bodyRx * 0.85" :ry="headR * 0.25" fill="#4caf50" opacity="0.9" />
            <ellipse :cx="bodyCx" :cy="headCy + headR * 0.55" :rx="bodyRx * 0.7" :ry="headR * 0.15" fill="#66bb6a" opacity="0.5" />
            <rect :x="bodyCx + bodyRx * 0.2" :y="headCy + headR * 0.5" :width="6" :height="bodyRy * 0.7" rx="3" fill="#388e3c" opacity="0.9" />
            <rect :x="bodyCx + bodyRx * 0.2 + 2" :y="headCy + headR * 0.5 + 3" :width="2" :height="bodyRy * 0.5" rx="1" fill="#2e7d32" opacity="0.6" />
          </template>

          <!-- Front paws -->
          <g class="paw-left" :style="leftPawStyle">
            <ellipse :cx="bodyCx - bodyRx * 0.35" :cy="pawY" :rx="pawRx" :ry="pawRy" :fill="furColor" />
          </g>
          <g class="paw-right" :style="rightPawStyle">
            <ellipse :cx="bodyCx + bodyRx * 0.35" :cy="pawY" :rx="pawRx" :ry="pawRy" :fill="furColor" />
          </g>

          <!-- Head -->
          <g class="cat-head" :style="headTransformStyle">
            <circle :cx="headCx" :cy="headCy" :r="headR" fill="url(#bodyGrad)" />

            <!-- Ears -->
            <polygon :points="leftEarPoints" :fill="furColor" />
            <polygon :points="rightEarPoints" :fill="furColor" />
            <polygon :points="leftInnerEarPoints" :fill="earInnerColor" />
            <polygon :points="rightInnerEarPoints" :fill="earInnerColor" />

            <!-- Crown (behind ears, on top of head) -->
            <template v-if="decoration === 'deco_crown'">
              <path :d="crownPath" fill="#ffd700" stroke="#ff8f00" stroke-width="1" />
              <circle :cx="headCx - 5" :cy="headCy - headR * 0.95" :r="1.5" fill="#e53935" />
              <circle :cx="headCx" :cy="headCy - headR * 1.05" :r="1.8" fill="#2196f3" />
              <circle :cx="headCx + 5" :cy="headCy - headR * 0.95" :r="1.5" fill="#4caf50" />
            </template>

            <!-- Bow (on top of head) -->
            <template v-if="decoration === 'deco_bow'">
              <ellipse :cx="headCx - 7" :cy="headCy - headR * 0.85" :rx="7" :ry="5" fill="#ff69b4" opacity="0.9" />
              <ellipse :cx="headCx + 7" :cy="headCy - headR * 0.85" :rx="7" :ry="5" fill="#ff69b4" opacity="0.9" />
              <circle :cx="headCx" :cy="headCy - headR * 0.85" :r="3" fill="#ff1493" />
              <ellipse :cx="headCx - 7" :cy="headCy - headR * 0.85" :rx="4" :ry="2.5" fill="#ffb6c1" opacity="0.5" />
              <ellipse :cx="headCx + 7" :cy="headCy - headR * 0.85" :rx="4" :ry="2.5" fill="#ffb6c1" opacity="0.5" />
            </template>

            <!-- Stage 4+ markings -->
            <template v-if="stage >= 4">
              <path :d="foreheadMarking" :fill="markingColor" opacity="0.6" />
            </template>

            <!-- Stage 5+ mane -->
            <template v-if="stage >= 5">
              <ellipse :cx="headCx" :cy="headCy + headR * 0.2" :rx="headR * 1.3" :ry="headR * 1.1" :fill="furColor" opacity="0.5" />
            </template>

            <!-- Eyes -->
            <template v-if="isBlinking">
              <path :d="leftEyeBlink" :stroke="eyeColor" stroke-width="2" fill="none" stroke-linecap="round" />
              <path :d="rightEyeBlink" :stroke="eyeColor" stroke-width="2" fill="none" stroke-linecap="round" />
            </template>
            <template v-else-if="emotion === 'happy' || emotion === 'excited'">
              <path :d="leftEyeHappy" :stroke="eyeColor" stroke-width="2.5" fill="none" stroke-linecap="round" />
              <path :d="rightEyeHappy" :stroke="eyeColor" stroke-width="2.5" fill="none" stroke-linecap="round" />
            </template>
            <template v-else-if="emotion === 'angry'">
              <ellipse :cx="leftEyeX" :cy="headCy - headR * 0.1" :rx="eyeRx" :ry="eyeRy" :fill="eyeColor" />
              <ellipse :cx="rightEyeX" :cy="headCy - headR * 0.1" :rx="eyeRx" :ry="eyeRy" :fill="eyeColor" />
              <line :x1="leftEyeX - eyeRx * 1.5" :y1="headCy - headR * 0.35" :x2="leftEyeX + eyeRx * 0.5" :y2="headCy - headR * 0.2" :stroke="furColor" stroke-width="2.5" />
              <line :x1="rightEyeX + eyeRx * 1.5" :y1="headCy - headR * 0.35" :x2="rightEyeX - eyeRx * 0.5" :y2="headCy - headR * 0.2" :stroke="furColor" stroke-width="2.5" />
            </template>
            <template v-else>
              <ellipse :cx="leftEyeX" :cy="headCy - headR * 0.1" :rx="eyeRx" :ry="eyeRy" :fill="eyeColor" />
              <ellipse :cx="rightEyeX" :cy="headCy - headR * 0.1" :rx="eyeRx" :ry="eyeRy" :fill="eyeColor" />
              <ellipse :cx="leftEyeX" :cy="headCy - headR * 0.1" :rx="eyeRx * 0.5" :ry="eyeRy" :fill="pupilColor" />
              <ellipse :cx="rightEyeX" :cy="headCy - headR * 0.1" :rx="eyeRx * 0.5" :ry="eyeRy" :fill="pupilColor" />
              <circle :cx="leftEyeX + eyeRx * 0.2" :cy="headCy - headR * 0.15" :r="eyeRx * 0.2" fill="#fff" />
              <circle :cx="rightEyeX + eyeRx * 0.2" :cy="headCy - headR * 0.15" :r="eyeRx * 0.2" fill="#fff" />
            </template>

            <!-- Stage 6 heterochromia -->
            <template v-if="stage >= 6 && !isBlinking">
              <circle :cx="leftEyeX" :cy="headCy - headR * 0.1" :r="eyeRx * 0.8" fill="none" :stroke="'#00e5ff'" stroke-width="0.5" filter="url(#starGlow)" />
              <circle :cx="rightEyeX" :cy="headCy - headR * 0.1" :r="eyeRx * 0.8" fill="none" :stroke="'#ff4081'" stroke-width="0.5" filter="url(#starGlow)" />
            </template>

            <!-- Nose -->
            <polygon :points="nosePoints" :fill="noseColor" />

            <!-- Mouth -->
            <template v-if="emotion === 'hungry' || emotion === 'sad'">
              <path :d="sadMouth" stroke="#5a3e2b" stroke-width="1.5" fill="none" stroke-linecap="round" />
            </template>
            <template v-else>
              <path :d="happyMouth" stroke="#5a3e2b" stroke-width="1.5" fill="none" stroke-linecap="round" />
            </template>

            <!-- Whiskers -->
            <line v-for="w in whiskers" :key="w.key" :x1="w.x1" :y1="w.y1" :x2="w.x2" :y2="w.y2" stroke="#ddd" stroke-width="0.8" opacity="0.6" />

            <!-- Blush (happy/excited) -->
            <template v-if="emotion === 'happy' || emotion === 'excited'">
              <ellipse :cx="leftEyeX - eyeRx" :cy="headCy + headR * 0.15" :rx="headR * 0.12" :ry="headR * 0.07" fill="#ff6b6b" opacity="0.4" />
              <ellipse :cx="rightEyeX + eyeRx" :cy="headCy + headR * 0.15" :rx="headR * 0.12" :ry="headR * 0.07" fill="#ff6b6b" opacity="0.4" />
            </template>

            <!-- Bowtie (on neck) -->
            <template v-if="decoration === 'deco_bowtie'">
              <polygon :points="bowtieLeftPoints" fill="#1a237e" opacity="0.9" />
              <polygon :points="bowtieRightPoints" fill="#1a237e" opacity="0.9" />
              <circle :cx="headCx" :cy="headCy + headR * 0.55" :r="2.5" fill="#ffd700" />
              <polygon :points="bowtieLeftPoints" fill="url(#bodyGrad)" opacity="0.15" />
              <polygon :points="bowtieRightPoints" fill="url(#bodyGrad)" opacity="0.15" />
            </template>
          </g>

          <!-- Stage 6 star effects -->
          <template v-if="stage >= 6">
            <circle v-for="s in stars" :key="s.key" :cx="s.x" :cy="s.y" :r="s.r" :fill="s.color" opacity="0.7" filter="url(#starGlow)" class="twinkle" />
          </template>
        </g>
      </svg>
    </div>

    <div class="emotion-bubble" :class="`emotion-${emotion}`">
      {{ emotionEmoji }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { GrowthStage, BodyType, EmotionType } from '@/types'

type CatAction = 'idle' | 'blink' | 'head-tilt' | 'scratch-ear' | 'lick-paw' | 'stretch' | 'wiggle'

const props = defineProps<{
  stage: GrowthStage
  bodyType: BodyType
  emotion: EmotionType
  clothing?: string
  decoration?: string
}>()

const currentAction = ref<CatAction>('idle')
const isBlinking = ref(false)
let actionTimer: ReturnType<typeof setTimeout> | null = null
let blinkTimer: ReturnType<typeof setInterval> | null = null

const viewBox = '0 0 200 220'

const scale = computed(() => {
  const s = props.stage
  if (s <= 1) return 0.7
  if (s <= 2) return 0.85
  if (s <= 3) return 1.0
  if (s <= 4) return 1.15
  if (s <= 5) return 1.3
  return 1.45
})

const furColor = computed(() => {
  const s = props.stage
  if (s <= 1) return '#ffe0b2'
  if (s <= 2) return '#ffb74d'
  if (s <= 3) return '#ff9800'
  if (s <= 4) return '#f57c00'
  if (s <= 5) return '#e65100'
  return '#ff6d00'
})

const furColorLight = computed(() => {
  const s = props.stage
  if (s <= 1) return '#fff8e1'
  if (s <= 2) return '#ffe0b2'
  if (s <= 3) return '#ffcc80'
  if (s <= 4) return '#ffb74d'
  if (s <= 5) return '#ffa726'
  return '#ff9100'
})

const bellyColor = '#fff3e0'
const bellyColorLight = '#ffffff'
const earInnerColor = '#ffab91'
const noseColor = '#e91e63'
const eyeColor = computed(() => props.stage >= 6 ? '#1a1a2e' : '#3e2723')
const pupilColor = '#1a1a1a'
const markingColor = '#e65100'

const bodyCx = 100

const bodyCy = computed(() => {
  const s = props.stage
  return s <= 1 ? 135 : s <= 2 ? 130 : s <= 3 ? 128 : s <= 4 ? 126 : s <= 5 ? 124 : 122
})

const bodyRx = computed(() => {
  const base = props.stage <= 1 ? 28 : props.stage <= 2 ? 34 : props.stage <= 3 ? 40 : props.stage <= 4 ? 46 : props.stage <= 5 ? 52 : 56
  if (props.bodyType === 'thin') return base * 0.8
  if (props.bodyType === 'fat') return base * 1.25
  return base
})

const bodyRy = computed(() => {
  const base = props.stage <= 1 ? 24 : props.stage <= 2 ? 30 : props.stage <= 3 ? 36 : props.stage <= 4 ? 42 : props.stage <= 5 ? 48 : 52
  if (props.bodyType === 'thin') return base * 0.85
  if (props.bodyType === 'fat') return base * 1.2
  return base
})

const bellyCx = computed(() => bodyCx)
const bellyCy = computed(() => bodyCy.value + bodyRy.value * 0.15)
const bellyRx = computed(() => bodyRx.value * 0.6)
const bellyRy = computed(() => bodyRy.value * 0.65)

const headR = computed(() => props.stage <= 1 ? 30 : props.stage <= 2 ? 34 : props.stage <= 3 ? 36 : props.stage <= 4 ? 38 : props.stage <= 5 ? 42 : 46)
const headCx = computed(() => bodyCx)
const headCy = computed(() => bodyCy.value - bodyRy.value - headR.value * 0.65)

const leftEyeX = computed(() => headCx.value - headR.value * 0.3)
const rightEyeX = computed(() => headCx.value + headR.value * 0.3)
const eyeRx = computed(() => headR.value * 0.15)
const eyeRy = computed(() => headR.value * 0.18)

const leftEyeHappy = computed(() => {
  const x = leftEyeX.value, y = headCy.value - headR.value * 0.1, r = eyeRx.value
  return `M${x - r * 1.5},${y} Q${x},${y - r * 2} ${x + r * 1.5},${y}`
})

const rightEyeHappy = computed(() => {
  const x = rightEyeX.value, y = headCy.value - headR.value * 0.1, r = eyeRx.value
  return `M${x - r * 1.5},${y} Q${x},${y - r * 2} ${x + r * 1.5},${y}`
})

const leftEyeBlink = computed(() => {
  const x = leftEyeX.value, y = headCy.value - headR.value * 0.1, r = eyeRx.value
  return `M${x - r * 1.5},${y} L${x + r * 1.5},${y}`
})

const rightEyeBlink = computed(() => {
  const x = rightEyeX.value, y = headCy.value - headR.value * 0.1, r = eyeRx.value
  return `M${x - r * 1.5},${y} L${x + r * 1.5},${y}`
})

const nosePoints = computed(() => {
  const cx = headCx.value, cy = headCy.value + headR.value * 0.15
  return `${cx},${cy - 2} ${cx - 3},${cy + 2} ${cx + 3},${cy + 2}`
})

const happyMouth = computed(() => {
  const cx = headCx.value, cy = headCy.value + headR.value * 0.15 + 3
  return `M${cx - 6},${cy} Q${cx - 3},${cy + 5} ${cx},${cy + 2} Q${cx + 3},${cy + 5} ${cx + 6},${cy}`
})

const sadMouth = computed(() => {
  const cx = headCx.value, cy = headCy.value + headR.value * 0.15 + 6
  return `M${cx - 5},${cy} Q${cx},${cy - 4} ${cx + 5},${cy}`
})

const whiskers = computed(() => {
  const cx = headCx.value, cy = headCy.value + headR.value * 0.2
  const lx = cx - headR.value * 0.5, rx = cx + headR.value * 0.5
  return [
    { key: 'l1', x1: lx, y1: cy - 3, x2: lx - 15, y2: cy - 8 },
    { key: 'l2', x1: lx, y1: cy, x2: lx - 16, y2: cy },
    { key: 'l3', x1: lx, y1: cy + 3, x2: lx - 15, y2: cy + 8 },
    { key: 'r1', x1: rx, y1: cy - 3, x2: rx + 15, y2: cy - 8 },
    { key: 'r2', x1: rx, y1: cy, x2: rx + 16, y2: cy },
    { key: 'r3', x1: rx, y1: cy + 3, x2: rx + 15, y2: cy + 8 },
  ]
})

const leftEarPoints = computed(() => {
  const cx = headCx.value - headR.value * 0.6, cy = headCy.value - headR.value * 0.6, r = headR.value
  return `${cx - 5},${cy + r * 0.3} ${cx},${cy - r * 0.4} ${cx + 10},${cy + r * 0.2}`
})

const rightEarPoints = computed(() => {
  const cx = headCx.value + headR.value * 0.6, cy = headCy.value - headR.value * 0.6, r = headR.value
  return `${cx - 10},${cy + r * 0.2} ${cx},${cy - r * 0.4} ${cx + 5},${cy + r * 0.3}`
})

const leftInnerEarPoints = computed(() => {
  const cx = headCx.value - headR.value * 0.6, cy = headCy.value - headR.value * 0.6, r = headR.value
  return `${cx - 2},${cy + r * 0.2} ${cx},${cy - r * 0.25} ${cx + 6},${cy + r * 0.15}`
})

const rightInnerEarPoints = computed(() => {
  const cx = headCx.value + headR.value * 0.6, cy = headCy.value - headR.value * 0.6, r = headR.value
  return `${cx - 6},${cy + r * 0.15} ${cx},${cy - r * 0.25} ${cx + 2},${cy + r * 0.2}`
})

const pawY = computed(() => bodyCy.value + bodyRy.value * 0.85)
const pawRx = computed(() => bodyRx.value * 0.22)
const pawRy = computed(() => bodyRy.value * 0.15)

const tailPath = computed(() => {
  const bx = bodyCx + bodyRx.value * 0.9
  const by = bodyCy.value + bodyRy.value * 0.3
  return `M${bx},${by} Q${bx + 12},${by - 15} ${bx + 8},${by - 30} Q${bx + 4},${by - 42} ${bx},${by - 38}`
})

const tailTransformStyle = computed(() => ({
  transformOrigin: `${bodyCx + bodyRx.value * 0.9}px ${bodyCy.value + bodyRy.value * 0.3}px`,
}))

const headTransformStyle = computed(() => {
  const action = currentAction.value
  if (action === 'head-tilt') {
    return { transform: 'rotate(-8deg)', transformOrigin: `${headCx.value}px ${headCy.value + headR.value * 0.8}px`, transition: 'transform 0.4s ease' }
  }
  if (action === 'scratch-ear') {
    return { transform: 'rotate(-12deg)', transformOrigin: `${headCx.value}px ${headCy.value + headR.value * 0.8}px`, transition: 'transform 0.3s ease' }
  }
  return { transform: 'rotate(0deg)', transformOrigin: `${headCx.value}px ${headCy.value + headR.value * 0.8}px`, transition: 'transform 0.4s ease' }
})

const leftPawStyle = computed(() => {
  if (currentAction.value === 'scratch-ear') return { transform: 'translate(-8px, -15px)', transition: 'transform 0.3s ease' }
  if (currentAction.value === 'lick-paw') return { transform: 'translate(5px, -20px)', transition: 'transform 0.3s ease' }
  return { transform: 'translate(0, 0)', transition: 'transform 0.3s ease' }
})

const rightPawStyle = computed(() => {
  if (currentAction.value === 'stretch') return { transform: 'translate(8px, -10px)', transition: 'transform 0.3s ease' }
  return { transform: 'translate(0, 0)', transition: 'transform 0.3s ease' }
})

const foreheadMarking = computed(() => {
  const cx = headCx.value, cy = headCy.value - headR.value * 0.3
  return `M${cx},${cy - 8} L${cx - 5},${cy + 5} L${cx + 5},${cy + 5} Z`
})

const clothing = computed(() => props.clothing || '')
const decoration = computed(() => props.decoration || '')

const dressPath = computed(() => {
  const cx = bodyCx, cy = bodyCy.value, rx = bodyRx.value, ry = bodyRy.value
  return `M${cx - rx * 0.7},${cy - ry * 0.3} Q${cx - rx * 1.1},${cy + ry * 0.8} ${cx - rx * 0.3},${cy + ry} L${cx + rx * 0.3},${cy + ry} Q${cx + rx * 1.1},${cy + ry * 0.8} ${cx + rx * 0.7},${cy - ry * 0.3} Z`
})

const capePath = computed(() => {
  const cx = bodyCx, cy = bodyCy.value, rx = bodyRx.value, ry = bodyRy.value
  return `M${cx - rx * 0.5},${cy - ry * 0.8} Q${cx - rx * 1.3},${cy} ${cx - rx * 0.8},${cy + ry * 1.2} L${cx + rx * 0.8},${cy + ry * 1.2} Q${cx + rx * 1.3},${cy} ${cx + rx * 0.5},${cy - ry * 0.8} Z`
})

const capeInnerPath = computed(() => {
  const cx = bodyCx, cy = bodyCy.value, rx = bodyRx.value, ry = bodyRy.value
  return `M${cx - rx * 0.3},${cy - ry * 0.6} Q${cx - rx * 1.0},${cy + ry * 0.2} ${cx - rx * 0.5},${cy + ry * 0.9} L${cx + rx * 0.5},${cy + ry * 0.9} Q${cx + rx * 1.0},${cy + ry * 0.2} ${cx + rx * 0.3},${cy - ry * 0.6} Z`
})

const crownPath = computed(() => {
  const cx = headCx.value, cy = headCy.value - headR.value * 0.9
  const w = headR.value * 0.7
  return `M${cx - w},${cy + 8} L${cx - w * 0.7},${cy} L${cx - w * 0.35},${cy + 4} L${cx},${cy - 6} L${cx + w * 0.35},${cy + 4} L${cx + w * 0.7},${cy} L${cx + w},${cy + 8} Z`
})

const bowtieLeftPoints = computed(() => {
  const cx = headCx.value, cy = headCy.value + headR.value * 0.55
  return `${cx},${cy} ${cx - 10},${cy - 6} ${cx - 10},${cy + 6}`
})

const bowtieRightPoints = computed(() => {
  const cx = headCx.value, cy = headCy.value + headR.value * 0.55
  return `${cx},${cy} ${cx + 10},${cy - 6} ${cx + 10},${cy + 6}`
})

const stars = computed(() => {
  if (props.stage < 6) return []
  const cx = bodyCx, cy = bodyCy.value
  return [
    { key: 's1', x: cx - 30, y: cy - 40, r: 2, color: '#ffd700' },
    { key: 's2', x: cx + 25, y: cy - 35, r: 1.5, color: '#ff4081' },
    { key: 's3', x: cx - 20, y: cy + 30, r: 1.8, color: '#00e5ff' },
    { key: 's4', x: cx + 35, y: cy + 20, r: 2.2, color: '#ffd700' },
    { key: 's5', x: cx + 5, y: cy - 55, r: 1.5, color: '#76ff03' },
  ]
})

const emotionEmoji = computed(() => {
  const map: Record<string, string> = { happy: '😺', calm: '😸', angry: '😾', hungry: '😿', sad: '😿', excited: '🤩' }
  return map[props.emotion] || '😸'
})

function scheduleNextAction() {
  const delay = 2000 + Math.random() * 4000
  actionTimer = setTimeout(() => {
    const actions: CatAction[] = ['idle', 'idle', 'blink', 'head-tilt', 'scratch-ear', 'lick-paw', 'stretch', 'wiggle']
    const action = actions[Math.floor(Math.random() * actions.length)]
    currentAction.value = action
    if (action === 'blink') {
      isBlinking.value = true
      setTimeout(() => { isBlinking.value = false }, 200)
    }
    const duration = action === 'blink' ? 300 : action === 'idle' ? 500 : 1500 + Math.random() * 1000
    setTimeout(() => {
      currentAction.value = 'idle'
      scheduleNextAction()
    }, duration)
  }, delay)
}

function startBlinking() {
  blinkTimer = setInterval(() => {
    isBlinking.value = true
    setTimeout(() => { isBlinking.value = false }, 180)
  }, 3000 + Math.random() * 2000)
}

onMounted(() => {
  scheduleNextAction()
  startBlinking()
})

onUnmounted(() => {
  if (actionTimer) clearTimeout(actionTimer)
  if (blinkTimer) clearInterval(blinkTimer)
})
</script>

<style scoped lang="scss">
.cat-sprite {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.cat-glow {
  position: absolute;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 109, 0, 0.3) 0%, transparent 70%);
  animation: pulse-glow 2s ease-in-out infinite;
}

.cat-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease;

  &.wiggle { animation: wiggle-body 0.4s ease-in-out 2; }
  &.stretch { animation: stretch-body 1.5s ease-in-out; }
}

.cat-svg {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.cat-sprite:active .cat-svg { transform: scale(0.95); }

.cat-tail-group { animation: wag-tail 2s ease-in-out infinite; }

.cat-head { transition: transform 0.4s ease; }

.emotion-bubble {
  position: absolute;
  top: 5%;
  right: 10%;
  font-size: 28px;
  animation: float 2s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));

  &.emotion-happy, &.emotion-excited { animation: float 2s ease-in-out infinite, bounce 0.5s ease; }
  &.emotion-angry { animation: shake 0.3s ease-in-out infinite; }
  &.emotion-hungry, &.emotion-sad { animation: droop 3s ease-in-out infinite; }
}

@keyframes pulse-glow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
@keyframes wag-tail { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(8deg); } 70% { transform: rotate(-8deg); } }
@keyframes wiggle-body { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
@keyframes stretch-body { 0%, 100% { transform: scaleY(1) scaleX(1); } 40% { transform: scaleY(1.06) scaleX(0.96); } 60% { transform: scaleY(1.06) scaleX(0.96); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes bounce { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
@keyframes droop { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(3px) rotate(5deg); } }
@keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.twinkle {
  animation: twinkle 1.5s ease-in-out infinite;
  &:nth-child(2) { animation-delay: 0.3s; }
  &:nth-child(3) { animation-delay: 0.6s; }
  &:nth-child(4) { animation-delay: 0.9s; }
  &:nth-child(5) { animation-delay: 1.2s; }
}
</style>
