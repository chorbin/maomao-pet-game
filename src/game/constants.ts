import type { FishQuality, FishItem, Skill, SkillId, ShopItem, GrowthStage } from '@/types'

export const GROWTH_STAGES: Record<GrowthStage, { name: string; emoji: string; minAge: number; maxAge: number }> = {
  1: { name: '奶猫', emoji: '🥚', minAge: 0, maxAge: 2 },
  2: { name: '幼猫', emoji: '🐾', minAge: 3, maxAge: 6 },
  3: { name: '少年猫', emoji: '🐱', minAge: 7, maxAge: 12 },
  4: { name: '青年猫', emoji: '🐆', minAge: 13, maxAge: 20 },
  5: { name: '成年猫', emoji: '🦁', minAge: 21, maxAge: 30 },
  6: { name: '传奇猫', emoji: '👑', minAge: 31, maxAge: 999 },
}

export const HUNGER_DECAY_RATE = 1
export const HUNGER_DECAY_INTERVAL = 60000
export const HUNGER_STARVATION_THRESHOLD = 0
export const STARVATION_INTIMACY_PENALTY = 5
export const STARVATION_PENALTY_INTERVAL = 300000

export const EMOTION_LABELS: Record<string, string> = {
  happy: '开心 😺',
  calm: '平静 😸',
  angry: '生气 😾',
  hungry: '饥饿 😿',
  sad: '委屈 😿',
  excited: '兴奋 🤩',
}

export const FISH_QUALITY_CONFIG: Record<FishQuality, { label: string; color: string; probability: number; glow: string }> = {
  common: { label: '普通', color: '#b0b0b0', probability: 0.45, glow: 'none' },
  good: { label: '优良', color: '#4caf50', probability: 0.25, glow: '0 0 6px #4caf50' },
  rare: { label: '稀有', color: '#2196f3', probability: 0.17, glow: '0 0 10px #2196f3' },
  epic: { label: '史诗', color: '#9c27b0', probability: 0.10, glow: '0 0 14px #9c27b0' },
  legendary: { label: '传说', color: '#ff9800', probability: 0.03, glow: '0 0 20px #ff9800, 0 0 40px #ff5722' },
}

export const FISH_LIST: FishItem[] = [
  { id: 'crucian', name: '小鲫鱼', quality: 'common', hungerRestore: 10, sellPrice: 3, icon: '🐟', color: '#b0b0b0' },
  { id: 'grass_carp', name: '草鱼', quality: 'common', hungerRestore: 12, sellPrice: 4, icon: '🐟', color: '#b0b0b0' },
  { id: 'bass', name: '鲈鱼', quality: 'good', hungerRestore: 20, sellPrice: 8, icon: '🐠', color: '#4caf50' },
  { id: 'carp', name: '鲤鱼', quality: 'good', hungerRestore: 22, sellPrice: 10, icon: '🐠', color: '#4caf50' },
  { id: 'salmon', name: '三文鱼', quality: 'rare', hungerRestore: 35, sellPrice: 18, icon: '🐟', color: '#2196f3' },
  { id: 'tuna', name: '金枪鱼', quality: 'rare', hungerRestore: 38, sellPrice: 22, icon: '🐟', color: '#2196f3' },
  { id: 'lobster', name: '龙虾', quality: 'epic', hungerRestore: 55, sellPrice: 40, icon: '🦞', color: '#9c27b0' },
  { id: 'king_crab', name: '帝王蟹', quality: 'epic', hungerRestore: 60, sellPrice: 50, icon: '🦀', color: '#9c27b0' },
  { id: 'golden_dragon', name: '金龙鱼', quality: 'legendary', hungerRestore: 80, sellPrice: 100, icon: '🐉', color: '#ff9800' },
  { id: 'pearl_shell', name: '珍珠贝', quality: 'legendary', hungerRestore: 85, sellPrice: 120, icon: '🦪', color: '#ff9800' },
]

export const SKILLS: Skill[] = [
  { id: 'wag_tail', name: '摇尾巴', icon: '🐾', requiredIntimacy: 0, performanceScore: 5 },
  { id: 'rub', name: '蹭人', icon: '💕', requiredIntimacy: 100, performanceScore: 10 },
  { id: 'shake_hand', name: '握手', icon: '🤝', requiredIntimacy: 300, performanceScore: 18 },
  { id: 'roll', name: '翻滚', icon: '🔄', requiredIntimacy: 300, performanceScore: 20 },
  { id: 'jump', name: '跳跃', icon: '⬆️', requiredIntimacy: 600, performanceScore: 30 },
  { id: 'catch', name: '接物', icon: '🎯', requiredIntimacy: 600, performanceScore: 32 },
  { id: 'backflip', name: '后空翻', icon: '💫', requiredIntimacy: 1000, performanceScore: 50 },
  { id: 'dance', name: '跳舞', icon: '💃', requiredIntimacy: 1000, performanceScore: 55 },
  { id: 'hoop', name: '钻圈', icon: '⭕', requiredIntimacy: 1000, performanceScore: 60 },
]

export const INTIMACY_LEVELS = [
  { min: 0, name: '陌生', emoji: '🤍', color: '#9e9e9e' },
  { min: 100, name: '熟悉', emoji: '💛', color: '#ffc107' },
  { min: 300, name: '亲密', emoji: '🧡', color: '#ff9800' },
  { min: 600, name: '挚友', emoji: '❤️', color: '#f44336' },
  { min: 1000, name: '灵魂伴侣', emoji: '💜', color: '#9c27b0' },
]

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'cat_food', name: '猫粮', type: 'food', price: 10, icon: '🥫', description: '普通猫粮，恢复15饱腹度', effect: 'hunger_15' },
  { id: 'dried_fish', name: '小鱼干', type: 'food', price: 25, icon: '🐟', description: '美味小鱼干，恢复25饱腹度', effect: 'hunger_25' },
  { id: 'yarn_ball', name: '毛线球', type: 'toy', price: 30, icon: '🧶', description: '猫咪最爱，互动亲密度+5', effect: 'intimacy_5' },
  { id: 'feather_wand', name: '逗猫棒', type: 'toy', price: 50, icon: '🪶', description: '逗猫神器，互动亲密度+10', effect: 'intimacy_10' },
  { id: 'laser_pen', name: '激光笔', type: 'toy', price: 80, icon: '🔦', description: '追光小能手，互动亲密度+15', effect: 'intimacy_15' },
  { id: 'bow', name: '蝴蝶结', type: 'decoration', price: 60, icon: '🎀', description: '可爱的蝴蝶结', effect: 'deco_bow' },
  { id: 'bowtie', name: '领结', type: 'decoration', price: 80, icon: '🎗️', description: '绅士领结', effect: 'deco_bowtie' },
  { id: 'crown', name: '皇冠', type: 'decoration', price: 200, icon: '👑', description: '猫咪国王的皇冠', effect: 'deco_crown' },
  { id: 'dress', name: '小裙子', type: 'clothing', price: 100, icon: '👗', description: '漂亮的小裙子', effect: 'cloth_dress' },
  { id: 'cape', name: '斗篷', type: 'clothing', price: 150, icon: '🧥', description: '帅气的超人斗篷', effect: 'cloth_cape' },
  { id: 'scarf', name: '围巾', type: 'clothing', price: 80, icon: '🧣', description: '温暖的围巾', effect: 'cloth_scarf' },
]

export const QUICK_FOOD_HUNGER: Record<string, number> = {
  cat_food: 15,
  dried_fish: 25,
}

export const FISHING_COOLDOWN = 3000
export const FISHING_ANIMATION_DURATION = 2000

export const PERFORM_COOLDOWN = 30000
export const PERFORM_REWARD: Record<string, { min: number; max: number }> = {
  S: { min: 150, max: 300 },
  A: { min: 60, max: 100 },
  B: { min: 30, max: 50 },
  C: { min: 10, max: 20 },
}

export const PET_INTIMACY_GAIN = 3
export const FEED_INTIMACY_GAIN = 2
export const FISH_INTIMACY_GAIN = 1

export const BODY_TYPE_THRESHOLDS = {
  thin: 25,
  fat: 75,
}
