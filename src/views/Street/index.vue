<template>
  <div class="street-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/')">← 返回</button>
      <h2 class="page-title">🎭 街头表演</h2>
      <div class="coins">
        <span>🪙</span>
        <span>{{ catStore.cat.coins }}</span>
      </div>
    </div>

    <div class="perform-stage">
      <div class="stage-bg">
        <div class="stage-curtain-left"></div>
        <div class="stage-curtain-right"></div>
        <div class="spotlight" :class="{ active: performing }"></div>
        <div class="spotlight-secondary" :class="{ active: performing }"></div>
        <div class="stage-floor"></div>
        <div class="cat-perform">
          <CatSprite
            :stage="catStore.growthStage"
            :bodyType="catStore.cat.bodyType"
            :emotion="performing ? 'excited' : catStore.cat.emotion"
            :clothing="catStore.cat.equipment.clothing"
            :decoration="catStore.cat.equipment.decoration"
            :performSkill="currentSkill"
          />
        </div>
        <div class="skill-label" v-if="performing && currentSkillLabel">
          <span class="skill-label-icon">{{ currentSkillIcon }}</span>
          <span class="skill-label-text">{{ currentSkillLabel }}</span>
        </div>
        <div class="audience" v-if="performing || showResult">
          <span
            v-for="i in audienceCount"
            :key="i"
            class="audience-member"
            :style="{ animationDelay: `${i * 0.1}s` }"
          >🧑</span>
        </div>
        <div class="audience-reaction" v-if="performing && audienceReacting">
          <span class="reaction-emoji">{{ audienceReactionEmoji }}</span>
        </div>
      </div>
      <div class="perform-progress" v-if="performing">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-text">{{ currentSkillIndex + 1 }} / {{ selectedSkills.length }}</div>
      </div>
    </div>

    <div class="skill-select" v-if="!performing && !showResult">
      <h3>选择表演技能（可多选）</h3>
      <div class="skill-grid">
        <div
          v-for="skill in availableSkills"
          :key="skill.id"
          class="skill-card"
          :class="{ selected: selectedSkills.includes(skill.id) }"
          @click="toggleSkill(skill.id)"
        >
          <span class="skill-icon">{{ skill.icon }}</span>
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-score">+{{ skill.performanceScore }}分</span>
        </div>
        <div
          v-for="skill in lockedSkills"
          :key="skill.id"
          class="skill-card locked"
        >
          <span class="skill-icon">🔒</span>
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-req">亲密{{ skill.requiredIntimacy }}</span>
        </div>
      </div>
    </div>

    <div class="perform-result" v-if="showResult">
      <div class="result-card" :class="`grade-${result?.grade}`">
        <div class="result-grade">{{ result?.grade }}</div>
        <div class="result-score">得分：{{ result?.score }}</div>
        <div class="result-coins">🪙 +{{ result?.coins }}</div>
      </div>
    </div>

    <button
      class="perform-btn"
      :disabled="selectedSkills.length === 0 || performing"
      @click="startPerform"
      v-if="!showResult"
    >
      {{ performing ? '🎭 表演中...' : '🎭 开始表演' }}
    </button>

    <button class="perform-btn" @click="resetPerform" v-if="showResult">
      再来一次
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCatStore } from '@/stores/catStore'
import CatSprite from '@/components/CatSprite/index.vue'
import { SKILLS } from '@/game/constants'
import { playPerform, playApplause, playCoin } from '@/game/sounds'
import type { SkillId, PerformResult } from '@/types'

const SKILL_DURATION: Record<string, number> = {
  wag_tail: 1500,
  rub: 1600,
  shake_hand: 1800,
  roll: 1500,
  jump: 1400,
  catch: 1600,
  backflip: 2000,
  dance: 2000,
  hoop: 1800,
}

const SKILL_REACTION: Record<string, string> = {
  wag_tail: '😊',
  rub: '😍',
  shake_hand: '👏',
  roll: '😮',
  jump: '😲',
  catch: '🔥',
  backflip: '🤯',
  dance: '🎉',
  hoop: '⭐',
}

const catStore = useCatStore()
const selectedSkills = ref<SkillId[]>([])
const performing = ref(false)
const showResult = ref(false)
const result = ref<PerformResult | null>(null)
const audienceCount = ref(0)
const currentSkill = ref<SkillId | null>(null)
const currentSkillIndex = ref(0)
const audienceReacting = ref(false)
const audienceReactionEmoji = ref('👏')

const availableSkills = computed(() =>
  SKILLS.filter(s => catStore.cat.intimacy >= s.requiredIntimacy)
)

const lockedSkills = computed(() =>
  SKILLS.filter(s => catStore.cat.intimacy < s.requiredIntimacy)
)

const currentSkillLabel = computed(() => {
  if (!currentSkill.value) return ''
  const skill = SKILLS.find(s => s.id === currentSkill.value)
  return skill ? skill.name : ''
})

const currentSkillIcon = computed(() => {
  if (!currentSkill.value) return ''
  const skill = SKILLS.find(s => s.id === currentSkill.value)
  return skill ? skill.icon : ''
})

const progressPercent = computed(() => {
  if (selectedSkills.value.length === 0) return 0
  return Math.round((currentSkillIndex.value / selectedSkills.value.length) * 100)
})

function toggleSkill(id: SkillId) {
  const idx = selectedSkills.value.indexOf(id)
  if (idx === -1) {
    selectedSkills.value.push(id)
  } else {
    selectedSkills.value.splice(idx, 1)
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function startPerform() {
  if (selectedSkills.value.length === 0) return
  performing.value = true
  showResult.value = false
  audienceCount.value = 0
  currentSkillIndex.value = 0
  playPerform()

  for (let i = 0; i < 5; i++) {
    await delay(300)
    audienceCount.value = Math.min(8, audienceCount.value + 1)
  }

  for (let i = 0; i < selectedSkills.value.length; i++) {
    const skillId = selectedSkills.value[i]
    currentSkillIndex.value = i
    currentSkill.value = skillId

    audienceReactionEmoji.value = SKILL_REACTION[skillId] || '👏'
    audienceReacting.value = true

    const duration = SKILL_DURATION[skillId] || 1500
    await delay(duration)

    currentSkill.value = null
    audienceReacting.value = false
    await delay(300)
  }

  currentSkillIndex.value = selectedSkills.value.length

  audienceCount.value = Math.floor(Math.random() * 4) + 5
  result.value = catStore.perform(selectedSkills.value)
  performing.value = false
  showResult.value = true
  playApplause()
  setTimeout(() => playCoin(), 500)
}

function resetPerform() {
  showResult.value = false
  result.value = null
  selectedSkills.value = []
  audienceCount.value = 0
  currentSkill.value = null
  currentSkillIndex.value = 0
}
</script>

<style scoped lang="scss">
.street-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  overflow-y: auto;
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

.page-title {
  font-size: 20px;
  color: var(--accent);
}

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

.perform-stage {
  margin-bottom: 16px;
}

.stage-bg {
  width: 100%;
  height: 220px;
  background: linear-gradient(180deg, #1a0a2e 0%, #2d1b69 40%, #1a1a2e 100%);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stage-curtain-left,
.stage-curtain-right {
  position: absolute;
  top: 0;
  width: 30px;
  height: 100%;
  z-index: 3;
}

.stage-curtain-left {
  left: 0;
  background: linear-gradient(90deg, #8b0000 0%, #b71c1c 60%, transparent 100%);
  border-radius: 0 0 0 16px;
}

.stage-curtain-right {
  right: 0;
  background: linear-gradient(-90deg, #8b0000 0%, #b71c1c 60%, transparent 100%);
  border-radius: 0 0 16px 0;
}

.spotlight {
  position: absolute;
  width: 140px;
  height: 220px;
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
  clip-path: polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%);
  transition: all 0.5s ease;

  &.active {
    width: 160px;
    background: linear-gradient(180deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.05) 100%);
    animation: spotlight-pulse 1.5s ease-in-out infinite;
  }
}

.spotlight-secondary {
  position: absolute;
  width: 80px;
  height: 160px;
  background: linear-gradient(180deg, rgba(156, 39, 176, 0.08) 0%, transparent 100%);
  clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);
  left: 15%;
  top: 10%;
  opacity: 0;
  transition: all 0.5s ease;

  &.active {
    opacity: 1;
    animation: spotlight-secondary 2s ease-in-out infinite alternate;
  }
}

.stage-floor {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(180deg, rgba(139, 69, 19, 0.3) 0%, rgba(101, 50, 14, 0.5) 100%);
  border-radius: 0 0 16px 16px;
}

.stage-floor::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
}

.cat-perform {
  width: 130px;
  height: 130px;
  position: relative;
  z-index: 2;
}

.skill-label {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding: 4px 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: skill-label-in 0.3s ease;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.skill-label-icon {
  font-size: 16px;
}

.skill-label-text {
  font-size: 13px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.audience {
  position: absolute;
  bottom: 12px;
  display: flex;
  gap: 4px;
  justify-content: center;
  width: 100%;
  z-index: 2;
}

.audience-member {
  font-size: 16px;
  animation: audience-bounce 0.5s ease infinite alternate;
}

.audience-reaction {
  position: absolute;
  top: 45px;
  right: 20px;
  z-index: 5;
  animation: reaction-pop 0.6s ease;
}

.reaction-emoji {
  font-size: 28px;
  animation: reaction-float 1s ease-in-out infinite;
}

.perform-progress {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a29bfe, #6c5ce7, #ffd700);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

.skill-select {
  flex: 1;
  margin-bottom: 16px;

  h3 {
    font-size: 15px;
    color: var(--accent);
    margin-bottom: 10px;
  }
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.skill-card {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 10px 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;

  &.selected {
    border-color: var(--accent);
    background: rgba(255, 230, 109, 0.1);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.15);
  }

  &.locked {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.skill-icon {
  font-size: 22px;
}

.skill-name {
  font-size: 12px;
  color: var(--text-primary);
}

.skill-score {
  font-size: 10px;
  color: var(--success);
}

.skill-req {
  font-size: 10px;
  color: var(--text-secondary);
}

.perform-result {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.result-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px 40px;
  text-align: center;
  animation: card-appear 0.5s ease;

  &.grade-S { border: 2px solid #ffd700; box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
  &.grade-A { border: 2px solid #4caf50; }
  &.grade-B { border: 2px solid #2196f3; }
  &.grade-C { border: 2px solid #9e9e9e; }
}

.result-grade {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 8px;
}

.grade-S .result-grade { color: #ffd700; }
.grade-A .result-grade { color: #4caf50; }
.grade-B .result-grade { color: #2196f3; }
.grade-C .result-grade { color: #9e9e9e; }

.result-score {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.result-coins {
  font-size: 20px;
  font-weight: bold;
  color: var(--gold);
}

.perform-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #a29bfe, #6c5ce7);
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }
}

@keyframes audience-bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-3px); }
}

@keyframes card-appear {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes spotlight-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes spotlight-secondary {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

@keyframes skill-label-in {
  from { transform: translateX(-50%) translateY(-10px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

@keyframes reaction-pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes reaction-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>
