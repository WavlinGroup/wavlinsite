<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getLatestRelease } from '../content/downloads'
import DownloadDialog from './DownloadDialog.vue'

const repoStats = ref({ stars: '—', version: 'Latest' })
const compactNumber = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

onMounted(async () => {
  const [repoResult, releaseResult] = await Promise.allSettled([
    fetch('https://api.github.com/repos/WavlinGroup/Wavlin').then(response => {
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
      return response.json() as Promise<{ stargazers_count?: number }>
    }),
    getLatestRelease(),
  ])
  if (repoResult.status === 'fulfilled' && repoResult.value.stargazers_count != null) {
    repoStats.value.stars = compactNumber.format(repoResult.value.stargazers_count)
  }
  if (releaseResult.status === 'fulfilled') repoStats.value.version = releaseResult.value.tag_name ?? 'Latest'
})
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="container hero__layout">
      <p class="hero__badge glass">Made for Android</p>
      <h1 id="hero-title">Music <span>without the noise</span></h1>
      <p class="hero__lede">
        A free, open-source YouTube Music player for Android. No ads, no clutter, just your music.
      </p>
      <div class="hero__actions">
        <DownloadDialog button-class="btn btn-filled btn-lg" />
        <a href="https://github.com/WavlinGroup/Wavlin" class="btn btn-outlined btn-lg" target="_blank" rel="noopener noreferrer">
          <span class="material-symbols-rounded" aria-hidden="true">code</span>
          View source
        </a>
      </div>
      <div class="hero__signal glass">
        <p>Ad-free playback, synced lyrics, offline downloads, and Listen Together on your phone.</p>
        <dl class="hero__stats" aria-label="Wavlin repository statistics">
          <div><dt>License</dt><dd>GPL-3.0</dd></div>
          <div><dt>Stars</dt><dd>{{ repoStats.stars }}</dd></div>
          <div><dt>Latest</dt><dd>{{ repoStats.version }}</dd></div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: clamp(56px, 9vw, 120px) 0 clamp(64px, 8vw, 110px);
}

.hero__layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  padding: 8px 18px;
  border-radius: var(--md-sys-shape-corner-full);
  color: var(--md-sys-color-primary);
  font: var(--md-sys-typescale-label-large);
  font-variation-settings: 'ROND' 100;
}

.hero h1 {
  max-width: 980px;
  margin: 0 0 26px;
  font: var(--md-sys-typescale-display-large);
  letter-spacing: var(--md-sys-typescale-display-large-tracking);
}

.hero h1 span {
  color: var(--md-sys-color-primary);
  text-shadow: 0 0 48px color-mix(in srgb, var(--md-sys-color-primary) 55%, transparent);
}

.hero__lede {
  max-width: 640px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-large);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 34px;
}

.hero__signal {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) auto;
  align-items: center;
  gap: 24px 48px;
  width: min(100%, 860px);
  margin-top: clamp(40px, 6vw, 72px);
  padding: 22px 30px;
  border-radius: 32px;
  text-align: left;
}

.hero__signal p {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
}

.hero__stats {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 10px 32px;
}

.hero__stats div {
  min-width: 0;
}

.hero__stats dt {
  margin-bottom: 3px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-small);
  font-variation-settings: 'ROND' 100;
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
}

.hero__stats dd {
  min-height: 20px;
  font: var(--md-sys-typescale-title-medium);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 760px) {
  .hero__signal {
    grid-template-columns: 1fr;
    padding: 22px 24px;
    border-radius: 26px;
  }

  .hero__stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: clamp(2.75rem, 12vw, 4.5rem);
  }

  .hero__actions,
  .hero__actions :deep(.btn),
  .hero__actions > .btn {
    width: 100%;
  }
}
</style>
