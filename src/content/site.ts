// Temporary Cloudflare Workers URL; switch back to https://wavlin.cc (and index.html, robots.txt) once that domain is owned.
export const SITE_URL = 'https://wavlinsite.dvaustria741.workers.dev'
export const REPO_URL = 'https://github.com/WavlinGroup/Wavlin'

// Shown in the footer, FAQ, and llms.txt; written for takedown reviewers as much as users.
export const HOSTING_NOTICE = 'Wavlin does not host, upload, or distribute any music, videos, or other media. It plays streams directly from YouTube Music, just like the official website. It does not bypass DRM, and Premium-only features like higher audio quality still require your own YouTube Music Premium subscription.'

// Large image previews and full snippets let search results show screenshots and complete answers.
const INDEX = 'index, follow, max-image-preview:large, max-snippet:-1'

export type PageMeta = {
  title: string
  description: string
  robots: string
}

export const PAGE_META = {
  home: {
    title: 'Wavlin · Music without the noise',
    description: 'A free, open-source YouTube Music player for Android. No ads, background play, synced lyrics, offline downloads, and casting.',
    robots: INDEX,
  },
  faq: {
    title: 'Wavlin FAQ · Install, sign in, update, and import playlists',
    description: 'Straight answers on installing Wavlin, signing in with YouTube Music, sharing playlists, updating, and staying safe.',
    robots: INDEX,
  },
  listen: {
    title: 'Listen Together · Wavlin',
    description: 'Join a Wavlin listening room and stay in sync with friends.',
    robots: 'noindex, follow',
  },
  share: {
    title: 'Shared music · Wavlin',
    description: 'Open this shared song, playlist, album, or artist in Wavlin.',
    robots: 'noindex, follow',
  },
  sync: {
    title: 'Lyrics sync · Wavlin',
    description: 'Time lyrics line by line or word by word right in your browser, then export to MLX, LRC, Enhanced LRC, or TTML.',
    robots: INDEX,
  },
  privacy: {
    title: 'Privacy policy · Wavlin',
    description: 'What Wavlin keeps on your device and what the website sends. Draft, pending review.',
    robots: INDEX,
  },
  notFound: {
    title: 'Page not found · Wavlin',
    description: 'We couldn’t find that Wavlin page.',
    robots: 'noindex, nofollow',
  },
} satisfies Record<string, PageMeta>
