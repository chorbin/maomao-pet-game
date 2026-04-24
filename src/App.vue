<template>
  <div class="app-container">
    <router-view />
    <button class="music-btn" @click="toggleMusic" :class="{ playing: musicOn }">
      {{ musicOn ? '🎵' : '🔇' }}
    </button>
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">主页</span>
      </router-link>
      <router-link to="/fish-pond" class="nav-item" :class="{ active: $route.path === '/fish-pond' }">
        <span class="nav-icon">🎣</span>
        <span class="nav-label">鱼塘</span>
      </router-link>
      <router-link to="/street" class="nav-item" :class="{ active: $route.path === '/street' }">
        <span class="nav-icon">🎭</span>
        <span class="nav-label">街演</span>
      </router-link>
      <router-link to="/shop" class="nav-item" :class="{ active: $route.path === '/shop' }">
        <span class="nav-icon">🛒</span>
        <span class="nav-label">商店</span>
      </router-link>
      <router-link to="/backpack" class="nav-item" :class="{ active: $route.path === '/backpack' }">
        <span class="nav-icon">🎒</span>
        <span class="nav-label">背包</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCatStore } from '@/stores/catStore'
import { toggleBgMusic, isBgMusicPlaying, startBgMusic } from '@/game/sounds'

const catStore = useCatStore()
const musicOn = ref(false)

onMounted(() => {
  catStore.init()
})

onUnmounted(() => {
  catStore.cleanup()
})

function toggleMusic() {
  musicOn.value = toggleBgMusic()
}
</script>

<style scoped lang="scss">
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  position: relative;
}

.music-btn {
  position: absolute;
  top: 12px;
  right: 90px;
  z-index: 50;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(22, 33, 62, 0.7);
  backdrop-filter: blur(8px);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &.playing {
    animation: music-pulse 1s ease-in-out infinite;
  }

  &:active {
    transform: scale(0.9);
  }
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  background: rgba(22, 33, 62, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: var(--text-secondary);
  transition: all 0.2s;
  padding: 4px 8px;
  border-radius: 8px;

  &.active {
    color: var(--accent);
    transform: scale(1.1);
  }
}

.nav-icon {
  font-size: 22px;
  line-height: 1;
}

.nav-label {
  font-size: 10px;
  line-height: 1;
}

@keyframes music-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
