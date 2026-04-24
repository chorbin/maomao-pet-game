<template>
  <div class="wardrobe-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/')">← 返回</button>
      <h2 class="page-title">👗 换装</h2>
      <div class="coins">
        <span>🪙</span>
        <span>{{ catStore.cat.coins }}</span>
      </div>
    </div>

    <div class="cat-preview">
      <CatSprite
        :stage="catStore.growthStage"
        :bodyType="catStore.cat.bodyType"
        :emotion="catStore.cat.emotion"
        :clothing="catStore.cat.equipment.clothing"
        :decoration="catStore.cat.equipment.decoration"
      />
    </div>

    <div class="equipped-section">
      <h3>当前穿戴</h3>
      <div class="equipped-items">
        <div class="equipped-slot">
          <span class="slot-label">🎀 装饰</span>
          <span class="slot-item" v-if="catStore.cat.equipment.decoration">
            {{ getEquippedName(catStore.cat.equipment.decoration) }}
            <button class="unequip-btn" @click="catStore.unequipItem('decoration')">✕</button>
          </span>
          <span class="slot-empty" v-else>未穿戴</span>
        </div>
        <div class="equipped-slot">
          <span class="slot-label">👗 衣物</span>
          <span class="slot-item" v-if="catStore.cat.equipment.clothing">
            {{ getEquippedName(catStore.cat.equipment.clothing) }}
            <button class="unequip-btn" @click="catStore.unequipItem('clothing')">✕</button>
          </span>
          <span class="slot-empty" v-else>未穿戴</span>
        </div>
      </div>
    </div>

    <div class="wardrobe-items">
      <h3>我的装扮</h3>
      <div class="items-grid">
        <div
          v-for="inv in wardrobeInventory"
          :key="inv.itemId"
          class="wardrobe-card"
          :class="{ equipped: isEquipped(inv.itemId) }"
          @click="handleEquip(inv.itemId)"
        >
          <span class="item-icon">{{ getItemIcon(inv.itemId) }}</span>
          <span class="item-name">{{ getItemName(inv.itemId) }}</span>
          <span class="item-qty" v-if="inv.quantity > 1">x{{ inv.quantity }}</span>
          <span class="equipped-badge" v-if="isEquipped(inv.itemId)">穿戴中</span>
        </div>
        <div class="empty-hint" v-if="wardrobeInventory.length === 0">
          还没有装扮，去商店购买吧！
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCatStore } from '@/stores/catStore'
import CatSprite from '@/components/CatSprite/index.vue'
import { SHOP_ITEMS } from '@/game/constants'
import { showToast } from 'vant'

const catStore = useCatStore()

const wardrobeInventory = computed(() =>
  catStore.cat.inventory.filter(inv => {
    if (inv.quantity <= 0) return false
    const item = SHOP_ITEMS.find(s => s.id === inv.itemId)
    return item && (item.type === 'decoration' || item.type === 'clothing')
  })
)

function getItemIcon(id: string): string {
  return SHOP_ITEMS.find(s => s.id === id)?.icon || '📦'
}

function getItemName(id: string): string {
  return SHOP_ITEMS.find(s => s.id === id)?.name || '未知'
}

function getEquippedName(effectId: string): string {
  const item = SHOP_ITEMS.find(s => s.effect === effectId || s.id === effectId)
  return item ? `${item.icon} ${item.name}` : '未知'
}

function isEquipped(id: string): boolean {
  const item = SHOP_ITEMS.find(s => s.id === id)
  const effectValue = item?.effect || id
  return catStore.cat.equipment.decoration === effectValue || catStore.cat.equipment.clothing === effectValue
}

function handleEquip(id: string) {
  const item = SHOP_ITEMS.find(s => s.id === id)
  if (!item) return
  if (item.type === 'decoration') {
    catStore.equipItem(id, 'decoration')
    showToast(`🎀 已穿戴 ${item.name}`)
  } else if (item.type === 'clothing') {
    catStore.equipItem(id, 'clothing')
    showToast(`👗 已穿戴 ${item.name}`)
  }
}
</script>

<style scoped lang="scss">
.wardrobe-page {
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

.cat-preview {
  width: 100%;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-card);
  border-radius: 16px;
  margin-bottom: 16px;
}

.equipped-section {
  margin-bottom: 16px;

  h3 {
    font-size: 15px;
    color: var(--accent);
    margin-bottom: 8px;
  }
}

.equipped-items {
  display: flex;
  gap: 10px;
}

.equipped-slot {
  flex: 1;
  background: var(--bg-card);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slot-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.slot-item {
  font-size: 14px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.slot-empty {
  font-size: 13px;
  color: var(--text-secondary);
  opacity: 0.5;
}

.unequip-btn {
  background: rgba(244, 67, 54, 0.2);
  border: none;
  color: var(--danger);
  font-size: 11px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wardrobe-items {
  flex: 1;

  h3 {
    font-size: 15px;
    color: var(--accent);
    margin-bottom: 8px;
  }
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.wardrobe-card {
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
  }

  &:active {
    transform: scale(0.95);
  }
}

.item-icon {
  font-size: 32px;
}

.item-name {
  font-size: 12px;
  color: var(--text-primary);
}

.item-qty {
  font-size: 11px;
  color: var(--text-secondary);
}

.equipped-badge {
  font-size: 10px;
  color: var(--accent);
  background: rgba(255, 230, 109, 0.15);
  padding: 1px 6px;
  border-radius: 6px;
}

.empty-hint {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 30px 20px;
}
</style>
