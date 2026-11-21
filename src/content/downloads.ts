export type DownloadPlatformKey = 'android'

export type ReleaseAsset = {
  name: string
  browser_download_url: string
  size?: number
}

export type DownloadArchitecture = {
  key: string
  name: string
  patterns: readonly RegExp[]
}

export type DownloadPlatform = {
  key: DownloadPlatformKey
  icon: string
  name: string
  detail: string
  package: string
  instructions: readonly string[]
  architectures: readonly DownloadArchitecture[]
}

export type LatestRelease = {
  name?: string
  tag_name?: string
  assets?: ReleaseAsset[]
}

const RELEASE_TIMEOUT_MS = 10_000
const RELEASE_CACHE_MS = 60_000
let latestReleaseRequest: Promise<LatestRelease> | undefined
let lastSuccessfulRelease: LatestRelease | undefined
let latestReleaseExpiresAt = Infinity

export function getLatestRelease() {
  if (!latestReleaseRequest || Date.now() >= latestReleaseExpiresAt) {
    latestReleaseExpiresAt = Infinity
    const controller = new AbortController()
    let timeout: ReturnType<typeof setTimeout>
    const deadline = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error('GitHub release request timed out'))
        controller.abort()
      }, RELEASE_TIMEOUT_MS)
    })
    const request = async () => {
      const response = await fetch('https://api.github.com/repos/WavlinGroup/Wavlin/releases/latest', {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
      return response.json() as Promise<LatestRelease>
    }
    // Keep the deadline active through body parsing, not just response headers.
    latestReleaseRequest = Promise.race([request(), deadline])
      .then(release => {
        lastSuccessfulRelease = release
        latestReleaseExpiresAt = Date.now() + RELEASE_CACHE_MS
        return release
      })
      .catch(error => {
        latestReleaseRequest = undefined
        if (lastSuccessfulRelease !== undefined) return lastSuccessfulRelease
        throw error
      })
      .finally(() => clearTimeout(timeout))
  }
  return latestReleaseRequest
}

// Asset names are inherited from the Metrolist release layout and not yet confirmed against a Wavlin release.
export const DOWNLOAD_PLATFORMS: readonly DownloadPlatform[] = [
  {
    key: 'android',
    icon: 'android',
    name: 'Android',
    detail: 'Android 8 and newer',
    package: 'APK',
    instructions: [
      'Download the APK file.',
      'If Android asks, allow installs from your browser or file manager.',
      'Tap the APK and follow the prompts to install.',
    ],
    architectures: [
      {
        key: 'universal',
        name: 'Universal',
        patterns: [/^Wavlin\.apk$/i, /^Wavlin[\w.-]*\.apk$/i],
      },
    ],
  },
]

export function findDownloadAsset(platformKey: DownloadPlatformKey, architectureKey: string, assets: ReleaseAsset[]) {
  const architecture = DOWNLOAD_PLATFORMS
    .find(({ key }) => key === platformKey)
    ?.architectures.find(({ key }) => key === architectureKey)

  if (!architecture) return

  for (const pattern of architecture.patterns) {
    const asset = assets.find(({ name }) => pattern.test(name))
    if (asset) return asset
  }
}
