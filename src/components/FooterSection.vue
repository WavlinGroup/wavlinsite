<script setup lang="ts">
import { HOSTING_NOTICE } from '../content/site'

const links = [
  { label: 'Source', href: 'https://github.com/WavlinGroup/Wavlin' },
  { label: 'Releases', href: 'https://github.com/WavlinGroup/Wavlin/releases' },
  { label: 'Issues', href: 'https://github.com/WavlinGroup/Wavlin/issues' },
  { label: 'Lyrics sync', href: '/sync' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'GPL-3.0', href: 'https://github.com/WavlinGroup/Wavlin/blob/main/LICENSE' },
]
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <RouterLink to="/" class="footer__brand" aria-label="Wavlin home">
          <img src="/logo.svg" alt="" width="50" height="50" loading="lazy" />
          <strong>Wavlin</strong>
        </RouterLink>
      </div>

      <nav class="footer__links" aria-label="Footer">
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.href"
          :target="link.href.startsWith('http') ? '_blank' : undefined"
          :rel="link.href.startsWith('http') ? 'noopener noreferrer' : undefined"
        >
          {{ link.label }}
          <span v-if="link.href.startsWith('http')" class="material-symbols-rounded" aria-hidden="true">arrow_outward</span>
        </a>
      </nav>

      <div class="footer__bottom">
        <p>{{ HOSTING_NOTICE }}</p>
        <p>Wavlin is an independent open-source project and isn’t affiliated with Google LLC. YouTube and YouTube Music are trademarks of Google LLC.</p>
        <p>Wavlin is a fork of <a href="https://github.com/MetrolistGroup/Metrolist" target="_blank" rel="noopener noreferrer">Metrolist</a>, created by Mo Agamy and contributors. This website is adapted from the Metrolist website by <a href="https://nyx.meowery.eu" target="_blank" rel="noopener noreferrer">Nyx</a>.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 66px 0 38px;
  border-top: 1px solid var(--glass-border);
  border-radius: 44px 44px 0 0;
  background: color-mix(in srgb, #ffffff 5%, transparent);
  -webkit-backdrop-filter: var(--glass-filter);
  backdrop-filter: var(--glass-filter);
}

.footer__top {
  display: flex;
  align-items: center;
  padding-bottom: 34px;
}

.footer__brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-title-large);
  letter-spacing: var(--md-sys-typescale-title-large-tracking);
  text-decoration: none;
}

.footer__brand img {
  width: 50px;
  height: 50px;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 24px 0;
}

.footer__links a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 9px 16px;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--glass-bg-strong);
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-large);
  font-variation-settings: 'ROND' 100;
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  text-decoration: none;
}

.footer__links a:hover {
  background: var(--md-sys-color-surface-container-highest);
}

.footer__links .material-symbols-rounded {
  font-size: 18px;
}

.footer__bottom {
  display: flex;
  justify-content: space-between;
  gap: 30px 60px;
  padding-top: 28px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-small);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

.footer__bottom p {
  max-width: 620px;
}

.footer__bottom a {
  color: var(--md-sys-color-primary);
}

@media (max-width: 680px) {
  .footer {
    border-radius: 32px 32px 0 0;
  }

  .footer__bottom {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
