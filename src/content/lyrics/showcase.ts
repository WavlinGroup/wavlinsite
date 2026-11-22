import { parseLrc } from './import'
import { lineText } from './model'

// Lyrics are never bundled: they are fetched from LRCLIB at runtime and only kept in memory.
export const SHOWCASE_TRACK = { title: 'Always', artist: 'Daniel Caesar', durationSec: 222 } as const
export const LRCLIB_SEARCH_URL = 'https://lrclib.net/api/search'
const TAIL_MS = 4000

export type TimedLine = { startMs: number; text: string }
export type LrclibHit = { trackName?: string; artistName?: string; duration?: number; syncedLyrics?: string | null }

export function toTimedLines(lrc: string): TimedLine[] {
  return parseLrc(lrc).lines
    .flatMap(line => line.startMs === undefined || line.background ? [] : [{ startMs: line.startMs, text: lineText(line) }])
    .filter(line => line.text.length > 0)
    .sort((a, b) => a.startMs - b.startMs)
}

/** Index of the line being sung at `timeMs`, or -1 before the first line. */
export function activeIndex(lines: readonly TimedLine[], timeMs: number): number {
  let low = 0
  let high = lines.length - 1
  let found = -1
  while (low <= high) {
    const mid = (low + high) >> 1
    if (lines[mid]!.startMs <= timeMs) { found = mid; low = mid + 1 } else high = mid - 1
  }
  return found
}

export function loopLengthMs(lines: readonly TimedLine[]): number {
  return lines.length ? lines[lines.length - 1]!.startMs + TAIL_MS : 0
}

/** Best synced hit: same artist, title starting with the track, duration closest to the target. */
export function pickHit(hits: readonly LrclibHit[], track = SHOWCASE_TRACK): LrclibHit | undefined {
  const norm = (value = '') => value.trim().toLowerCase()
  return hits
    .filter(hit => hit.syncedLyrics && norm(hit.artistName).includes(norm(track.artist)) && norm(hit.trackName).startsWith(norm(track.title)))
    .sort((a, b) => Math.abs((a.duration ?? Infinity) - track.durationSec) - Math.abs((b.duration ?? Infinity) - track.durationSec))[0]
}

export async function fetchShowcaseLines(fetcher: typeof fetch = fetch, signal?: AbortSignal): Promise<TimedLine[]> {
  const query = new URLSearchParams({ track_name: SHOWCASE_TRACK.title, artist_name: SHOWCASE_TRACK.artist })
  const response = await fetcher(`${LRCLIB_SEARCH_URL}?${query}`, { signal })
  if (!response.ok) throw new Error(`LRCLIB returned ${response.status}`)
  const hit = pickHit((await response.json()) as LrclibHit[])
  const lines = hit?.syncedLyrics ? toTimedLines(hit.syncedLyrics) : []
  if (!lines.length) throw new Error('No synced lyrics found')
  return lines
}
