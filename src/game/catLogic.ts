import type { GrowthStage, BodyType, EmotionType } from '@/types'
import { GROWTH_STAGES, BODY_TYPE_THRESHOLDS } from './constants'

export function getGrowthStage(age: number): GrowthStage {
  if (age <= GROWTH_STAGES[1].maxAge) return 1
  if (age <= GROWTH_STAGES[2].maxAge) return 2
  if (age <= GROWTH_STAGES[3].maxAge) return 3
  if (age <= GROWTH_STAGES[4].maxAge) return 4
  if (age <= GROWTH_STAGES[5].maxAge) return 5
  return 6
}

export function getBodyType(hunger: number): BodyType {
  if (hunger < BODY_TYPE_THRESHOLDS.thin) return 'thin'
  if (hunger > BODY_TYPE_THRESHOLDS.fat) return 'fat'
  return 'normal'
}

export function getEmotion(
  hunger: number,
  intimacy: number,
  lastPetTime: number,
  isStarving: boolean
): EmotionType {
  if (isStarving) return 'hungry'
  if (hunger < 20) return 'hungry'
  if (Date.now() - lastPetTime < 5000) return 'happy'
  if (intimacy < 50) return 'sad'
  if (hunger > 80) return 'calm'
  return 'calm'
}

export function calculateOfflineProgress(lastOnlineTime: number): {
  hungerLoss: number
  ageGain: number
  wasStarving: boolean
} {
  const now = Date.now()
  const elapsed = now - lastOnlineTime
  const minutes = Math.floor(elapsed / 60000)
  const hungerLoss = Math.min(100, minutes)
  const ageGain = Math.floor(minutes / 10)
  const wasStarving = hungerLoss >= 60
  return { hungerLoss, ageGain, wasStarving }
}

export function getIntimacyLevel(intimacy: number) {
  const levels = [
    { min: 0, name: '陌生', emoji: '🤍', color: '#9e9e9e' },
    { min: 100, name: '熟悉', emoji: '💛', color: '#ffc107' },
    { min: 300, name: '亲密', emoji: '🧡', color: '#ff9800' },
    { min: 600, name: '挚友', emoji: '❤️', color: '#f44336' },
    { min: 1000, name: '灵魂伴侣', emoji: '💜', color: '#9c27b0' },
  ]
  let result = levels[0]
  for (const level of levels) {
    if (intimacy >= level.min) result = level
  }
  return result
}

export function getUnlockedSkills(intimacy: number) {
  const SKILLS = [
    { id: 'wag_tail' as const, requiredIntimacy: 0 },
    { id: 'rub' as const, requiredIntimacy: 100 },
    { id: 'shake_hand' as const, requiredIntimacy: 300 },
    { id: 'roll' as const, requiredIntimacy: 300 },
    { id: 'jump' as const, requiredIntimacy: 600 },
    { id: 'catch' as const, requiredIntimacy: 600 },
    { id: 'backflip' as const, requiredIntimacy: 1000 },
    { id: 'dance' as const, requiredIntimacy: 1000 },
    { id: 'hoop' as const, requiredIntimacy: 1000 },
  ]
  return SKILLS.filter(s => intimacy >= s.requiredIntimacy).map(s => s.id)
}
