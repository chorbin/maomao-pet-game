<template>
  <div class="home-page">
    <div class="bg-scene">
      <div class="bg-stars">
        <span v-for="i in 20" :key="'star'+i" class="star" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 40 + '%', animationDelay: Math.random() * 3 + 's', width: (1 + Math.random() * 2) + 'px', height: (1 + Math.random() * 2) + 'px' }"></span>
      </div>
      <div class="bg-moon"></div>
      <div class="bg-sky"></div>
      <div class="bg-clouds">
        <div class="cloud cloud1"></div>
        <div class="cloud cloud2"></div>
        <div class="cloud cloud3"></div>
      </div>
      <div class="bg-tree bg-tree1">🌳</div>
      <div class="bg-tree bg-tree2">🌲</div>
      <div class="bg-tree bg-tree3">🌿</div>
      <div class="bg-fence"></div>
      <div class="bg-ground"></div>
      <div class="bg-grass">
        <span v-for="i in 15" :key="i" class="grass-blade" :style="{ left: (i - 1) * 7 + '%', animationDelay: i * 0.15 + 's', height: (10 + Math.random() * 8) + 'px' }"></span>
      </div>
      <div class="bg-flowers">
        <span class="flower" style="left: 8%; bottom: 42%;">🌸</span>
        <span class="flower" style="left: 25%; bottom: 40%;">🌼</span>
        <span class="flower" style="left: 55%; bottom: 43%;">🌺</span>
        <span class="flower" style="left: 78%; bottom: 41%;">🌻</span>
        <span class="flower" style="left: 92%; bottom: 42%;">🌷</span>
      </div>
      <div class="bg-fireflies">
        <span v-for="i in 5" :key="'ff'+i" class="firefly" :style="{ left: (10 + i * 18) + '%', top: (30 + Math.random() * 30) + '%', animationDelay: i * 0.8 + 's' }"></span>
      </div>
    </div>

    <div class="top-bar">
      <div class="cat-info">
        <span class="cat-name">{{ catStore.cat.name }}</span>
        <span class="cat-stage">{{ catStore.growthInfo.emoji }} {{ catStore.growthInfo.name }}</span>
      </div>
      <div class="coins">
        <span class="coin-icon">🪙</span>
        <span class="coin-amount">{{ catStore.cat.coins }}</span>
      </div>
    </div>

    <div class="status-bar">
      <div class="status-item">
        <span class="status-label">🍖 饱腹</span>
        <div class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill hunger" :style="{ width: catStore.cat.hunger + '%' }"></div>
          </div>
          <span class="progress-text">{{ Math.floor(catStore.cat.hunger) }}/100</span>
        </div>
      </div>
      <div class="status-item">
        <span class="status-label">💕 亲密</span>
        <div class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill intimacy" :style="{ width: intimacyPercent + '%' }"></div>
          </div>
          <span class="progress-text">{{ catStore.intimacyLevel.emoji }} {{ catStore.intimacyLevel.name }}</span>
        </div>
      </div>
    </div>

    <div class="cat-area" @click="handleCatClick">
      <CatSprite
        :stage="catStore.growthStage"
        :bodyType="catStore.cat.bodyType"
        :emotion="catStore.cat.emotion"
        :clothing="catStore.cat.equipment.clothing"
        :decoration="catStore.cat.equipment.decoration"
      />
      <div class="pet-hint" v-if="!hasPetted">👆 点击猫咪抚摸</div>
      <div class="pet-feedback" v-if="showPetFeedback">
        <span class="pet-heart">{{ petFeedbackText }}</span>
      </div>
    </div>

    <div class="age-bar">
      <span>📅 年龄：{{ catStore.cat.age.toFixed(1) }}天</span>
      <span>体型：{{ bodyTypeLabel }}</span>
    </div>

    <div class="action-bar">
      <button class="action-btn feed-btn" @click="showFeedMenu = true">
        🍗 喂食
      </button>
      <button class="action-btn play-btn" @click="$router.push('/fish-pond')">
        🎣 钓鱼
      </button>
      <button class="action-btn perform-btn" @click="$router.push('/street')">
        🎭 街演
      </button>
      <button class="action-btn wardrobe-btn" @click="$router.push('/wardrobe')">
        👗 换装
      </button>
    </div>

    <Transition name="slide-up">
      <div class="feed-overlay" v-if="showFeedMenu" @click.self="showFeedMenu = false">
        <div class="feed-panel">
          <div class="feed-header">
            <h3>🍗 选择食物喂食</h3>
            <button class="close-btn" @click="showFeedMenu = false">✕</button>
          </div>
          <div class="feed-list">
            <div
              v-for="item in feedItems"
              :key="item.id"
              class="feed-item"
              @click="onFeedItem(item)"
            >
              <span class="feed-icon">{{ item.icon }}</span>
              <div class="feed-info">
                <span class="feed-name">{{ item.name }}</span>
                <span class="feed-desc">{{ item.desc }}</span>
              </div>
              <span class="feed-qty">x{{ item.quantity }}</span>
            </div>
            <div class="feed-empty" v-if="feedItems.length === 0">
              没有食物了，去钓鱼或商店购买吧！
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <EvolutionAnimation
      :show="catStore.showEvolution"
      :stage="catStore.evolutionStage"
      @dismiss="catStore.dismissEvolution()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCatStore } from '@/stores/catStore'
import CatSprite from '@/components/CatSprite/index.vue'
import EvolutionAnimation from '@/components/EvolutionAnimation/index.vue'
import { FISH_LIST, SHOP_ITEMS, PET_INTIMACY_GAIN } from '@/game/constants'
import { playMeow, playPurr, playFeed, playEvolution, startBgMusic, isBgMusicPlaying } from '@/game/sounds'
import { showToast } from 'vant'

const catStore = useCatStore()
const showFeedMenu = ref(false)
const hasPetted = ref(false)
const showPetFeedback = ref(false)
const petFeedbackText = ref('💕 +3')

const bodyTypeLabel = computed(() => {
  const map: Record<string, string> = { thin: '偏瘦', normal: '正常', fat: '偏胖' }
  return map[catStore.cat.bodyType] || '正常'
})

const intimacyPercent = computed(() => Math.min(100, (catStore.cat.intimacy / 2000) * 100))

interface FeedItemInfo {
  id: string
  icon: string
  name: string
  desc: string
  quantity: number
  hungerRestore: number
  type: 'fish' | 'food'
}

const feedItems = computed<FeedItemInfo[]>(() => {
  const items: FeedItemInfo[] = []
  for (const inv of catStore.cat.inventory) {
    if (inv.quantity <= 0) continue
    const fish = FISH_LIST.find(f => f.id === inv.itemId)
    if (fish) {
      items.push({ id: fish.id, icon: fish.icon, name: fish.name, desc: `饱腹+${fish.hungerRestore}`, quantity: inv.quantity, hungerRestore: fish.hungerRestore, type: 'fish' })
      continue
    }
    const shopItem = SHOP_ITEMS.find(s => s.id === inv.itemId)
    if (shopItem && shopItem.type === 'food') {
      const restore = shopItem.effect?.startsWith('hunger_') ? parseInt(shopItem.effect.split('_')[1]) : 10
      items.push({ id: shopItem.id, icon: shopItem.icon, name: shopItem.name, desc: `饱腹+${restore}`, quantity: inv.quantity, hungerRestore: restore, type: 'food' })
    }
  }
  return items
})

function handleCatClick(e: MouseEvent | TouchEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  let y: number
  if ('touches' in e) {
    y = e.touches[0].clientY - rect.top
  } else {
    y = e.clientY - rect.top
  }
  const ratio = y / rect.height

  if (ratio < 0.35) {
    petFeedbackText.value = '😺 喵~'
    catStore.pet()
    playMeow()
  } else if (ratio < 0.7) {
    petFeedbackText.value = '💕 咕噜~'
    catStore.pet()
    playPurr()
  } else {
    petFeedbackText.value = '🐾 喵呜~'
    catStore.pet()
    playMeow()
  }

  hasPetted.value = true
  showPetFeedback.value = true
  setTimeout(() => { showPetFeedback.value = false }, 800)
}

function onFeedItem(item: FeedItemInfo) {
  if (item.type === 'fish') {
    catStore.feed(item.id, item.hungerRestore)
  } else {
    catStore.feedQuickFood(item.id)
  }
  playFeed()
  showToast(`${item.icon} ${item.name} 喂食成功！饱腹+${item.hungerRestore}`)
  showFeedMenu.value = false
}

watch(() => catStore.showEvolution, (val) => {
  if (val) playEvolution()
})

watch(() => catStore.cat.emotion, (val) => {
  if (val === 'hungry' && !isBgMusicPlaying()) {
    startBgMusic()
  }
})
</script>

<style scoped lang="scss">
.home-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  overflow-y: auto;
  position: relative;
}

.bg-scene {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 65%;
  background: linear-gradient(180deg, #0d1b2a 0%, #1b2838 20%, #2d3a4a 45%, #3d5a50 70%, #4a6741 100%);
}

.bg-moon {
  position: absolute;
  top: 8%;
  right: 15%;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fffde7, #fff9c4, #f0e68c);
  box-shadow: 0 0 30px rgba(255, 249, 196, 0.4), 0 0 60px rgba(255, 249, 196, 0.2);
}

.bg-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle-star 2s ease-in-out infinite;
}

.bg-clouds {
  position: absolute;
  top: 5%;
  width: 100%;
  height: 30%;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50px;

  &.cloud1 { width: 120px; height: 30px; top: 10%; left: -20px; animation: cloud-drift 25s linear infinite; }
  &.cloud2 { width: 80px; height: 20px; top: 40%; left: 30%; animation: cloud-drift 35s linear infinite reverse; }
  &.cloud3 { width: 100px; height: 25px; top: 70%; left: 60%; animation: cloud-drift 30s linear infinite; animation-delay: -10s; }
}

.bg-tree {
  position: absolute;
  font-size: 36px;
  z-index: 1;
  filter: brightness(0.6);

  &.bg-tree1 { bottom: 36%; left: 3%; font-size: 42px; }
  &.bg-tree2 { bottom: 37%; right: 5%; font-size: 38px; }
  &.bg-tree3 { bottom: 38%; left: 45%; font-size: 24px; }
}

.bg-fence {
  position: absolute;
  bottom: 38%;
  left: 0;
  width: 100%;
  height: 20px;
  background: repeating-linear-gradient(90deg, #5d4037 0px, #5d4037 4px, transparent 4px, transparent 16px);
  opacity: 0.4;
}

.bg-ground {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(180deg, #2d4a2d 0%, #1e3a1e 40%, #162e16 100%);
}

.bg-grass {
  position: absolute;
  bottom: 38%;
  width: 100%;
  height: 20px;
}

.grass-blade {
  position: absolute;
  bottom: 0;
  width: 3px;
  background: #3a6b3a;
  border-radius: 2px 2px 0 0;
  animation: sway 2s ease-in-out infinite;
  transform-origin: bottom center;
}

.bg-flowers {
  position: absolute;
  width: 100%;
  height: 100%;
}

.flower {
  position: absolute;
  font-size: 16px;
  animation: flower-sway 3s ease-in-out infinite;
}

.bg-fireflies {
  position: absolute;
  width: 100%;
  height: 60%;
}

.firefly {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ffd700;
  box-shadow: 0 0 6px #ffd700, 0 0 12px rgba(255, 215, 0, 0.3);
  animation: firefly-float 4s ease-in-out infinite;
}

.top-bar, .status-bar, .cat-area, .age-bar, .action-bar {
  position: relative;
  z-index: 1;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cat-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cat-name {
  font-size: 20px;
  font-weight: bold;
  color: var(--accent);
}

.cat-stage {
  font-size: 14px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 10px;
}

.coins {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 215, 0, 0.15);
  padding: 4px 12px;
  border-radius: 12px;
}

.coin-icon { font-size: 18px; }

.coin-amount {
  font-size: 16px;
  font-weight: bold;
  color: var(--gold);
}

.status-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 13px;
  white-space: nowrap;
  min-width: 60px;
}

.progress-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;

  &.hunger { background: linear-gradient(90deg, #ff6b6b, #ff8e53); }
  &.intimacy { background: linear-gradient(90deg, #e91e63, #ff4081); }
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 60px;
  text-align: right;
}

.cat-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 220px;
  margin: 4px 0;
}

.pet-hint {
  position: absolute;
  bottom: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  animation: bounce-hint 2s ease-in-out infinite;
}

.pet-feedback {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  animation: float-up 0.8s ease-out forwards;
}

.pet-heart {
  font-size: 20px;
  font-weight: bold;
  color: #ff4081;
  text-shadow: 0 0 10px rgba(255, 64, 129, 0.5);
}

.age-bar {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.action-bar {
  display: flex;
  gap: 8px;
  padding-bottom: 8px;
}

.action-btn {
  flex: 1;
  padding: 12px 4px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  color: #fff;

  &:active { transform: scale(0.95); }
  &.feed-btn { background: linear-gradient(135deg, #ff6b6b, #ee5a24); }
  &.play-btn { background: linear-gradient(135deg, #4ecdc4, #2e86de); }
  &.perform-btn { background: linear-gradient(135deg, #a29bfe, #6c5ce7); }
  &.wardrobe-btn { background: linear-gradient(135deg, #fd79a8, #e84393); }
}

.feed-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.feed-panel {
  width: 100%;
  max-width: 480px;
  max-height: 60vh;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  padding: 16px;
  overflow-y: auto;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  h3 { font-size: 16px; color: var(--accent); }
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feed-list { display: flex; flex-direction: column; gap: 8px; }

.feed-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  &:active { background: rgba(255, 255, 255, 0.1); transform: scale(0.98); }
}

.feed-icon { font-size: 28px; }

.feed-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.feed-name { font-size: 14px; font-weight: bold; }
.feed-desc { font-size: 12px; color: var(--success); }
.feed-qty { font-size: 13px; font-weight: bold; color: var(--accent); }

.feed-empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 30px;
  font-size: 14px;
}

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { .feed-panel { transform: translateY(100%); } opacity: 0; }

@keyframes bounce-hint {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes float-up {
  0% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-40px); }
}

@keyframes cloud-drift {
  from { transform: translateX(-150px); }
  to { transform: translateX(calc(100vw + 150px)); }
}

@keyframes sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

@keyframes twinkle-star {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes flower-sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes firefly-float {
  0%, 100% { transform: translate(0, 0); opacity: 0.3; }
  25% { transform: translate(10px, -8px); opacity: 1; }
  50% { transform: translate(-5px, -15px); opacity: 0.5; }
  75% { transform: translate(8px, -5px); opacity: 0.8; }
}
</style>
