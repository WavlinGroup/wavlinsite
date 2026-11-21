<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DownloadDialog from '../components/DownloadDialog.vue'
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
import { REPO_URL } from '../content/site'
import { musicAppUrl, musicShareFromUrl } from '../content/share'

const RELEASES_URL = `${REPO_URL}/releases`

const route = useRoute()
// Static shells have no query or path ID, so read the shared link after hydration.
const hydrated = ref(false)
onMounted(() => { hydrated.value = true })
const share = computed(() => hydrated.value ? musicShareFromUrl(route.fullPath) : null)
const appUrl = computed(() => share.value ? musicAppUrl(share.value) : '')
const sharedPlaylist = computed(() => share.value?.shared ?? null)
const heading = computed(() => sharedPlaylist.value?.name || (sharedPlaylist.value ? 'Shared playlist' : 'Shared music'))
const subtitle = computed(() => {
  const shared = sharedPlaylist.value
  if (!shared) return 'Open this in Wavlin, or play it on YouTube Music instead.'
  if (shared.trackCount > 0) return `${shared.trackCount} ${shared.trackCount === 1 ? 'track' : 'tracks'} · tap to open in Wavlin`
  return 'Tap to open this playlist in Wavlin.'
})
// Android opens the app through an intent URL so the browser can fall back to the release page.
const openHref = computed(() => {
  const shared = sharedPlaylist.value
  if (!shared || !/android/i.test(navigator.userAgent)) return appUrl.value
  const fallback = encodeURIComponent(RELEASES_URL)
  return `intent://${shared.route}?${shared.query}#Intent;scheme=wavlin;package=com.wavlin.music;S.browser_fallback_url=${fallback};end`
})
onMounted(() => {
  if (sharedPlaylist.value && /android/i.test(navigator.userAgent)) setTimeout(() => { location.href = openHref.value }, 400)
})
</script>

<template>
  <NavBar />
  <main id="main" class="share-page">
    <section class="container share-page__inner" aria-labelledby="share-title">
      <h1 id="share-title">{{ hydrated ? heading : 'Shared music' }}</h1>
      <p>{{ hydrated ? subtitle : 'Open this in Wavlin, or play it on YouTube Music instead.' }}</p>

      <div v-if="!hydrated" class="share-page__loading" role="status" aria-label="Loading shared link">
        <span></span><span></span>
      </div>
      <div v-else-if="share" class="share-page__link">
        <p v-if="share.youtubeUrl" class="share-page__url">{{ share.youtubeUrl }}</p>
        <div class="share-page__actions">
          <a :href="openHref" class="btn btn-filled btn-lg">Open in Wavlin</a>
          <a v-if="share.youtubeUrl" :href="share.youtubeUrl" class="btn btn-outlined btn-lg" rel="noreferrer">Open in YouTube Music</a>
        </div>
        <p>If your browser won’t open Wavlin, grab the app below.</p>
      </div>
      <p v-else class="share-page__error" role="status">This link does not contain a valid song, playlist, album, or artist. Ask whoever sent it to share it again.</p>
      <noscript>Turn on JavaScript to open this link automatically, or paste it straight into Wavlin.</noscript>

      <div class="share-page__install">
        <h2>Don’t have Wavlin?</h2>
        <p>Free for Android.</p>
        <DownloadDialog label="Download Wavlin" button-class="btn btn-tonal btn-lg" />
      </div>
    </section>
  </main>
  <FooterSection />
</template>

<style scoped>
.share-page {
  min-height: 70vh;
  padding: clamp(48px, 9vw, 112px) 0 80px;
}

.share-page__inner {
  max-width: 900px;
}

.share-page h1 {
  margin-bottom: 20px;
  font: var(--md-sys-typescale-display-large);
  letter-spacing: var(--md-sys-typescale-display-large-tracking);
}

.share-page p {
  max-width: 68ch;
  color: var(--md-sys-color-on-surface-variant);
}

.share-page__link,
.share-page__error,
.share-page__loading {
  margin-top: 36px;
}

.share-page__url {
  overflow-wrap: anywhere;
  user-select: text;
}

.share-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}

.share-page__loading span {
  display: block;
  width: min(100%, 480px);
  height: 24px;
  margin-bottom: 20px;
  background: var(--md-sys-color-surface-container-high);
}

.share-page__loading span + span {
  height: 56px;
}

.share-page__install {
  margin-top: 56px;
  padding-top: 28px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.share-page h2 {
  font: var(--md-sys-typescale-headline-small);
  letter-spacing: var(--md-sys-typescale-headline-small-tracking);
}

.share-page__install p {
  margin: 12px 0 24px;
}
</style>
