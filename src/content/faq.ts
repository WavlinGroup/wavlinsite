import { HOSTING_NOTICE } from './site'

export const FAQ_TOPICS = [
  { id: 'installation', title: 'Installation & updates' },
  { id: 'library', title: 'Library & playback' },
  { id: 'privacy', title: 'Privacy & licensing' },
] as const

export type FaqItem = {
  topic: typeof FAQ_TOPICS[number]['id']
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    topic: 'installation',
    question: 'Which platforms does Wavlin run on?',
    answer: 'Wavlin is an Android app and works on Android 8 and newer. Open the download window to get the APK.',
  },
  {
    topic: 'library',
    question: 'Can I sign in with my YouTube Music account?',
    answer: 'Yes. Sign in if you want your playlists, liked songs, albums, and artists synced. Prefer not to? You can listen without signing in or paying for YouTube Music Premium. Audio quality still depends on the streams YouTube makes available to your account.',
  },
  {
    topic: 'privacy',
    question: 'Is Wavlin safe to use?',
    answer: 'Wavlin is open source under GPL-3.0, so anyone can read the code. That said, using a third-party client may go against YouTube’s Terms of Service. We haven’t heard of any bans or restrictions, but that does not guarantee your account is completely safe. Use Wavlin at your own risk.',
  },
  {
    topic: 'privacy',
    question: 'Does Wavlin host or pirate music?',
    answer: `No. ${HOSTING_NOTICE}`,
  },
  {
    topic: 'installation',
    question: 'How do I update Wavlin?',
    answer: 'Grab the newest release from GitHub Releases and install it over your current copy.',
  },
  {
    topic: 'installation',
    question: 'Why isn’t Wavlin on the Play Store?',
    answer: 'Google doesn’t allow third-party YouTube clients on the Play Store, so any “Wavlin” app you find there is an unofficial copy uploaded by someone else. If you installed one, back up anything you want to keep, uninstall it, report the listing, and download the real build from this site.',
  },
  {
    topic: 'library',
    question: 'Can I share a playlist with a friend?',
    answer: 'Yes. Use the share option on a playlist in Wavlin to get a link. Anyone who opens it sees the playlist and can open it straight in their Wavlin app.',
  },
  {
    topic: 'library',
    question: 'Can I listen offline?',
    answer: 'Yes. Download songs or playlists while you’re online, wait for them to finish, and you can play them without an internet connection.',
  },
]
