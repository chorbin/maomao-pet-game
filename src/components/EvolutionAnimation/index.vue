<template>
  <Transition name="evolution">
    <div class="evolution-overlay" v-if="show" @click="dismiss">
      <div class="evolution-content">
        <div class="evolution-flash"></div>
        <div class="evolution-particles">
          <span v-for="i in 12" :key="i" class="particle" :style="particleStyle(i)"></span>
        </div>
        <div class="evolution-text">
          <div class="evolution-label">✨ 进化 ✨</div>
          <div class="evolution-stage">{{ stageInfo.emoji }} {{ stageInfo.name }}</div>
          <div class="evolution-desc">{{ stageDesc }}</div>
        </div>
        <div class="evolution-hint">点击任意处继续</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GrowthStage } from '@/types'
import { GROWTH_STAGES } from '@/game/constants'

const props = defineProps<{
  show: boolean
  stage: GrowthStage
}>()

const emit = defineEmits<{
  dismiss: []
}>()

const stageInfo = computed(() => GROWTH_STAGES[props.stage])

const stageDesc = computed(() => {
  const descs: Record<number, string> = {
    1: '一只小小的奶猫来到了你身边！',
    2: '眼睛睁开了，毛色变得更亮了！',
    3: '体型明显变大，尾巴变得蓬松了！',
    4: '毛色出现花纹渐变，气质变得帅气！',
    5: '长出了华丽的鬃毛，气场全开！',
    6: '全身散发微光，异色瞳觉醒，传奇降临！',
  }
  return descs[props.stage] || ''
})

function particleStyle(i: number) {
  const angle = (i / 12) * 360
  const delay = i * 0.1
  return {
    '--angle': `${angle}deg`,
    '--delay': `${delay}s`,
    animationDelay: `${delay}s`,
  }
}

function dismiss() {
  emit('dismiss')
}
</script>

<style scoped lang="scss">
.evolution-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.evolution-content {
  position: relative;
  width: 80%;
  max-width: 320px;
  padding: 40px 24px;
  text-align: center;
}

.evolution-flash {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: flash-pulse 1.5s ease-out infinite;
}

.evolution-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;

  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffd700;
    animation: particle-fly 2s ease-out infinite;
    box-shadow: 0 0 6px #ffd700;
  }
}

.evolution-text {
  position: relative;
  z-index: 2;
}

.evolution-label {
  font-size: 20px;
  color: var(--accent);
  margin-bottom: 12px;
  animation: glow-text 1s ease-in-out infinite alternate;
}

.evolution-stage {
  font-size: 36px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16px;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
}

.evolution-desc {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.evolution-hint {
  position: relative;
  z-index: 2;
  margin-top: 30px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  animation: blink 1.5s ease-in-out infinite;
}

.evolution-enter-active {
  animation: fade-in 0.5s ease;
}

.evolution-leave-active {
  animation: fade-out 0.3s ease;
}

@keyframes flash-pulse {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

@keyframes particle-fly {
  0% { transform: rotate(var(--angle)) translateY(0); opacity: 1; }
  100% { transform: rotate(var(--angle)) translateY(-80px); opacity: 0; }
}

@keyframes glow-text {
  from { text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
  to { text-shadow: 0 0 30px rgba(255, 215, 0, 1); }
}

@keyframes blink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
