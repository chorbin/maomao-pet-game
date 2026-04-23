import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CatState, EmotionType, BodyType, InventoryItem, Equipment, SkillId } from '@/types'
import { calculateOfflineProgress, getGrowthStage, getBodyType, getUnlockedSkills, getIntimacyLevel } from '@/game/catLogic'
import { SKILLS, PET_INTIMACY_GAIN, FEED_INTIMACY_GAIN, FISH_INTIMACY_GAIN, GROWTH_STAGES, SHOP_ITEMS, QUICK_FOOD_HUNGER } from '@/game/constants'
import { catchFish } from '@/game/fishLogic'
import { calculatePerformResult } from '@/game/performLogic'

function createDefaultCat(): CatState {
  return {
    name: '小橘',
    age: 0,
    hunger: 70,
    intimacy: 0,
    emotion: 'calm',
    bodyType: 'normal',
    coins: 50,
    skills: ['wag_tail'],
    equipment: {},
    inventory: [],
    lastOnlineTime: Date.now(),
    totalFeedCount: 0,
    totalPetCount: 0,
    totalFishCount: 0,
    totalPerformCount: 0,
    achievements: [],
    isEvolved: false,
  }
}

export const useCatStore = defineStore('cat', () => {
  const cat = ref<CatState>(createDefaultCat())
  const lastPetTime = ref(0)
  const showEvolution = ref(false)
  const evolutionStage = ref(1)
  let hungerTimer: ReturnType<typeof setInterval> | null = null

  const growthStage = computed(() => getGrowthStage(cat.value.age))
  const growthInfo = computed(() => GROWTH_STAGES[growthStage.value])
  const intimacyLevel = computed(() => getIntimacyLevel(cat.value.intimacy))
  const unlockedSkills = computed(() => getUnlockedSkills(cat.value.intimacy))
  const allSkills = computed(() => SKILLS)
  const currentBodyType = computed(() => getBodyType(cat.value.hunger))

  function init() {
    processOfflineProgress()
    startHungerTimer()
    cat.value.bodyType = currentBodyType.value
    cat.value.skills = unlockedSkills.value
  }

  function processOfflineProgress() {
    if (!cat.value.lastOnlineTime) {
      cat.value.lastOnlineTime = Date.now()
      return
    }
    const { hungerLoss, ageGain, wasStarving } = calculateOfflineProgress(cat.value.lastOnlineTime)
    const prevStage = getGrowthStage(cat.value.age)
    cat.value.hunger = Math.max(0, cat.value.hunger - hungerLoss)
    cat.value.age += ageGain
    if (wasStarving) {
      cat.value.intimacy = Math.max(0, cat.value.intimacy - 10)
      cat.value.emotion = 'sad'
    }
    const newStage = getGrowthStage(cat.value.age)
    if (newStage > prevStage) {
      evolutionStage.value = newStage
      showEvolution.value = true
    }
    cat.value.lastOnlineTime = Date.now()
  }

  function startHungerTimer() {
    if (hungerTimer) clearInterval(hungerTimer)
    hungerTimer = setInterval(() => {
      if (cat.value.hunger > 0) {
        cat.value.hunger = Math.max(0, cat.value.hunger - 1)
      }
      cat.value.age += 0.02
      cat.value.bodyType = currentBodyType.value

      const prevStage = getGrowthStage(cat.value.age - 0.02)
      const newStage = getGrowthStage(cat.value.age)
      if (newStage > prevStage) {
        evolutionStage.value = newStage
        showEvolution.value = true
      }

      if (cat.value.hunger === 0) {
        cat.value.intimacy = Math.max(0, cat.value.intimacy - 0.5)
        cat.value.emotion = 'hungry'
      } else if (cat.value.hunger < 20) {
        cat.value.emotion = 'hungry'
      } else if (Date.now() - lastPetTime.value < 10000) {
        cat.value.emotion = 'happy'
      } else {
        cat.value.emotion = 'calm'
      }

      cat.value.skills = unlockedSkills.value
      cat.value.lastOnlineTime = Date.now()
    }, 10000)
  }

  function pet() {
    lastPetTime.value = Date.now()
    cat.value.intimacy = Math.min(2000, cat.value.intimacy + PET_INTIMACY_GAIN)
    cat.value.emotion = 'happy'
    cat.value.totalPetCount++
    cat.value.skills = unlockedSkills.value
  }

  function feed(fishId: string, hungerRestore: number) {
    cat.value.hunger = Math.min(100, cat.value.hunger + hungerRestore)
    cat.value.intimacy = Math.min(2000, cat.value.intimacy + FEED_INTIMACY_GAIN)
    cat.value.emotion = 'happy'
    cat.value.totalFeedCount++
    cat.value.bodyType = currentBodyType.value
    cat.value.skills = unlockedSkills.value
    removeFromInventory(fishId)
  }

  function feedQuickFood(shopItemId: string) {
    const restore = QUICK_FOOD_HUNGER[shopItemId] || 10
    cat.value.hunger = Math.min(100, cat.value.hunger + restore)
    cat.value.intimacy = Math.min(2000, cat.value.intimacy + FEED_INTIMACY_GAIN)
    cat.value.emotion = 'happy'
    cat.value.totalFeedCount++
    cat.value.bodyType = currentBodyType.value
    cat.value.skills = unlockedSkills.value
    removeFromInventory(shopItemId)
  }

  function goFishing(): { fish: ReturnType<typeof catchFish>; isNew: boolean } | null {
    const fish = catchFish()
    cat.value.intimacy = Math.min(2000, cat.value.intimacy + FISH_INTIMACY_GAIN)
    cat.value.totalFishCount++
    cat.value.skills = unlockedSkills.value
    const existing = cat.value.inventory.find(i => i.itemId === fish.id)
    if (existing) {
      existing.quantity++
      return { fish, isNew: false }
    } else {
      cat.value.inventory.push({ itemId: fish.id, quantity: 1 })
      return { fish, isNew: true }
    }
  }

  function perform(selectedSkills: SkillId[]) {
    const result = calculatePerformResult(selectedSkills, cat.value.intimacy)
    cat.value.coins += result.coins
    cat.value.totalPerformCount++
    cat.value.intimacy = Math.min(2000, cat.value.intimacy + 3)
    cat.value.emotion = 'excited'
    cat.value.skills = unlockedSkills.value
    return result
  }

  function buyItem(shopItemId: string): boolean {
    const item = SHOP_ITEMS.find(i => i.id === shopItemId)
    if (!item || cat.value.coins < item.price) return false
    cat.value.coins -= item.price
    const existing = cat.value.inventory.find(i => i.itemId === shopItemId)
    if (existing) {
      existing.quantity++
    } else {
      cat.value.inventory.push({ itemId: shopItemId, quantity: 1 })
    }
    return true
  }

  function equipItem(itemId: string, type: 'decoration' | 'clothing') {
    if (type === 'decoration') {
      cat.value = { ...cat.value, equipment: { ...cat.value.equipment, decoration: itemId } }
    } else {
      cat.value = { ...cat.value, equipment: { ...cat.value.equipment, clothing: itemId } }
    }
  }

  function unequipItem(type: 'decoration' | 'clothing') {
    if (type === 'decoration') {
      const { decoration, ...rest } = cat.value.equipment
      cat.value = { ...cat.value, equipment: rest }
    } else {
      const { clothing, ...rest } = cat.value.equipment
      cat.value = { ...cat.value, equipment: rest }
    }
  }

  function removeFromInventory(itemId: string) {
    const idx = cat.value.inventory.findIndex(i => i.itemId === itemId)
    if (idx !== -1) {
      cat.value.inventory[idx].quantity--
      if (cat.value.inventory[idx].quantity <= 0) {
        cat.value.inventory.splice(idx, 1)
      }
    }
  }

  function dismissEvolution() {
    showEvolution.value = false
  }

  function renameCat(name: string) {
    cat.value.name = name
  }

  return {
    cat,
    lastPetTime,
    showEvolution,
    evolutionStage,
    growthStage,
    growthInfo,
    intimacyLevel,
    unlockedSkills,
    allSkills,
    currentBodyType,
    init,
    pet,
    feed,
    feedQuickFood,
    goFishing,
    perform,
    buyItem,
    equipItem,
    unequipItem,
    removeFromInventory,
    dismissEvolution,
    renameCat,
  }
}, {
  persist: {
    key: 'cat-pet-game',
    pick: ['cat'],
  }
})
