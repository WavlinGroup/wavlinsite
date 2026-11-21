import { expect, test } from 'bun:test'
import { DOWNLOAD_PLATFORMS, findDownloadAsset, type ReleaseAsset } from '../src/content/downloads'
import { homeMarkdown } from '../scripts/markdown'

const assets: ReleaseAsset[] = [
  { name: 'Wavlin.apk', browser_download_url: 'android-normal' },
  { name: 'Wavlin-with-Google-Cast.apk', browser_download_url: 'android-cast' },
  { name: 'Wavlin.apk.sha256', browser_download_url: 'checksum' },
]

test('matches the Android APK and prefers the plain build', () => {
  expect(findDownloadAsset('android', 'universal', assets)?.browser_download_url).toBe('android-normal')
  expect(findDownloadAsset('android', 'universal', assets.slice(1, 2))?.browser_download_url).toBe('android-cast')
})

test('rejects missing builds, checksums, and unsupported architectures', () => {
  for (const platform of DOWNLOAD_PLATFORMS) {
    for (const architecture of platform.architectures) {
      expect(findDownloadAsset(platform.key, architecture.key, [])).toBeUndefined()
      expect(findDownloadAsset(platform.key, architecture.key, assets.slice(2))).toBeUndefined()
    }
    expect(findDownloadAsset(platform.key, 'unsupported', assets)).toBeUndefined()
  }
})

test('generated platform content is Android-only', () => {
  expect(DOWNLOAD_PLATFORMS.map(({ key }) => key)).toEqual(['android'])
  const home = homeMarkdown()
  expect(home).toContain('Android 8 and newer')
  expect(home).not.toMatch(/iOS|macOS|Windows|Linux/)
})
