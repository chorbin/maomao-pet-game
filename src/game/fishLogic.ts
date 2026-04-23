import type { FishItem, FishQuality } from '@/types'
import { FISH_LIST, FISH_QUALITY_CONFIG } from './constants'

export function catchFish(): FishItem {
  const quality = rollFishQuality()
  const fishOfQuality = FISH_LIST.filter(f => f.quality === quality)
  const fish = fishOfQuality[Math.floor(Math.random() * fishOfQuality.length)]
  return { ...fish }
}

function rollFishQuality(): FishQuality {
  const rand = Math.random()
  let cumulative = 0
  const qualities: FishQuality[] = ['common', 'good', 'rare', 'epic', 'legendary']
  for (const q of qualities) {
    cumulative += FISH_QUALITY_CONFIG[q].probability
    if (rand < cumulative) return q
  }
  return 'common'
}

export function getFishById(id: string): FishItem | undefined {
  return FISH_LIST.find(f => f.id === id)
}
