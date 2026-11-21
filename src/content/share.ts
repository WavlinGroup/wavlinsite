import { SITE_URL } from './site'

export const SHARE_ID_PATHS = ['/browse', '/channel', '/album', '/artist'] as const
export const SHARE_PATHS = ['/watch', '/playlist', '/shared', ...SHARE_ID_PATHS, '/open'] as const

export type MusicShare = {
  kind: 'song' | 'playlist' | 'album' | 'artist' | 'shared'
  id: string
  /** Null for a shared track list that has no YouTube Music playlist behind it. */
  youtubeUrl: string | null
  /** Wavlin shared-playlist fields, present only when kind is 'shared'. */
  shared?: { name: string; trackCount: number; query: string; route: 'playlist' | 'shared' }
}

const MAX_SHARED_TRACKS = 1000
const SHARED_NAME_MAX = 200
const VIDEO_ID = /^[A-Za-z0-9_-]{1,64}$/

// Wavlin playlist links: /shared?name=..&ids=a,b,c or /playlist?list=..&name=..
function sharedPlaylist(url: URL): MusicShare | null {
  const once = (key: string) => {
    const all = url.searchParams.getAll(key)
    return all.length === 1 ? all[0]! : all.length === 0 ? null : undefined
  }
  const list = once('list')
  const ids = once('ids')
  const name = once('name')
  if (list === undefined || ids === undefined || name === undefined) return null
  if (name !== null && (name.length > SHARED_NAME_MAX || /[\u0000-\u001f\u007f]/.test(name))) return null
  const cleanName = name ?? ''
  if (list) {
    if (!/^[A-Za-z0-9_-]{1,256}$/.test(list)) return null
    return {
      kind: 'shared', id: list, youtubeUrl: `https://music.youtube.com/playlist?list=${list}`,
      shared: { name: cleanName, trackCount: 0, query: `list=${encodeURIComponent(list)}`, route: 'playlist' },
    }
  }
  if (!ids) return null
  const tracks = ids.split(',').filter(Boolean)
  if (tracks.length === 0 || tracks.length > MAX_SHARED_TRACKS || !tracks.every(id => VIDEO_ID.test(id))) return null
  return {
    kind: 'shared', id: tracks[0]!, youtubeUrl: null,
    shared: { name: cleanName, trackCount: tracks.length, query: `name=${encodeURIComponent(cleanName)}&ids=${encodeURIComponent(tracks.join(','))}`, route: 'shared' },
  }
}

export function musicShareFromUrl(value: string, depth = 0): MusicShare | null {
  if (value.length > 4096 || depth > 3) return null
  let url: URL
  try {
    url = new URL(value, SITE_URL)
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase()
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null
  const wavlin = host === 'wavlin.cc' || host.endsWith('.wavlin.cc') || host === 'localhost' || host === '127.0.0.1'
  if (!wavlin && !['music.youtube.com', 'youtube.com', 'www.youtube.com', 'youtu.be'].includes(host)) return null

  const singleParam = (name: string) => url.searchParams.getAll(name).length === 1 ? url.searchParams.get(name) : null
  if (wavlin && url.pathname === '/open') {
    const target = singleParam('url')
    return target ? musicShareFromUrl(target, depth + 1) : null
  }

  const path = url.pathname.replace(/\/$/, '')
  if (wavlin && (path === '/shared' || (path === '/playlist' && url.searchParams.has('ids')))) return sharedPlaylist(url)

  let kind: MusicShare['kind']
  let id: string | null
  if (host === 'youtu.be') {
    kind = 'song'
    id = path.slice(1)
  } else if (path === '/watch') {
    kind = 'song'
    id = singleParam('v')
  } else if (path === '/playlist') {
    kind = 'playlist'
    id = singleParam('list')
  } else {
    const match = /^\/(browse|album|channel|artist)\/([^/]+)$/.exec(path)
    if (!match) return null
    kind = match[1] === 'browse' || match[1] === 'album' ? 'album' : 'artist'
    id = match[2]!
  }
  if (!id || !/^[A-Za-z0-9_-]{1,256}$/.test(id)) return null

  const target = kind === 'song' ? `/watch?v=${id}` : kind === 'playlist' ? `/playlist?list=${id}` : kind === 'album' ? `/browse/${id}` : `/channel/${id}`
  return { kind, id, youtubeUrl: `https://music.youtube.com${target}` }
}

export function musicAppUrl(share: MusicShare): string {
  if (share.shared) return `wavlin://${share.shared.route}?${share.shared.query}`
  if (share.kind === 'song') return `wavlin://watch?v=${share.id}`
  if (share.kind === 'playlist') {
    // Android app parses YouTube's list parameter.
    return `wavlin://playlist?list=${share.id}`
  }
  return `wavlin://${share.kind}/${share.id}`
}
