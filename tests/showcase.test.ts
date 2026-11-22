import { expect, test } from 'bun:test'
import { activeIndex, fetchShowcaseLines, loopLengthMs, loopWindow, pickHit, toTimedLines } from '../src/content/lyrics/showcase'

const LRC = '[00:01.00] alpha\n[00:03.50] beta\n[00:06.00] \n[00:08.00] gamma'

test('parses, drops empty lines and sorts', () => {
  expect(toTimedLines(LRC)).toEqual([{ startMs: 1000, text: 'alpha' }, { startMs: 3500, text: 'beta' }, { startMs: 8000, text: 'gamma' }])
})

test('activeIndex is -1 before the first line and tracks time', () => {
  const lines = toTimedLines(LRC)
  expect(activeIndex(lines, 0)).toBe(-1)
  expect(activeIndex(lines, 1000)).toBe(0)
  expect(activeIndex(lines, 7999)).toBe(1)
  expect(activeIndex(lines, 99999)).toBe(2)
  expect(loopLengthMs(lines)).toBe(12000)
  expect(loopLengthMs([])).toBe(0)
})

test('pickHit filters by artist and title, prefers closest duration', () => {
  const hits = [
    { trackName: 'Always', artistName: 'Someone Else', duration: 222, syncedLyrics: '[00:01.00] x' },
    { trackName: 'Always (Bonus)', artistName: 'Daniel Caesar', duration: 300, syncedLyrics: '[00:01.00] x' },
    { trackName: 'Always (Bonus)', artistName: 'Daniel Caesar', duration: 223, syncedLyrics: '[00:01.00] y' },
    { trackName: 'Always', artistName: 'Daniel Caesar', duration: 222, syncedLyrics: null },
  ]
  expect(pickHit(hits)?.syncedLyrics).toBe('[00:01.00] y')
  expect(pickHit([])).toBeUndefined()
})

test('fetchShowcaseLines rejects on http errors and empty results', async () => {
  const fail = (async () => new Response('', { status: 500 })) as unknown as typeof fetch
  const empty = (async () => Response.json([])) as unknown as typeof fetch
  const ok = (async () => Response.json([{ trackName: 'Always', artistName: 'Daniel Caesar', duration: 222, syncedLyrics: LRC }])) as unknown as typeof fetch
  await expect(fetchShowcaseLines(fail)).rejects.toThrow()
  await expect(fetchShowcaseLines(empty)).rejects.toThrow()
  expect((await fetchShowcaseLines(ok)).length).toBe(3)
})

test('loopWindow spans the lines sung at the two timestamps', () => {
  const lines = toTimedLines(LRC)
  expect(loopWindow(lines, 4000, 4000)).toEqual({ startMs: 3500, endMs: 8000 })
  expect(loopWindow(lines, 0, 9000)).toEqual({ startMs: 1000, endMs: 12000 })
  expect(loopWindow(lines)).toEqual({ startMs: 1000, endMs: 12000 })
  expect(loopWindow([])).toEqual({ startMs: 0, endMs: 0 })
})
