<script setup lang="ts">
import { ref } from 'vue'
import { ShapeBackdrop } from 'material-shapes-ts/vue'
import { DOWNLOAD_PLATFORMS, type DownloadPlatformKey } from '../content/downloads'
import { FEATURES as features } from '../content/features'
import DownloadDialog from './DownloadDialog.vue'
import LyricsShowcase from './LyricsShowcase.vue'

const playbackControls = [['Tempo', '1.10×'], ['Pitch', '+1 st'], ['Sleep timer', '30 min'], ['Skip silence', 'On'], ['Normalize', 'On']]
const animationsPaused = ref(false)
const downloadDialog = ref<InstanceType<typeof DownloadDialog>>()
function openDownload(platform: DownloadPlatformKey) {
  downloadDialog.value?.open(platform)
}
</script>

<template>
  <section id="features" class="features section-band" :class="{ 'is-paused': animationsPaused }" aria-labelledby="features-title">
    <div class="container">
      <h2 id="features-title" class="sr-only">Wavlin features</h2>
      <div class="features__grid">
        <article v-for="(feature, index) in features" :key="feature.label" class="features__card" :class="`features__card--${index + 1}`">
          <div class="features__top"><ShapeBackdrop :shape="feature.shape" :color="feature.iconBackground" class="features__icon"><span class="features__icon-glyph material-symbols-rounded" :style="{ color: feature.iconColor }" aria-hidden="true">{{ feature.icon }}</span></ShapeBackdrop><span class="features__label">{{ feature.label }}</span><button v-if="index === 1" type="button" class="lyrics-toggle" :aria-label="animationsPaused ? 'Resume lyrics animation' : 'Pause lyrics animation'" :aria-pressed="animationsPaused" @click="animationsPaused = !animationsPaused"><span class="material-symbols-rounded" aria-hidden="true">{{ animationsPaused ? 'play_arrow' : 'pause' }}</span></button></div>
          <LyricsShowcase v-if="index === 1" :paused="animationsPaused" />
          <ul v-if="index === 5" class="features__controls" aria-hidden="true">
            <li v-for="[name, value] in playbackControls" :key="name">{{ name }}<strong>{{ value }}</strong></li>
          </ul>
          <div class="features__copy"><h3>{{ feature.title }}</h3><p>{{ feature.body }}</p></div>
        </article>
      </div>
    </div>
  </section>

  <section id="platforms" class="platforms">
    <div class="container platforms__layout">
      <header><h2>Get<br /><span>Wavlin</span></h2><p>Grab the Android build and follow the quick install steps.</p></header>
      <div class="platforms__list">
        <button v-for="platform in DOWNLOAD_PLATFORMS" :key="platform.name" type="button" aria-haspopup="dialog" @click="openDownload(platform.key)">
          <span class="platforms__icon"><img :src="`/icons/${platform.icon}.svg`" alt="" /></span>
          <span class="platforms__name"><strong>{{ platform.name }}</strong><small>{{ platform.detail }}</small></span>
        </button>
      </div>
      <DownloadDialog ref="downloadDialog" :show-trigger="false" />
    </div>
  </section>
</template>

<style scoped>
.features,
.platforms {
  padding: 92px 0;
}

.features {
  --animation-play-state: running;
}

.features.is-paused {
  --animation-play-state: paused;
}

.platforms h2 {
  font: var(--md-sys-typescale-display-medium);
  letter-spacing: var(--md-sys-typescale-display-medium-tracking);
}

.platforms header > p:last-child {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-large);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}

.features__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.features__card {
  position: relative;
  isolation: isolate;
  display: flex;
  grid-column: span 2;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
  gap: 20px;
  padding: 28px;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  -webkit-backdrop-filter: var(--glass-filter);
  backdrop-filter: var(--glass-filter);
  box-shadow: var(--glass-shadow);
}

.features__card--1,
.features__card--2 {
  grid-column: span 3;
  min-height: 395px;
}

.features__card--1 {
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 52%, transparent);
  color: var(--md-sys-color-on-primary-container);
  border-radius: 28px 72px 28px 28px;
}

.features__card--2 {
  padding: 14px;
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  border-radius: 28px 28px 72px 28px;
}

.features__card--3 {
  grid-column: span 2;
}

.features__card--1,
.features__card--3,
.features__card--4,
.features__card--5 {
  justify-content: flex-start;
}

.features__card--6 {
  display: grid;
  grid-column: span 6;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  min-height: 180px;
  align-items: center;
  column-gap: 40px;
}

.features__card--6 .features__copy {
  grid-column: 2;
  grid-row: 1 / span 2;
}

.features__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.features__controls li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg-strong);
  font: var(--md-sys-typescale-label-large);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
}

.features__controls strong {
  color: var(--md-sys-color-primary);
  font-variant-numeric: tabular-nums;
}

.features__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.features__icon {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
}

.features__icon-glyph {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  font-size: 26px;
  line-height: 1;
}

.features__label {
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  font: var(--md-sys-typescale-title-medium);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
}

.features__card h3 {
  margin-bottom: 10px;
  max-width: 20ch;
  font: var(--md-sys-typescale-headline-medium);
  letter-spacing: var(--md-sys-typescale-headline-medium-tracking);
}

.features__card p {
  max-width: 46ch;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
}

.features__card--1 p {
  color: var(--md-sys-color-on-primary-container);
}

.features__card--6 .features__copy {
  max-width: none;
}

.features__card--6 p {
  max-width: 65ch;
}

.features__card--2 .features__top {
  position: absolute;
  top: 28px;
  right: 28px;
  z-index: 3;
}

.features__card--2 .features__copy {
  padding: 4px 14px 12px;
}

.features__card--2 .features__icon,
.features__card--2 .features__label {
  display: none;
}

.lyrics-toggle {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  height: 44px;
  margin-left: auto;
  border: 0;
  border-radius: 50%;
  background: #ffffff1f;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  color: #fff;
  cursor: pointer;
}

.lyrics-toggle:hover {
  background: #ffffff18;
}

.platforms {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.platforms::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: url('/images/platform-pattern.svg') left top / 666px auto repeat;
  content: '';
  pointer-events: none;
}

.platforms__layout {
  display: grid;
  grid-template-columns: minmax(280px, 0.7fr) minmax(0, 1.3fr);
  gap: clamp(56px, 9vw, 130px);
  align-items: start;
}

.platforms header {
  min-width: 0;
  overflow-wrap: anywhere;
}

.platforms header > p:last-child {
  max-width: 520px;
  margin-top: 24px;
}

.platforms__list {
  display: grid;
  gap: 3px;
  border-radius: 16px;
}

.platforms__list button {
  display: grid;
  grid-template-columns: 54px minmax(120px, 1fr);
  gap: 16px;
  align-items: center;
  min-height: 82px;
  padding: 10px 12px;
  border: 0;
  border-radius: 4px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  -webkit-backdrop-filter: var(--glass-filter);
  backdrop-filter: var(--glass-filter);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.platforms__list button:first-child {
  border-radius: 16px 16px 4px 4px;
}

.platforms__list button:last-child {
  border-radius: 4px 4px 16px 16px;
}

.platforms__list button:hover,
.platforms__list button:focus-visible {
  background: var(--glass-bg-strong);
}

.platforms__icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 16px;
  background: var(--glass-bg-strong);
}

.platforms__icon img {
  width: 23px;
  height: 23px;
  object-fit: contain;
}

.platforms__name {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow-wrap: anywhere;
}

.platforms__name strong {
  font: var(--md-sys-typescale-title-medium);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
}

.platforms__name small {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-small);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

@media (max-width: 940px) {
  .features,
  .platforms {
    padding: 72px 0;
  }

  .platforms__layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }

  .features__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .features__card,
  .features__card--1,
  .features__card--2,
  .features__card--3,
  .features__card--6 {
    grid-column: auto;
    min-height: 280px;
  }

  .features__card--6 {
    grid-column: 1 / -1;
    grid-template-columns: 1fr;
    row-gap: 24px;
  }

  .features__card--6 .features__copy {
    grid-column: auto;
    grid-row: auto;
  }
}

@media (max-width: 600px) {
  .features__grid {
    grid-template-columns: 1fr;
  }

  .features__card {
    padding: 24px;
    min-height: 0;
    gap: 28px;
  }

  .features__card--2 {
    min-height: 360px;
  }

  .platforms__list button {
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 12px;
  }
}
</style>
