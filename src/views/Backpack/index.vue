<template>
  <div class="backpack-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/')">← 返回</button>
      <h2 class="page-title">🎒 背包</h2>
      <div class="coins">
        <span>🪙</span>
        <span>{{ catStore.cat.coins }}</span>
      </div>
    </div>

    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="tab-btn"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <div class="inventory-grid">
      <div
        v-for="inv in filteredInventory"
        :key="inv.itemId"
        class="inventory-card"
        :class="{ equipped: isEquipped(inv.itemId) }"
        @click="handleItem(inv.itemId)"
      >
        <div class="equipped-badge" v-if="isEquipped(inv.itemId)">穿戴中</div>
        <div class="item-icon">{{ getItemIcon(inv.itemId) }}</div>
        <div class="item-name">{{ getItemName(inv.itemId) }}</div>
        <div class="item-qty">x{{ inv.quantity }}</div>
        <div class="item-action" :class="{ unequip: isEquipped(inv.itemId) }">
          {{ isEquipped(inv.itemId) ? '卸下' : getActionText(inv.itemId) }}
        </div>
      </div>
      <div class="empty-hint" v-if="filteredInventory.length === 0">
        背包空空如也，去商店逛逛吧！
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCatStore } from '@/stores/catStore'
import { FISH_LIST, SHOP_ITEMS } from '@/game/constants'
import type { ItemType } from '@/types'
import { showToast } from 'vant'

const catStore = useCatStore()
const activeCategory = ref<ItemType | 'all'>('all')

const categories = [
  { key: 'all' as const, label: '全部' },
  { key: 'food' as const, label: '🐟 鱼获' },
  { key: 'toy' as const, label: '🧸 玩具' },
  { key: 'decoration' as const, label: '🎀 装饰' },
  { key: 'clothing' as const, label: '👗 衣物' },
]

const filteredInventory = computed(() => {
  return catStore.cat.inventory.filter(inv => {
    if (inv.quantity <= 0) return false
    if (activeCategory.value === 'all') return true
    const fish = FISH_LIST.find(f => f.id === inv.itemId)
    if (fish && activeCategory.value === 'food') return true
    const shopItem = SHOP_ITEMS.find(s => s.id === inv.itemId)
    if (shopItem && shopItem.type === activeCategory.value) return true
    return false
  })
})

function isEquipped(id: string): boolean {
  return catStore.cat.equipment.decoration === id || catStore.cat.equipment.clothing === id
}

function getItemIcon(id: string): string {
  const fish = FISH_LIST.find(f => f.id === id)
  if (fish) return fish.icon
  const shopItem = SHOP_ITEMS.find(s => s.id === id)
  if (shopItem) return shopItem.icon
  return '📦'
}

function getItemName(id: string): string {
  const fish = FISH_LIST.find(f => f.id === id)
  if (fish) return fish.name
  const shopItem = SHOP_ITEMS.find(s => s.id === id)
  if (shopItem) return shopItem.name
  return '未知物品'
}

function getActionText(id: string): string {
  const fish = FISH_LIST.find(f => f.id === id)
  if (fish) return '喂食'
  const shopItem = SHOP_ITEMS.find(s => s.id === id)
  if (shopItem) {
    if (shopItem.type === 'food') return '喂食'
    if (shopItem.type === 'toy') return '互动'
    if (shopItem.type === 'decoration' || shopItem.type === 'clothing') return '穿戴'
  }
  return '使用'
}

function handleItem(id: string) {
  if (isEquipped(id)) {
    const shopItem = SHOP_ITEMS.find(s => s.id === id)
    if (shopItem?.type === 'decoration') {
      catStore.unequipItem('decoration')
      showToast(`已卸下 ${shopItem.name}`)
    } else if (shopItem?.type === 'clothing') {
      catStore.unequipItem('clothing')
      showToast(`已卸下 ${shopItem.name}`)
    }
    return
  }

  const fish = FISH_LIST.find(f => f.id === id)
  if (fish) {
    catStore.feed(fish.id, fish.hungerRestore)
    showToast(`${fish.icon} ${fish.name} 喂食成功！饱腹+${fish.hungerRestore}`)
    return
  }
  const shopItem = SHOP_ITEMS.find(s => s.id === id)
  if (shopItem) {
    if (shopItem.type === 'food' && shopItem.effect?.startsWith('hunger_')) {
      const restore = parseInt(shopItem.effect.split('_')[1])
      catStore.feedQuickFood(shopItem.id)
      showToast(`${shopItem.icon} ${shopItem.name} 喂食成功！饱腹+${restore}`)
    } else if (shopItem.type === 'toy' && shopItem.effect?.startsWith('intimacy_')) {
      const gain = parseInt(shopItem.effect.split('_')[1])
      catStore.cat.intimacy = Math.min(2000, catStore.cat.intimacy + gain)
      catStore.removeFromInventory(id)
      showToast(`${shopItem.icon} 互动成功！亲密度+${gain}`)
    } else if (shopItem.type === 'decoration') {
      catStore.equipItem(id, 'decoration')
      showToast(`🎀 已穿戴 ${shopItem.name}`)
    } else if (shopItem.type === 'clothing') {
      catStore.equipItem(id, 'clothing')
      showToast(`👗 已穿戴 ${shopItem.name}`)
    }
  }
}
</script>

<style scoped lang="scss">
.backpack-page {
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
  margin-bottom: 12px;
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

.category-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tab-btn {
  flex-shrink: 0;
  padding: 6px 14px;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: var(--accent);
    color: #1a1a2e;
    font-weight: bold;
  }
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  flex: 1;
}

.inventory-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  border: 2px solid transparent;

  &.equipped {
    border-color: var(--accent);
    background: rgba(255, 230, 109, 0.08);
  }

  &:active { transform: scale(0.95); }
}

.equipped-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 9px;
  color: var(--accent);
  background: rgba(255, 230, 109, 0.2);
  padding: 1px 5px;
  border-radius: 4px;
}

.item-icon { font-size: 32px; }
.item-name { font-size: 12px; color: var(--text-primary); }
.item-qty { font-size: 12px; font-weight: bold; color: var(--accent); }

.item-action {
  font-size: 11px;
  color: var(--secondary);
  background: rgba(78, 205, 196, 0.15);
  padding: 2px 8px;
  border-radius: 8px;

  &.unequip {
    color: var(--warning);
    background: rgba(255, 152, 0, 0.15);
  }
}

.empty-hint {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 40px 20px;
}
</style>
