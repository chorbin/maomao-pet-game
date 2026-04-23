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
        <div class="spotlight"></div>
        <div class="cat-perform">
          <CatSprite
            :stage="catStore.growthStage"
            :bodyType="catStore.cat.bodyType"
            :emotion="performing ? 'excited' : catStore.cat.emotion"
            :clothing="catStore.cat.equipment.clothing"
            :decoration="catStore.cat.equipment.decoration"
          />
        </div>
        <div class="audience" v-if="performing">
          <span v-for="i in audienceCount" :key="i" class="audience-member">🧑</span>
        </div>
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

const catStore = useCatStore()
const selectedSkills = ref<SkillId[]>([])
const performing = ref(false)
const showResult = ref(false)
const result = ref<PerformResult | null>(null)
const audienceCount = ref(0)

const availableSkills = computed(() =>
  SKILLS.filter(s => catStore.cat.intimacy >= s.requiredIntimacy)
)

const lockedSkills = computed(() =>
  SKILLS.filter(s => catStore.cat.intimacy < s.requiredIntimacy)
)

function toggleSkill(id: SkillId) {
  const idx = selectedSkills.value.indexOf(id)
  if (idx === -1) {
    selectedSkills.value.push(id)
  } else {
    selectedSkills.value.splice(idx, 1)
  }
}

function startPerform() {
  if (selectedSkills.value.length === 0) return
  performing.value = true
  audienceCount.value = 0
  playPerform()

  const interval = setInterval(() => {
    audienceCount.value = Math.min(8, audienceCount.value + 1)
  }, 300)

  setTimeout(() => {
    clearInterval(interval)
    audienceCount.value = Math.floor(Math.random() * 4) + 5
    result.value = catStore.perform(selectedSkills.value)
    performing.value = false
    showResult.value = true
    playApplause()
    setTimeout(() => playCoin(), 500)
  }, 3000)
}

function resetPerform() {
  showResult.value = false
  result.value = null
  selectedSkills.value = []
  audienceCount.value = 0
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
  height: 180px;
  background: linear-gradient(180deg, #2d1b69 0%, #1a1a2e 100%);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spotlight {
  position: absolute;
  width: 120px;
  height: 180px;
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.15) 0%, transparent 100%);
  clip-path: polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%);
}

.cat-perform {
  width: 120px;
  height: 120px;
  position: relative;
  z-index: 2;
}

.audience {
  position: absolute;
  bottom: 8px;
  display: flex;
  gap: 4px;
  justify-content: center;
  width: 100%;
}

.audience-member {
  font-size: 18px;
  animation: audience-bounce 0.5s ease infinite alternate;
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
</style>
