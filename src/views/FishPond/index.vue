<template>
  <div class="fish-pond-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/')">← 返回</button>
      <h2 class="page-title">🎣 鱼塘</h2>
      <div class="coins">
        <span>🪙</span>
        <span>{{ catStore.cat.coins }}</span>
      </div>
    </div>

    <div class="pond-area">
      <div class="pond-water" :class="{ 'fishing': isFishing }">
        <div class="pond-bank"></div>
        <div class="water-surface">
          <svg class="wave-svg" viewBox="0 0 400 20" preserveAspectRatio="none">
            <path d="M0,10 Q25,0 50,10 Q75,20 100,10 Q125,0 150,10 Q175,20 200,10 Q225,0 250,10 Q275,20 300,10 Q325,0 350,10 Q375,20 400,10 L400,20 L0,20 Z" fill="rgba(100,200,255,0.15)">
              <animate attributeName="d" dur="3s" repeatCount="indefinite" values="M0,10 Q25,0 50,10 Q75,20 100,10 Q125,0 150,10 Q175,20 200,10 Q225,0 250,10 Q275,20 300,10 Q325,0 350,10 Q375,20 400,10 L400,20 L0,20 Z;M0,10 Q25,20 50,10 Q75,0 100,10 Q125,20 150,10 Q175,0 200,10 Q225,20 250,10 Q275,0 300,10 Q325,20 350,10 Q375,0 400,10 L400,20 L0,20 Z;M0,10 Q25,0 50,10 Q75,20 100,10 Q125,0 150,10 Q175,20 200,10 Q225,0 250,10 Q275,20 300,10 Q325,0 350,10 Q375,20 400,10 L400,20 L0,20 Z" />
            </path>
          </svg>
        </div>
        <div class="water-body"></div>
        <div class="lily-pad" style="left: 15%; top: 25%;">🪷</div>
        <div class="lily-pad" style="left: 70%; top: 35%;">🌿</div>
        <div class="fish-shadow" v-for="i in 4" :key="i" :style="fishShadowStyle(i)"></div>
        <div class="bubble" v-for="i in 3" :key="'b'+i" :style="bubbleStyle(i)"></div>
        <div class="fishing-line" v-if="isFishing">
          <div class="bobber"></div>
        </div>
        <div class="catch-splash" v-if="showCatch">
          <div class="splash-drop" v-for="i in 6" :key="i" :style="splashStyle(i)"></div>
        </div>
      </div>

      <Transition name="catch-pop">
        <div class="catch-result" v-if="lastCatch">
          <div class="catch-card" :class="`quality-${lastCatch.quality}`">
            <div class="catch-glow" :style="{ background: qualityRadialGlow }"></div>
            <div class="catch-icon">{{ lastCatch.icon }}</div>
            <div class="catch-name">{{ lastCatch.name }}</div>
            <div class="catch-quality" :style="{ color: qualityColor }">{{ qualityLabel }}</div>
            <div class="catch-hunger">饱腹 +{{ lastCatch.hungerRestore }}</div>
          </div>
        </div>
      </Transition>
    </div>

    <div class="fish-inventory">
      <h3>🐟 我的鱼获</h3>
      <div class="fish-grid">
        <div class="fish-item" v-for="inv in fishInventory" :key="inv.itemId" :style="fishItemGlow(inv.itemId)">
          <span class="fish-icon">{{ getFishIcon(inv.itemId) }}</span>
          <span class="fish-name">{{ getFishName(inv.itemId) }}</span>
          <span class="fish-qty">x{{ inv.quantity }}</span>
        </div>
        <div class="fish-empty" v-if="fishInventory.length === 0">
          还没有钓到鱼哦，快来钓鱼吧！
        </div>
      </div>
    </div>

    <button class="fish-btn" :disabled="isFishing" @click="startFishing">
      {{ isFishing ? '🎣 钓鱼中...' : '🎣 开始钓鱼' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCatStore } from '@/stores/catStore'
import { FISH_LIST, FISH_QUALITY_CONFIG, FISHING_ANIMATION_DURATION } from '@/game/constants'
import { playSplash, playCatchFish } from '@/game/sounds'
import type { FishItem } from '@/types'

const catStore = useCatStore()
const isFishing = ref(false)
const showCatch = ref(false)
const lastCatch = ref<FishItem | null>(null)

const fishInventory = computed(() =>
  catStore.cat.inventory.filter(inv => FISH_LIST.some(f => f.id === inv.itemId) && inv.quantity > 0)
)

const qualityColor = computed(() => {
  if (!lastCatch.value) return '#fff'
  return FISH_QUALITY_CONFIG[lastCatch.value.quality].color
})

const qualityLabel = computed(() => {
  if (!lastCatch.value) return ''
  return FISH_QUALITY_CONFIG[lastCatch.value.quality].label
})

const qualityRadialGlow = computed(() => {
  if (!lastCatch.value) return 'transparent'
  const color = FISH_QUALITY_CONFIG[lastCatch.value.quality].color
  return `radial-gradient(circle, ${color}66 0%, transparent 70%)`
})

function getFishIcon(id: string) {
  return FISH_LIST.find(f => f.id === id)?.icon || '🐟'
}

function getFishName(id: string) {
  return FISH_LIST.find(f => f.id === id)?.name || '未知'
}

function fishItemGlow(id: string) {
  const fish = FISH_LIST.find(f => f.id === id)
  if (!fish) return {}
  const config = FISH_QUALITY_CONFIG[fish.quality]
  if (fish.quality === 'common') return {}
  return { boxShadow: `0 0 8px ${config.color}44, inset 0 0 4px ${config.color}22` }
}

function fishShadowStyle(i: number) {
  const left = 10 + i * 20
  const delay = i * 1.2
  const size = 20 + Math.random() * 15
  return {
    left: `${left}%`,
    bottom: `${15 + i * 8}%`,
    width: `${size}px`,
    height: `${size * 0.4}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${5 + i}s`,
  }
}

function bubbleStyle(i: number) {
  return {
    left: `${20 + i * 25}%`,
    animationDelay: `${i * 1.5}s`,
    animationDuration: `${3 + i * 0.5}s`,
  }
}

function splashStyle(i: number) {
  const angle = (i / 6) * 360
  return { '--angle': `${angle}deg` }
}

function startFishing() {
  if (isFishing.value) return
  isFishing.value = true
  lastCatch.value = null
  showCatch.value = false
  playSplash()

  setTimeout(() => {
    showCatch.value = true
    playSplash()
    setTimeout(() => { showCatch.value = false }, 600)
  }, FISHING_ANIMATION_DURATION - 400)

  setTimeout(() => {
    const result = catStore.goFishing()
    if (result) {
      lastCatch.value = result.fish
      playCatchFish()
    }
    isFishing.value = false
  }, FISHING_ANIMATION_DURATION)
}
</script>

<style scoped lang="scss">
.fish-pond-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
}

.page-title { font-size: 20px; color: var(--accent); }

.coins {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 215, 0, 0.15);
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: bold;
  color: var(--gold);
}

.pond-area { position: relative; margin-bottom: 16px; }

.pond-water {
  width: 100%;
  height: 220px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #0d3b66 0%, #0a2942 40%, #071e30 100%);
  border: 2px solid rgba(100, 200, 255, 0.1);

  &.fishing { animation: pond-ripple 0.5s ease-in-out; }
}

.pond-bank {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15px;
  background: linear-gradient(180deg, #3a2a1a, #2a1a0a);
  border-radius: 0 0 14px 14px;
}

.water-surface {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 25px;
  z-index: 2;
}

.wave-svg {
  width: 100%;
  height: 100%;
}

.water-body {
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  height: calc(100% - 20px);
  background: linear-gradient(180deg, rgba(10, 80, 140, 0.4) 0%, rgba(5, 40, 80, 0.6) 100%);
}

.lily-pad {
  position: absolute;
  font-size: 22px;
  z-index: 3;
  animation: lily-float 3s ease-in-out infinite;
}

.fish-shadow {
  position: absolute;
  background: rgba(100, 200, 255, 0.08);
  border-radius: 50%;
  animation: fish-swim 6s ease-in-out infinite;
}

.bubble {
  position: absolute;
  bottom: 10%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  animation: bubble-rise 4s ease-in infinite;
}

.fishing-line {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 55%;
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-50%);
  z-index: 4;
}

.bobber {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 10px;
  background: #f44336;
  border-radius: 50%;
  animation: bobber-bounce 1s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(244, 67, 54, 0.5);
}

.catch-splash {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.splash-drop {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(100, 200, 255, 0.6);
  border-radius: 50%;
  animation: splash-fly 0.6s ease-out forwards;
}

.catch-result {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  pointer-events: none;
}

.catch-card {
  position: relative;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 16px 28px;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.catch-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  animation: glow-rotate 3s linear infinite;
  pointer-events: none;
}

.catch-icon { font-size: 48px; margin-bottom: 8px; position: relative; z-index: 1; }
.catch-name { font-size: 18px; font-weight: bold; margin-bottom: 4px; position: relative; z-index: 1; }
.catch-quality { font-size: 14px; font-weight: bold; margin-bottom: 4px; position: relative; z-index: 1; }
.catch-hunger { font-size: 12px; color: var(--text-secondary); position: relative; z-index: 1; }

.quality-common { border-color: rgba(176, 176, 176, 0.3); }
.quality-good { border-color: rgba(76, 175, 80, 0.4); }
.quality-rare { border-color: rgba(33, 150, 243, 0.4); }
.quality-epic { border-color: rgba(156, 39, 176, 0.4); }
.quality-legendary { border-color: rgba(255, 152, 0, 0.5); }

.fish-inventory {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  h3 { font-size: 16px; color: var(--accent); margin-bottom: 8px; flex-shrink: 0; }
}

.fish-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-bottom: 4px;
}

.fish-item {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.fish-icon { font-size: 24px; }
.fish-name { font-size: 11px; color: var(--text-secondary); }
.fish-qty { font-size: 12px; font-weight: bold; color: var(--accent); }

.fish-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  padding: 20px;
}

.fish-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #4ecdc4, #2e86de);
  cursor: pointer;
  transition: all 0.2s;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &:active:not(:disabled) { transform: scale(0.97); }
}

.catch-pop-enter-active { animation: catch-pop-in 0.5s ease; }
.catch-pop-leave-active { animation: catch-pop-out 0.3s ease; }

@keyframes catch-pop-in {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes catch-pop-out {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.8); opacity: 0; }
}

@keyframes fish-swim {
  0%, 100% { transform: translateX(0) scaleX(1); }
  25% { transform: translateX(25px) scaleX(1); }
  50% { transform: translateX(0) scaleX(-1); }
  75% { transform: translateX(-25px) scaleX(-1); }
}

@keyframes bobber-bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(5px); }
}

@keyframes bubble-rise {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
}

@keyframes splash-fly {
  0% { transform: rotate(var(--angle)) translateY(0); opacity: 1; }
  100% { transform: rotate(var(--angle)) translateY(-30px); opacity: 0; }
}

@keyframes lily-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(3deg); }
}

@keyframes pond-ripple {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01); }
}

@keyframes glow-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
