<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DownloadDialog from './DownloadDialog.vue'

const isMenuOpen = ref(false)
const menuButton = ref<HTMLButtonElement>()
const header = ref<HTMLElement>()
const mounted = ref(false)
const route = useRoute()
const currentAnchor = (hash: string) => mounted.value && route.path === '/' && route.hash === hash ? 'location' : 'false'

function closeOutside(target: EventTarget | null) {
  if (!(target instanceof Node) || !header.value?.contains(target)) isMenuOpen.value = false
}

function onPointerDown(event: PointerEvent) {
  closeOutside(event.target)
}

onMounted(() => {
  mounted.value = true
  document.addEventListener('pointerdown', onPointerDown, true)
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown, true))
</script>

<template>
  <header ref="header" class="navbar" @focusout="closeOutside($event.relatedTarget)" @keydown.esc="isMenuOpen = false; menuButton?.focus()">
    <div class="container navbar__inner">
      <RouterLink to="/" class="navbar__brand" aria-label="Wavlin home" @click="isMenuOpen = false">
        <img class="navbar__brand-mark" src="/logo.svg" alt="" width="58" height="58" />
        <span>Wavlin</span>
      </RouterLink>

      <nav class="navbar__links" aria-label="Main">
        <RouterLink :to="{ path: '/', hash: '#features' }" :aria-current="currentAnchor('#features')">Features</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#platforms' }" :aria-current="currentAnchor('#platforms')">Platforms</RouterLink>
        <RouterLink to="/faq">FAQ</RouterLink>
        <DownloadDialog label="Download" button-class="btn btn-filled btn-sm" />
      </nav>

      <button ref="menuButton" class="icon-button navbar__menu" type="button" :aria-expanded="isMenuOpen" aria-controls="mobile-navigation" :aria-label="isMenuOpen ? 'Close navigation' : 'Open navigation'" @click="isMenuOpen = !isMenuOpen">
        <span class="material-symbols-rounded" aria-hidden="true">{{ isMenuOpen ? 'close' : 'menu' }}</span>
      </button>
    </div>

    <Transition name="drawer">
    <nav v-show="isMenuOpen" id="mobile-navigation" class="navbar__drawer" aria-label="Mobile">
      <div class="container">
        <RouterLink :to="{ path: '/', hash: '#features' }" :aria-current="currentAnchor('#features')" @click="isMenuOpen = false"><span class="material-symbols-rounded" aria-hidden="true">tune</span>Features</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#platforms' }" :aria-current="currentAnchor('#platforms')" @click="isMenuOpen = false"><span class="material-symbols-rounded" aria-hidden="true">devices</span>Platforms</RouterLink>
        <RouterLink to="/faq" @click="isMenuOpen = false"><span class="material-symbols-rounded" aria-hidden="true">help</span>FAQ</RouterLink>
        <DownloadDialog label="Download" button-class="navbar__drawer-download" @open="isMenuOpen = false" @close="menuButton?.focus()" />
      </div>
    </nav>
    </Transition>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 12px;
  z-index: 100;
  width: min(100% - 24px, 1240px);
  margin: 12px auto 0;
  border: 1px solid var(--glass-border);
  border-radius: var(--md-sys-shape-corner-full);
  background: color-mix(in srgb, #ffffff 8%, transparent);
  -webkit-backdrop-filter: var(--glass-filter);
  backdrop-filter: var(--glass-filter);
  box-shadow: var(--glass-shadow);
}

.navbar__inner {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 64px;
  gap: 24px;
  padding-inline: 12px 10px;
}

.navbar__brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-right: auto;
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-title-large);
  letter-spacing: var(--md-sys-typescale-title-large-tracking);
  text-decoration: none;
}

.navbar__brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.navbar__links > a:not(.btn) {
  padding: 10px 14px;
  border-radius: var(--md-sys-shape-corner-full);
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-large);
  font-variation-settings: 'ROND' 100;
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  text-decoration: none;
}

.navbar__links > a:not(.btn):hover,
.navbar__links > a[aria-current='location'],
.navbar__links > a.router-link-active:not([href*='#']):not(.btn) {
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
}

.navbar__links :deep(.btn) {
  margin-left: 10px;
}

.navbar__menu {
  display: none;
}

.navbar__drawer {
  position: absolute;
  top: calc(100% + 8px);
  inset-inline: 0;
  display: none;
  max-height: calc(100dvh - 100%);
  overflow-y: auto;
  padding: 6px 0 18px;
  border: 1px solid var(--glass-border);
  border-radius: var(--md-sys-shape-corner-extra-large);
  background: color-mix(in srgb, #14121a 90%, transparent);
  -webkit-backdrop-filter: var(--glass-filter);
  backdrop-filter: var(--glass-filter);
}

.navbar__drawer .container {
  display: grid;
  gap: 4px;
}

.navbar__drawer a,
.navbar__drawer :deep(.navbar__drawer-download) {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 52px;
  padding: 10px 18px;
  border: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  font: var(--md-sys-typescale-title-small);
  font-variation-settings: 'ROND' 100;
  letter-spacing: var(--md-sys-typescale-title-small-tracking);
  text-align: left;
  text-decoration: none;
}

.navbar__drawer a:hover,
.navbar__drawer a[aria-current='location'],
.navbar__drawer a.router-link-active:not([href*='#']),
.navbar__drawer :deep(.navbar__drawer-download:hover) {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.drawer-enter-active {
  transition: opacity var(--md-motion-effects-default), transform var(--md-motion-spatial-default);
}

.drawer-leave-active {
  transition: opacity var(--md-motion-exit), transform var(--md-motion-spatial-exit, var(--md-motion-exit));
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 800px) {
  .navbar__inner {
    min-height: 72px;
  }

  .navbar__brand-mark {
    width: 52px;
    height: 52px;
  }

  .navbar__links {
    display: none;
  }

  .navbar__menu,
  .navbar__drawer {
    display: flex;
  }
}
</style>
