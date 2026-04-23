export type EmotionType = 'happy' | 'calm' | 'angry' | 'hungry' | 'sad' | 'excited'

export type BodyType = 'thin' | 'normal' | 'fat'

export type GrowthStage = 1 | 2 | 3 | 4 | 5 | 6

export type FishQuality = 'common' | 'good' | 'rare' | 'epic' | 'legendary'

export type ItemType = 'food' | 'toy' | 'decoration' | 'clothing'

export type SkillId = 'wag_tail' | 'rub' | 'shake_hand' | 'roll' | 'jump' | 'catch' | 'backflip' | 'dance' | 'hoop'

export interface FishItem {
  id: string
  name: string
  quality: FishQuality
  hungerRestore: number
  icon: string
  color: string
}

export interface ShopItem {
  id: string
  name: string
  type: ItemType
  price: number
  icon: string
  description: string
  effect?: string
}

export interface Skill {
  id: SkillId
  name: string
  icon: string
  requiredIntimacy: number
  performanceScore: number
}

export interface InventoryItem {
  itemId: string
  quantity: number
}

export interface Equipment {
  decoration?: string
  clothing?: string
}

export interface CatState {
  name: string
  age: number
  hunger: number
  intimacy: number
  emotion: EmotionType
  bodyType: BodyType
  coins: number
  skills: SkillId[]
  equipment: Equipment
  inventory: InventoryItem[]
  lastOnlineTime: number
  totalFeedCount: number
  totalPetCount: number
  totalFishCount: number
  totalPerformCount: number
  achievements: string[]
  isEvolved: boolean
}

export interface PerformResult {
  grade: 'S' | 'A' | 'B' | 'C'
  score: number
  coins: number
}
