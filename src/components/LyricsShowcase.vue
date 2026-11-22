<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { activeIndex, fetchShowcaseLines, loopWindow, SHOWCASE_TRACK, type TimedLine } from '../content/lyrics/showcase'

const props = defineProps<{ paused?: boolean }>()

const WINDOW = 2
const TICK_MS = 100
const lines = ref<TimedLine[]>([])
const status = ref<'loading' | 'ready' | 'error'>('loading')
const timeMs = ref(0)
const visible = ref(false)
const root = ref<HTMLElement>()
let timer: number | undefined
let observer: IntersectionObserver | undefined
let abort: AbortController | undefined
let reducedMotion = false

const loop = computed(() => loopWindow(lines.value))
const current = computed(() => activeIndex(lines.value, timeMs.value))
const focus = computed(() => Math.max(current.value, 0))
const rows = computed(() => lines.value
  .map((line, index) => ({ ...line, index, distance: index - focus.value }))
  .filter(row => Math.abs(row.distance) <= WINDOW && row.startMs >= loop.value.startMs && row.startMs < loop.value.endMs))
const trackMs = SHOWCASE_TRACK.durationSec * 1000
const progress = computed(() => Math.min(100, (timeMs.value / trackMs) * 100))
const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`

function sync() {
  const shouldRun = status.value === 'ready' && visible.value && !props.paused && !reducedMotion
  if (shouldRun && timer === undefined) {
    timer = window.setInterval(() => {
      const next = timeMs.value + TICK_MS
      timeMs.value = next >= loop.value.endMs ? loop.value.startMs : next
    }, TICK_MS)
  } else if (!shouldRun && timer !== undefined) {
    window.clearInterval(timer)
    timer = undefined
  }
}

watch(() => [props.paused, visible.value, status.value], sync)

onMounted(async () => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  observer = new IntersectionObserver(([entry]) => { visible.value = !!entry?.isIntersecting })
  if (root.value) observer.observe(root.value)
  abort = new AbortController()
  try {
    lines.value = await fetchShowcaseLines(fetch, abort.signal)
    timeMs.value = loop.value.startMs
    status.value = 'ready'
  } catch (error) {
    if (!abort.signal.aborted) status.value = 'error'
  }
})

onBeforeUnmount(() => {
  abort?.abort()
  observer?.disconnect()
  if (timer !== undefined) window.clearInterval(timer)
})
</script>

<template>
  <figure ref="root" class="showcase" :aria-label="`${SHOWCASE_TRACK.title} by ${SHOWCASE_TRACK.artist}, synced lyrics preview`">
    <div class="showcase__glow" aria-hidden="true"><i /><i /><i /></div>

    <div class="showcase__stage" aria-hidden="true">
      <TransitionGroup v-if="status === 'ready'" name="lyric" tag="ol" class="showcase__lines">
        <li v-for="row in rows" :key="row.index" class="showcase__line" :class="{ 'is-active': row.distance === 0 && current >= 0 }" :style="{ '--d': Math.abs(row.distance) }">{{ row.text }}</li>
      </TransitionGroup>
      <ol v-else class="showcase__lines showcase__lines--idle">
        <li v-for="n in 5" :key="n" class="showcase__skeleton" :class="{ 'is-active': n === 3 }" :style="{ '--d': Math.abs(n - 3), width: `${[62, 78, 70, 84, 58][n - 1]}%` }" />
        <li v-if="status === 'error'" class="showcase__note">Synced lyrics couldn’t be loaded right now.</li>
      </ol>
    </div>

    <figcaption class="showcase__player">
      <span class="showcase__art" aria-hidden="true" />
      <span class="showcase__meta"><strong>{{ SHOWCASE_TRACK.title }}</strong><small>{{ SHOWCASE_TRACK.artist }}</small></span>
      <span class="showcase__bars" aria-hidden="true" :class="{ 'is-paused': paused || status !== 'ready' }"><i /><i /><i /><i /></span>
      <span class="showcase__bar" aria-hidden="true"><b :style="{ width: `${progress}%` }" /></span>
      <span class="showcase__time" aria-hidden="true"><span>{{ clock(timeMs) }}</span><span>{{ clock(trackMs) }}</span></span>
    </figcaption>
  </figure>
</template>

<style scoped>
.showcase {
  --blue-hi: #1d3fc4;
  --blue-mid: #0d1670;
  --blue-lo: #06061c;
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: 330px;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #8fb0ff33;
  border-radius: 28px;
  background: linear-gradient(180deg, var(--blue-hi) 0%, var(--blue-mid) 42%, var(--blue-lo) 100%);
  box-shadow: inset 0 1px 0 #ffffff2e, 0 18px 60px -18px #1d3fc499;
}

.showcase__glow {
  position: absolute;
  inset: 0;
  z-index: -1;
  filter: blur(46px);
  opacity: 0.85;
  pointer-events: none;
}

.showcase__glow i {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #5b8cff 0%, transparent 70%);
  animation: drift 14s ease-in-out infinite alternate;
  animation-play-state: var(--animation-play-state, running);
}

.showcase__glow i:nth-child(1) { top: -20%; left: -10%; width: 70%; aspect-ratio: 1; }
.showcase__glow i:nth-child(2) { right: -25%; bottom: 10%; width: 60%; aspect-ratio: 1; background: radial-gradient(circle, #7a4dff 0%, transparent 70%); animation-delay: -5s; }
.showcase__glow i:nth-child(3) { bottom: -30%; left: 10%; width: 50%; aspect-ratio: 1; background: radial-gradient(circle, #2a6bff 0%, transparent 70%); animation-delay: -9s; }

.showcase__stage {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 18px 22px 6px;
  overflow: hidden;
  container-type: inline-size;
  mask: linear-gradient(180deg, transparent 0, #000 16%, #000 84%, transparent 100%);
}

.showcase__lines {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  gap: 0.55em;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: clamp(1.1rem, 6.2cqw, 1.9rem);
  font-weight: 760;
  font-variation-settings: 'ROND' 100;
  letter-spacing: -0.02em;
  line-height: 1.18;
}

.showcase__line {
  color: #cfdcff;
  opacity: calc(0.62 - var(--d) * 0.24);
  filter: blur(calc(var(--d) * 1.1px));
  transform-origin: left center;
  transition: opacity 0.5s var(--md-sys-motion-standard), filter 0.5s var(--md-sys-motion-standard), color 0.4s, transform 0.5s var(--md-sys-motion-standard), text-shadow 0.5s;
}

.showcase__line.is-active {
  color: #fff;
  opacity: 1;
  filter: none;
  transform: scale(1.03);
  text-shadow: 0 0 14px #c9d9ffd9, 0 0 36px #6f9bffcc, 0 0 70px #3d6bff99;
}

.lyric-move,
.lyric-enter-active,
.lyric-leave-active {
  transition: transform 0.55s var(--md-sys-motion-standard), opacity 0.45s var(--md-sys-motion-standard);
}

.lyric-enter-from { opacity: 0; transform: translateY(1.2em); }
.lyric-leave-to { opacity: 0; transform: translateY(-1.2em); }
.lyric-leave-active { position: absolute; inset-inline: 22px; }

.showcase__skeleton {
  height: 0.9em;
  border-radius: 999px;
  background: #cfdcff;
  opacity: calc(0.22 - var(--d) * 0.05);
  filter: blur(2px);
}

.showcase__skeleton.is-active { opacity: 0.5; box-shadow: 0 0 30px #6f9bff; }
.showcase__note { font: var(--md-sys-typescale-body-medium); color: #cfdcffb0; text-shadow: none; }

.showcase__player {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  gap: 4px 14px;
  align-items: center;
  padding: 14px 18px 16px;
  border-top: 1px solid #ffffff1a;
  background: #05051866;
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  backdrop-filter: blur(18px) saturate(1.4);
}

.showcase__art {
  grid-row: 1;
  width: 52px;
  height: 52px;
  border-radius: 10px;
  background: radial-gradient(circle at 40% 45%, #bcd0ff 0 8%, transparent 9%), linear-gradient(160deg, #3b63e8, #0a0f55);
  box-shadow: 0 0 22px #3d6bff80;
}

.showcase__meta { display: flex; min-width: 0; flex-direction: column; }
.showcase__meta strong { overflow: hidden; font: var(--md-sys-typescale-title-medium); text-overflow: ellipsis; white-space: nowrap; color: #fff; }
.showcase__meta small { color: #cfdcffb8; font: var(--md-sys-typescale-body-small); }

.showcase__bars { display: flex; align-items: flex-end; gap: 3px; height: 20px; }
.showcase__bars i { width: 3px; height: 100%; border-radius: 2px; background: #cfdcff; transform-origin: bottom; animation: eq 0.9s ease-in-out infinite alternate; }
.showcase__bars i:nth-child(2) { animation-delay: -0.3s; }
.showcase__bars i:nth-child(3) { animation-delay: -0.6s; }
.showcase__bars i:nth-child(4) { animation-delay: -0.15s; }
.showcase__bars.is-paused i { animation-play-state: paused; }

.showcase__bar { grid-column: 1 / -1; height: 4px; overflow: hidden; border-radius: 2px; background: #ffffff2e; }
.showcase__bar b { display: block; height: 100%; border-radius: inherit; background: #fff; box-shadow: 0 0 10px #fff; }
.showcase__time { grid-column: 1 / -1; display: flex; justify-content: space-between; color: #cfdcffb8; font: var(--md-sys-typescale-label-small); font-variant-numeric: tabular-nums; letter-spacing: 0.02em; }

@keyframes eq { from { transform: scaleY(0.25); } to { transform: scaleY(1); } }
@keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(8%, 6%) scale(1.15); } }

@media (prefers-reduced-motion: reduce) {
  .showcase__glow i,
  .showcase__bars i { animation: none; }
  .lyric-move,
  .lyric-enter-active,
  .lyric-leave-active,
  .showcase__line { transition: none; }
}

@media (forced-colors: active) {
  .showcase__line.is-active { color: CanvasText; text-shadow: none; }
}
</style>
