<template>
  <div class="cat-sprite" :class="[`stage-${stage}`, `body-${bodyType}`, `emotion-${emotion}`, currentAction, performAction]">
    <div class="cat-glow" v-if="stage >= 6"></div>
    <div class="cat-container" :class="[currentAction, performAction]">
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
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="starGlow" v-if="stage >= 6">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <g :transform="`translate(${transformOrigin.x},${transformOrigin.y}) scale(${scale}) translate(-${transformOrigin.x},-${transformOrigin.y})`" :filter="stage >= 6 ? 'url(#glow)' : ''">
          <g class="cat-tail-group" :style="tailTransformStyle">
            <path :d="tailPath" :fill="furColor" />
          </g>

          <template v-if="clothing === 'cloth_cape'">
            <path :d="capePath" fill="#c62828" opacity="0.85" />
            <path :d="capeInnerPath" fill="#b71c1c" opacity="0.6" />
          </template>

          <ellipse :cx="bodyCx" :cy="bodyCy" :rx="bodyRx" :ry="bodyRy" fill="url(#bodyGrad)" />
          <ellipse :cx="bellyCx" :cy="bellyCy" :rx="bellyRx" :ry="bellyRy" fill="url(#bellyGrad)" />

          <template v-if="clothing === 'cloth_dress'">
            <path :d="dressPath" fill="#ff69b4" opacity="0.9" />
            <ellipse :cx="bodyCx" :cy="bodyCy - bodyRy * 0.3" :rx="bodyRx * 0.7" :ry="bodyRy * 0.15" fill="#ff1493" opacity="0.7" />
            <circle :cx="bodyCx" :cy="bodyCy - bodyRy * 0.3" :r="2" fill="#fff" opacity="0.8" />
          </template>

          <template v-if="clothing === 'cloth_scarf'">
            <ellipse :cx="bodyCx" :cy="headCy + headR * 0.55" :rx="bodyRx * 0.85" :ry="headR * 0.25" fill="#4caf50" opacity="0.9" />
            <ellipse :cx="bodyCx" :cy="headCy + headR * 0.55" :rx="bodyRx * 0.7" :ry="headR * 0.15" fill="#66bb6a" opacity="0.5" />
            <rect :x="bodyCx + bodyRx * 0.2" :y="headCy + headR * 0.5" :width="6" :height="bodyRy * 0.7" rx="3" fill="#388e3c" opacity="0.9" />
          </template>

          <g class="paw-left" :style="leftPawStyle">
            <ellipse :cx="bodyCx - bodyRx * 0.35" :cy="pawY" :rx="pawRx" :ry="pawRy" :fill="furColor" />
          </g>
          <g class="paw-right" :style="rightPawStyle">
            <ellipse :cx="bodyCx + bodyRx * 0.35" :cy="pawY" :rx="pawRx" :ry="pawRy" :fill="furColor" />
          </g>

          <g class="cat-head" :style="headTransformStyle">
            <circle :cx="headCx" :cy="headCy" :r="headR" fill="url(#bodyGrad)" />
            <polygon :points="leftEarPoints" :fill="furColor" />
            <polygon :points="rightEarPoints" :fill="furColor" />
            <polygon :points="leftInnerEarPoints" :fill="earInnerColor" />
            <polygon :points="rightInnerEarPoints" :fill="earInnerColor" />

            <template v-if="decoration === 'deco_crown'">
              <path :d="crownPath" fill="#ffd700" stroke="#ff8f00" stroke-width="1" />
              <circle :cx="headCx - 5" :cy="headCy - headR * 0.95" :r="1.5" fill="#e53935" />
              <circle :cx="headCx" :cy="headCy - headR * 1.05" :r="1.8" fill="#2196f3" />
              <circle :cx="headCx + 5" :cy="headCy - headR * 0.95" :r="1.5" fill="#4caf50" />
            </template>
            <template v-if="decoration === 'deco_bow'">
              <ellipse :cx="headCx - 7" :cy="headCy - headR * 0.85" :rx="7" :ry="5" fill="#ff69b4" opacity="0.9" />
              <ellipse :cx="headCx + 7" :cy="headCy - headR * 0.85" :rx="7" :ry="5" fill="#ff69b4" opacity="0.9" />
              <circle :cx="headCx" :cy="headCy - headR * 0.85" :r="3" fill="#ff1493" />
            </template>

            <template v-if="stage >= 4">
              <path :d="foreheadMarking" :fill="markingColor" opacity="0.6" />
            </template>
            <template v-if="stage >= 5">
              <ellipse :cx="headCx" :cy="headCy + headR * 0.2" :rx="headR * 1.3" :ry="headR * 1.1" :fill="furColor" opacity="0.5" />
            </template>

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

            <template v-if="stage >= 6 && !isBlinking">
              <circle :cx="leftEyeX" :cy="headCy - headR * 0.1" :r="eyeRx * 0.8" fill="none" :stroke="'#00e5ff'" stroke-width="0.5" filter="url(#starGlow)" />
              <circle :cx="rightEyeX" :cy="headCy - headR * 0.1" :r="eyeRx * 0.8" fill="none" :stroke="'#ff4081'" stroke-width="0.5" filter="url(#starGlow)" />
            </template>

            <polygon :points="nosePoints" :fill="noseColor" />
            <template v-if="emotion === 'hungry' || emotion === 'sad'">
              <path :d="sadMouth" stroke="#5a3e2b" stroke-width="1.5" fill="none" stroke-linecap="round" />
            </template>
            <template v-else>
              <path :d="happyMouth" stroke="#5a3e2b" stroke-width="1.5" fill="none" stroke-linecap="round" />
            </template>
            <line v-for="w in whiskers" :key="w.key" :x1="w.x1" :y1="w.y1" :x2="w.x2" :y2="w.y2" stroke="#ddd" stroke-width="0.8" opacity="0.6" />
            <template v-if="emotion === 'happy' || emotion === 'excited'">
              <ellipse :cx="leftEyeX - eyeRx" :cy="headCy + headR * 0.15" :rx="headR * 0.12" :ry="headR * 0.07" fill="#ff6b6b" opacity="0.4" />
              <ellipse :cx="rightEyeX + eyeRx" :cy="headCy + headR * 0.15" :rx="headR * 0.12" :ry="headR * 0.07" fill="#ff6b6b" opacity="0.4" />
            </template>
            <template v-if="decoration === 'deco_bowtie'">
              <polygon :points="bowtieLeftPoints" fill="#1a237e" opacity="0.9" />
              <polygon :points="bowtieRightPoints" fill="#1a237e" opacity="0.9" />
              <circle :cx="headCx" :cy="headCy + headR * 0.55" :r="2.5" fill="#ffd700" />
            </template>
          </g>

          <template v-if="stage >= 6">
            <circle v-for="s in stars" :key="s.key" :cx="s.x" :cy="s.y" :r="s.r" :fill="s.color" opacity="0.7" filter="url(#starGlow)" class="twinkle" />
          </template>
        </g>
      </svg>
    </div>

    <div class="emotion-bubble" :class="`emotion-${emotion}`">
      {{ emotionEmoji }}
    </div>

    <div class="perform-fx" v-if="performAction">
      <span v-for="i in fxCount" :key="i" class="fx-particle" :class="performAction" :style="{ '--i': i, '--total': fxCount }"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { GrowthStage, BodyType, EmotionType, SkillId } from '@/types'

type CatAction = 'idle' | 'blink' | 'head-tilt' | 'scratch-ear' | 'lick-paw' | 'stretch' | 'wiggle'
type PerformAnim = '' | 'p-wag_tail' | 'p-rub' | 'p-shake_hand' | 'p-roll' | 'p-jump' | 'p-catch' | 'p-backflip' | 'p-dance' | 'p-hoop'

const props = defineProps<{
  stage: GrowthStage
  bodyType: BodyType
  emotion: EmotionType
  clothing?: string
  decoration?: string
  performSkill?: SkillId | null
}>()

const currentAction = ref<CatAction>('idle')
const performAction = ref<PerformAnim>('')
const isBlinking = ref(false)
const fxCount = ref(6)
let actionTimer: ReturnType<typeof setTimeout> | null = null
let blinkTimer: ReturnType<typeof setInterval> | null = null

const transformOrigin = computed(() => {
  const s = props.stage
  const cy = s <= 1 ? 115 : s <= 2 ? 115 : s <= 3 ? 112 : s <= 4 ? 112 : s <= 5 ? 110 : 108
  return { x: 100, y: cy }
})

const scale = computed(() => {
  const s = props.stage
  if (s <= 1) return 0.7; if (s <= 2) return 0.85; if (s <= 3) return 1.0
  if (s <= 4) return 1.1; if (s <= 5) return 1.2; return 1.25
})

const furColor = computed(() => {
  const s = props.stage
  if (s <= 1) return '#ffe0b2'; if (s <= 2) return '#ffb74d'; if (s <= 3) return '#ff9800'
  if (s <= 4) return '#f57c00'; if (s <= 5) return '#e65100'; return '#ff6d00'
})

const furColorLight = computed(() => {
  const s = props.stage
  if (s <= 1) return '#fff8e1'; if (s <= 2) return '#ffe0b2'; if (s <= 3) return '#ffcc80'
  if (s <= 4) return '#ffb74d'; if (s <= 5) return '#ffa726'; return '#ff9100'
})

const bellyColor = '#fff3e0'; const bellyColorLight = '#ffffff'; const earInnerColor = '#ffab91'
const noseColor = '#e91e63'; const pupilColor = '#1a1a1a'; const markingColor = '#e65100'
const eyeColor = computed(() => props.stage >= 6 ? '#1a1a2e' : '#3e2723')

const bodyCx = 100
const bodyCy = computed(() => { const s = props.stage; return s <= 1 ? 135 : s <= 2 ? 130 : s <= 3 ? 128 : s <= 4 ? 126 : s <= 5 ? 124 : 122 })
const bodyRx = computed(() => { const b = props.stage <= 1 ? 28 : props.stage <= 2 ? 34 : props.stage <= 3 ? 40 : props.stage <= 4 ? 46 : props.stage <= 5 ? 52 : 56; if (props.bodyType === 'thin') return b * 0.8; if (props.bodyType === 'fat') return b * 1.25; return b })
const bodyRy = computed(() => { const b = props.stage <= 1 ? 24 : props.stage <= 2 ? 30 : props.stage <= 3 ? 36 : props.stage <= 4 ? 42 : props.stage <= 5 ? 48 : 52; if (props.bodyType === 'thin') return b * 0.85; if (props.bodyType === 'fat') return b * 1.2; return b })
const bellyCx = computed(() => bodyCx); const bellyCy = computed(() => bodyCy.value + bodyRy.value * 0.15)
const bellyRx = computed(() => bodyRx.value * 0.6); const bellyRy = computed(() => bodyRy.value * 0.65)
const headR = computed(() => props.stage <= 1 ? 30 : props.stage <= 2 ? 34 : props.stage <= 3 ? 36 : props.stage <= 4 ? 38 : props.stage <= 5 ? 42 : 46)
const headCx = computed(() => bodyCx); const headCy = computed(() => bodyCy.value - bodyRy.value - headR.value * 0.65)
const leftEyeX = computed(() => headCx.value - headR.value * 0.3); const rightEyeX = computed(() => headCx.value + headR.value * 0.3)
const eyeRx = computed(() => headR.value * 0.15); const eyeRy = computed(() => headR.value * 0.18)

const leftEyeHappy = computed(() => { const x = leftEyeX.value, y = headCy.value - headR.value * 0.1, r = eyeRx.value; return `M${x - r * 1.5},${y} Q${x},${y - r * 2} ${x + r * 1.5},${y}` })
const rightEyeHappy = computed(() => { const x = rightEyeX.value, y = headCy.value - headR.value * 0.1, r = eyeRx.value; return `M${x - r * 1.5},${y} Q${x},${y - r * 2} ${x + r * 1.5},${y}` })
const leftEyeBlink = computed(() => { const x = leftEyeX.value, y = headCy.value - headR.value * 0.1, r = eyeRx.value; return `M${x - r * 1.5},${y} L${x + r * 1.5},${y}` })
const rightEyeBlink = computed(() => { const x = rightEyeX.value, y = headCy.value - headR.value * 0.1, r = eyeRx.value; return `M${x - r * 1.5},${y} L${x + r * 1.5},${y}` })
const nosePoints = computed(() => { const cx = headCx.value, cy = headCy.value + headR.value * 0.15; return `${cx},${cy - 2} ${cx - 3},${cy + 2} ${cx + 3},${cy + 2}` })
const happyMouth = computed(() => { const cx = headCx.value, cy = headCy.value + headR.value * 0.15 + 3; return `M${cx - 6},${cy} Q${cx - 3},${cy + 5} ${cx},${cy + 2} Q${cx + 3},${cy + 5} ${cx + 6},${cy}` })
const sadMouth = computed(() => { const cx = headCx.value, cy = headCy.value + headR.value * 0.15 + 6; return `M${cx - 5},${cy} Q${cx},${cy - 4} ${cx + 5},${cy}` })
const whiskers = computed(() => { const cx = headCx.value, cy = headCy.value + headR.value * 0.2, lx = cx - headR.value * 0.5, rx = cx + headR.value * 0.5; return [{ key: 'l1', x1: lx, y1: cy - 3, x2: lx - 15, y2: cy - 8 }, { key: 'l2', x1: lx, y1: cy, x2: lx - 16, y2: cy }, { key: 'l3', x1: lx, y1: cy + 3, x2: lx - 15, y2: cy + 8 }, { key: 'r1', x1: rx, y1: cy - 3, x2: rx + 15, y2: cy - 8 }, { key: 'r2', x1: rx, y1: cy, x2: rx + 16, y2: cy }, { key: 'r3', x1: rx, y1: cy + 3, x2: rx + 15, y2: cy + 8 }] })
const leftEarPoints = computed(() => { const cx = headCx.value - headR.value * 0.6, cy = headCy.value - headR.value * 0.6, r = headR.value; return `${cx - 5},${cy + r * 0.3} ${cx},${cy - r * 0.4} ${cx + 10},${cy + r * 0.2}` })
const rightEarPoints = computed(() => { const cx = headCx.value + headR.value * 0.6, cy = headCy.value - headR.value * 0.6, r = headR.value; return `${cx - 10},${cy + r * 0.2} ${cx},${cy - r * 0.4} ${cx + 5},${cy + r * 0.3}` })
const leftInnerEarPoints = computed(() => { const cx = headCx.value - headR.value * 0.6, cy = headCy.value - headR.value * 0.6, r = headR.value; return `${cx - 2},${cy + r * 0.2} ${cx},${cy - r * 0.25} ${cx + 6},${cy + r * 0.15}` })
const rightInnerEarPoints = computed(() => { const cx = headCx.value + headR.value * 0.6, cy = headCy.value - headR.value * 0.6, r = headR.value; return `${cx - 6},${cy + r * 0.15} ${cx},${cy - r * 0.25} ${cx + 2},${cy + r * 0.2}` })
const pawY = computed(() => bodyCy.value + bodyRy.value * 0.85); const pawRx = computed(() => bodyRx.value * 0.22); const pawRy = computed(() => bodyRy.value * 0.15)
const tailPath = computed(() => { const bx = bodyCx + bodyRx.value * 0.9, by = bodyCy.value + bodyRy.value * 0.3; return `M${bx},${by} Q${bx + 12},${by - 15} ${bx + 8},${by - 30} Q${bx + 4},${by - 42} ${bx},${by - 38}` })
const tailTransformStyle = computed(() => ({ transformOrigin: `${bodyCx + bodyRx.value * 0.9}px ${bodyCy.value + bodyRy.value * 0.3}px` }))

const headTransformStyle = computed(() => {
  const a = currentAction.value
  const p = performAction.value
  const origin = `${headCx.value}px ${headCy.value + headR.value * 0.8}px`
  if (p === 'p-rub') return { transform: 'rotate(-10deg)', transformOrigin: origin, transition: 'transform 0.3s ease' }
  if (p === 'p-shake_hand') return { transform: 'rotate(5deg)', transformOrigin: origin, transition: 'transform 0.3s ease' }
  if (p === 'p-catch') return { transform: 'rotate(-8deg)', transformOrigin: origin, transition: 'transform 0.2s ease' }
  if (p === 'p-dance') return { transform: `rotate(${Math.sin(Date.now() / 200) * 8}deg)`, transformOrigin: origin, transition: 'transform 0.15s ease' }
  if (a === 'head-tilt') return { transform: 'rotate(-8deg)', transformOrigin: origin, transition: 'transform 0.4s ease' }
  if (a === 'scratch-ear') return { transform: 'rotate(-12deg)', transformOrigin: origin, transition: 'transform 0.3s ease' }
  return { transform: 'rotate(0deg)', transformOrigin: origin, transition: 'transform 0.4s ease' }
})

const leftPawStyle = computed(() => {
  const a = currentAction.value; const p = performAction.value
  if (p === 'p-rub') return { transform: 'translate(5px, -18px)', transition: 'transform 0.3s ease' }
  if (p === 'p-shake_hand') return { transform: 'translate(-3px, -22px)', transition: 'transform 0.3s ease' }
  if (p === 'p-catch') return { transform: 'translate(8px, -25px)', transition: 'transform 0.2s ease' }
  if (p === 'p-hoop') return { transform: 'translate(0px, -30px)', transition: 'transform 0.3s ease' }
  if (a === 'scratch-ear') return { transform: 'translate(-8px, -15px)', transition: 'transform 0.3s ease' }
  if (a === 'lick-paw') return { transform: 'translate(5px, -20px)', transition: 'transform 0.3s ease' }
  return { transform: 'translate(0, 0)', transition: 'transform 0.3s ease' }
})

const rightPawStyle = computed(() => {
  const a = currentAction.value; const p = performAction.value
  if (p === 'p-shake_hand') return { transform: 'translate(3px, -22px)', transition: 'transform 0.3s ease' }
  if (p === 'p-catch') return { transform: 'translate(-8px, -25px)', transition: 'transform 0.2s ease' }
  if (p === 'p-hoop') return { transform: 'translate(0px, -30px)', transition: 'transform 0.3s ease' }
  if (a === 'stretch') return { transform: 'translate(8px, -10px)', transition: 'transform 0.3s ease' }
  return { transform: 'translate(0, 0)', transition: 'transform 0.3s ease' }
})

const foreheadMarking = computed(() => { const cx = headCx.value, cy = headCy.value - headR.value * 0.3; return `M${cx},${cy - 8} L${cx - 5},${cy + 5} L${cx + 5},${cy + 5} Z` })
const clothing = computed(() => props.clothing || ''); const decoration = computed(() => props.decoration || '')
const dressPath = computed(() => { const cx = bodyCx, cy = bodyCy.value, rx = bodyRx.value, ry = bodyRy.value; return `M${cx - rx * 0.7},${cy - ry * 0.3} Q${cx - rx * 1.1},${cy + ry * 0.8} ${cx - rx * 0.3},${cy + ry} L${cx + rx * 0.3},${cy + ry} Q${cx + rx * 1.1},${cy + ry * 0.8} ${cx + rx * 0.7},${cy - ry * 0.3} Z` })
const capePath = computed(() => { const cx = bodyCx, cy = bodyCy.value, rx = bodyRx.value, ry = bodyRy.value; return `M${cx - rx * 0.5},${cy - ry * 0.8} Q${cx - rx * 1.3},${cy} ${cx - rx * 0.8},${cy + ry * 1.2} L${cx + rx * 0.8},${cy + ry * 1.2} Q${cx + rx * 1.3},${cy} ${cx + rx * 0.5},${cy - ry * 0.8} Z` })
const capeInnerPath = computed(() => { const cx = bodyCx, cy = bodyCy.value, rx = bodyRx.value, ry = bodyRy.value; return `M${cx - rx * 0.3},${cy - ry * 0.6} Q${cx - rx * 1.0},${cy + ry * 0.2} ${cx - rx * 0.5},${cy + ry * 0.9} L${cx + rx * 0.5},${cy + ry * 0.9} Q${cx + rx * 1.0},${cy + ry * 0.2} ${cx + rx * 0.3},${cy - ry * 0.6} Z` })
const crownPath = computed(() => { const cx = headCx.value, cy = headCy.value - headR.value * 0.9, w = headR.value * 0.7; return `M${cx - w},${cy + 8} L${cx - w * 0.7},${cy} L${cx - w * 0.35},${cy + 4} L${cx},${cy - 6} L${cx + w * 0.35},${cy + 4} L${cx + w * 0.7},${cy} L${cx + w},${cy + 8} Z` })
const bowtieLeftPoints = computed(() => { const cx = headCx.value, cy = headCy.value + headR.value * 0.55; return `${cx},${cy} ${cx - 10},${cy - 6} ${cx - 10},${cy + 6}` })
const bowtieRightPoints = computed(() => { const cx = headCx.value, cy = headCy.value + headR.value * 0.55; return `${cx},${cy} ${cx + 10},${cy - 6} ${cx + 10},${cy + 6}` })
const stars = computed(() => { if (props.stage < 6) return []; const cx = bodyCx, cy = bodyCy.value; return [{ key: 's1', x: cx - 30, y: cy - 40, r: 2, color: '#ffd700' }, { key: 's2', x: cx + 25, y: cy - 35, r: 1.5, color: '#ff4081' }, { key: 's3', x: cx - 20, y: cy + 30, r: 1.8, color: '#00e5ff' }, { key: 's4', x: cx + 35, y: cy + 20, r: 2.2, color: '#ffd700' }, { key: 's5', x: cx + 5, y: cy - 55, r: 1.5, color: '#76ff03' }] })
const emotionEmoji = computed(() => { const m: Record<string, string> = { happy: '😺', calm: '😸', angry: '😾', hungry: '😿', sad: '😿', excited: '🤩' }; return m[props.emotion] || '😸' })

const SKILL_ANIM_MAP: Record<string, PerformAnim> = {
  wag_tail: 'p-wag_tail', rub: 'p-rub', shake_hand: 'p-shake_hand',
  roll: 'p-roll', jump: 'p-jump', catch: 'p-catch',
  backflip: 'p-backflip', dance: 'p-dance', hoop: 'p-hoop',
}

const SKILL_FX_COUNT: Record<string, number> = {
  wag_tail: 4, rub: 5, shake_hand: 6, roll: 8,
  jump: 6, catch: 6, backflip: 10, dance: 12, hoop: 8,
}

watch(() => props.performSkill, (skill) => {
  if (skill && SKILL_ANIM_MAP[skill]) {
    performAction.value = SKILL_ANIM_MAP[skill]
    fxCount.value = SKILL_FX_COUNT[skill] || 6
  } else {
    performAction.value = ''
  }
})

function scheduleNextAction() {
  const delay = 2000 + Math.random() * 4000
  actionTimer = setTimeout(() => {
    if (performAction.value) { scheduleNextAction(); return }
    const actions: CatAction[] = ['idle', 'idle', 'blink', 'head-tilt', 'scratch-ear', 'lick-paw', 'stretch', 'wiggle']
    const action = actions[Math.floor(Math.random() * actions.length)]
    currentAction.value = action
    if (action === 'blink') { isBlinking.value = true; setTimeout(() => { isBlinking.value = false }, 200) }
    const duration = action === 'blink' ? 300 : action === 'idle' ? 500 : 1500 + Math.random() * 1000
    setTimeout(() => { currentAction.value = 'idle'; scheduleNextAction() }, duration)
  }, delay)
}

function startBlinking() {
  blinkTimer = setInterval(() => { isBlinking.value = true; setTimeout(() => { isBlinking.value = false }, 180) }, 3000 + Math.random() * 2000)
}

onMounted(() => { scheduleNextAction(); startBlinking() })
onUnmounted(() => { if (actionTimer) clearTimeout(actionTimer); if (blinkTimer) clearInterval(blinkTimer) })
</script>

<style scoped lang="scss">
.cat-sprite { position: relative; display: flex; justify-content: center; align-items: center; cursor: pointer; }
.cat-glow { position: absolute; width: 80%; height: 80%; border-radius: 50%; background: radial-gradient(circle, rgba(255,109,0,0.3) 0%, transparent 70%); animation: pulse-glow 2s ease-in-out infinite; }
.cat-container { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; transition: transform 0.3s ease;
  &.wiggle { animation: wiggle-body 0.4s ease-in-out 2; }
  &.stretch { animation: stretch-body 1.5s ease-in-out; }
  &.p-wag_tail { animation: p-wag 0.5s ease-in-out 3; }
  &.p-rub { animation: p-rub-body 0.8s ease-in-out 2; }
  &.p-roll { animation: p-roll-body 0.6s ease-in-out 2; }
  &.p-jump { animation: p-jump-body 0.7s ease-in-out 2; }
  &.p-catch { animation: p-catch-body 0.5s ease-in-out 2; }
  &.p-backflip { animation: p-backflip-body 1s ease-in-out; }
  &.p-dance { animation: p-dance-body 0.4s ease-in-out 5; }
  &.p-hoop { animation: p-hoop-body 0.8s ease-in-out 2; }
}
.cat-svg { width: 100%; height: 100%; transition: transform 0.3s ease; }
.cat-sprite:active .cat-svg { transform: scale(0.95); }
.cat-tail-group { animation: wag-tail 2s ease-in-out infinite;
  .p-wag_tail & { animation: p-wag-tail-fast 0.25s ease-in-out 6; }
}
.cat-head { transition: transform 0.4s ease; }
.emotion-bubble { position: absolute; top: 5%; right: 10%; font-size: 28px; animation: float 2s ease-in-out infinite; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  &.emotion-happy, &.emotion-excited { animation: float 2s ease-in-out infinite, bounce 0.5s ease; }
  &.emotion-angry { animation: shake 0.3s ease-in-out infinite; }
  &.emotion-hungry, &.emotion-sad { animation: droop 3s ease-in-out infinite; }
}

.perform-fx { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; }
.fx-particle { position: absolute; border-radius: 50%; animation: fx-burst 0.8s ease-out forwards;
  &.p-wag_tail { width: 8px; height: 8px; background: #ff69b4; top: 50%; left: calc(50% + (var(--i) - 3) * 15px); animation-delay: calc(var(--i) * 0.08s); }
  &.p-rub { width: 12px; height: 12px; background: #ff4081; top: 35%; left: calc(40% + var(--i) * 5%); animation-delay: calc(var(--i) * 0.1s); }
  &.p-shake_hand { width: 10px; height: 10px; background: #ffd700; top: 40%; left: calc(30% + var(--i) * 7%); animation-delay: calc(var(--i) * 0.06s); }
  &.p-roll { width: 14px; height: 14px; background: #4ecdc4; top: calc(30% + var(--i) * 5%); left: calc(30% + var(--i) * 6%); animation-delay: calc(var(--i) * 0.07s); }
  &.p-jump { width: 10px; height: 10px; background: #a29bfe; top: calc(60% - var(--i) * 5%); left: calc(35% + var(--i) * 4%); animation-delay: calc(var(--i) * 0.08s); }
  &.p-catch { width: 12px; height: 12px; background: #ff9800; top: 30%; left: calc(40% + (var(--i) - 3) * 12px); animation-delay: calc(var(--i) * 0.05s); }
  &.p-backflip { width: 16px; height: 16px; background: #ffd700; top: calc(20% + var(--i) * 6%); left: calc(25% + var(--i) * 6%); animation-delay: calc(var(--i) * 0.06s); box-shadow: 0 0 8px #ffd700; }
  &.p-dance { width: 8px; height: 8px; background: #e91e63; top: calc(20% + var(--i) * 5%); left: calc(15% + var(--i) * 6%); animation-delay: calc(var(--i) * 0.05s); }
  &.p-hoop { width: 14px; height: 14px; border: 2px solid #00e5ff; background: transparent; top: 25%; left: calc(40% + (var(--i) - 4) * 10px); animation-delay: calc(var(--i) * 0.06s); }
}

@keyframes pulse-glow { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
@keyframes wag-tail { 0%,100% { transform: rotate(0deg); } 30% { transform: rotate(8deg); } 70% { transform: rotate(-8deg); } }
@keyframes wiggle-body { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
@keyframes stretch-body { 0%,100% { transform: scaleY(1) scaleX(1); } 40% { transform: scaleY(1.06) scaleX(0.96); } 60% { transform: scaleY(1.06) scaleX(0.96); } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes bounce { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
@keyframes droop { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(3px) rotate(5deg); } }
@keyframes twinkle { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
.twinkle { animation: twinkle 1.5s ease-in-out infinite; &:nth-child(2) { animation-delay: 0.3s; } &:nth-child(3) { animation-delay: 0.6s; } &:nth-child(4) { animation-delay: 0.9s; } &:nth-child(5) { animation-delay: 1.2s; } }

@keyframes p-wag { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
@keyframes p-wag-tail-fast { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(20deg); } 75% { transform: rotate(-20deg); } }
@keyframes p-rub-body { 0%,100% { transform: translateX(0) rotate(0deg); } 30% { transform: translateX(-5px) rotate(-3deg); } 70% { transform: translateX(5px) rotate(3deg); } }
@keyframes p-roll-body { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes p-jump-body { 0%,100% { transform: translateY(0); } 30% { transform: translateY(-25px) scaleX(0.95) scaleY(1.1); } 50% { transform: translateY(-30px) scaleX(0.9) scaleY(1.15); } 80% { transform: translateY(5px) scaleX(1.05) scaleY(0.95); } }
@keyframes p-catch-body { 0%,100% { transform: translateY(0); } 20% { transform: translateY(-10px); } 40% { transform: translateY(-10px) translateX(15px); } 60% { transform: translateY(-5px) translateX(15px); } }
@keyframes p-backflip-body { 0% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-35px) rotate(90deg); } 50% { transform: translateY(-40px) rotate(180deg); } 75% { transform: translateY(-20px) rotate(270deg); } 100% { transform: translateY(0) rotate(360deg); } }
@keyframes p-dance-body { 0%,100% { transform: translateY(0) translateX(0); } 25% { transform: translateY(-10px) translateX(-8px); } 50% { transform: translateY(0) translateX(0); } 75% { transform: translateY(-10px) translateX(8px); } }
@keyframes p-hoop-body { 0%,100% { transform: translateY(0); } 30% { transform: translateY(-30px) scaleY(0.9); } 50% { transform: translateY(-35px) scaleY(0.85); } 70% { transform: translateY(-20px) scaleY(0.95); } }
@keyframes fx-burst { 0% { opacity: 1; transform: scale(0.5) translateY(0); } 100% { opacity: 0; transform: scale(1.5) translateY(-30px); } }
</style>
