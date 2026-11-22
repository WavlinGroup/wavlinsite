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
    answer: 'Right now Wavlin runs on Android 8 and newer. Open the download window to grab the APK.',
  },
  {
    topic: 'library',
    question: 'Can I sign in with my YouTube Music account?',
    answer: 'Yes, and it’s optional. Signing in brings over your playlists, liked songs, albums, and artists. You can also listen without signing in or paying for YouTube Music Premium. Sound quality still depends on which streams YouTube offers your account.',
  },
  {
    topic: 'privacy',
    question: 'Is Wavlin safe to use?',
    answer: 'Anyone can read Wavlin’s code because it’s open source under GPL-3.0. Still, third-party YouTube clients may conflict with YouTube’s Terms of Service. We haven’t heard of bans or restrictions, but that does not guarantee your account is safe, so use Wavlin at your own risk.',
  },
  {
    topic: 'privacy',
    question: 'Does Wavlin host or pirate music?',
    answer: `No. ${HOSTING_NOTICE}`,
  },
  {
    topic: 'installation',
    question: 'How do I update Wavlin?',
    answer: 'Download the latest release from GitHub Releases and install it on top of your current version.',
  },
  {
    topic: 'installation',
    question: 'Why isn’t Wavlin on the Play Store?',
    answer: 'Google doesn’t allow third-party YouTube clients on the Play Store, so any listing named “Wavlin” there is an unofficial copy. If you installed one, back up what you need, uninstall it, report the listing, and get the real build from this site.',
  },
  {
    topic: 'library',
    question: 'Can I share a playlist with a friend?',
    answer: 'Yes. Tap share on any playlist in Wavlin to get a link. Whoever opens it can preview the playlist and open it directly in their Wavlin app.',
  },
  {
    topic: 'library',
    question: 'Can I listen offline?',
    answer: 'Yes. Download songs or playlists while you’re connected, let them finish, and they’ll play with no internet.',
  },
]
