<template>
  <div class="shop-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/')">← 返回</button>
      <h2 class="page-title">🛒 商店</h2>
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

    <div class="shop-grid">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="shop-card"
      >
        <div class="item-icon">{{ item.icon }}</div>
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-desc">{{ item.description }}</div>
        </div>
        <button
          class="buy-btn"
          :disabled="catStore.cat.coins < item.price"
          @click="handleBuy(item)"
        >
          🪙 {{ item.price }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCatStore } from '@/stores/catStore'
import { SHOP_ITEMS } from '@/game/constants'
import { playBuy } from '@/game/sounds'
import type { ShopItem, ItemType } from '@/types'
import { showToast } from 'vant'

const catStore = useCatStore()
const activeCategory = ref<ItemType | 'all'>('all')

const categories = [
  { key: 'all' as const, label: '全部' },
  { key: 'food' as const, label: '🍗 食物' },
  { key: 'toy' as const, label: '🧸 玩具' },
  { key: 'decoration' as const, label: '🎀 装饰' },
  { key: 'clothing' as const, label: '👗 衣物' },
]

const filteredItems = computed(() => {
  if (activeCategory.value === 'all') return SHOP_ITEMS
  return SHOP_ITEMS.filter(i => i.type === activeCategory.value)
})

function handleBuy(item: ShopItem) {
  if (catStore.buyItem(item.id)) {
    playBuy()
    showToast(`✅ 购买成功：${item.icon} ${item.name}`)
  } else {
    showToast('❌ 金币不足！')
  }
}
</script>

<style scoped lang="scss">
.shop-page {
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

.shop-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shop-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 12px;
}

.item-icon {
  font-size: 36px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 2px;
}

.item-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.buy-btn {
  flex-shrink: 0;
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: bold;
  color: #1a1a2e;
  background: linear-gradient(135deg, #ffd700, #ff9800);
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
}
</style>
