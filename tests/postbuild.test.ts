import { expect, test } from 'bun:test'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PAGE_META, REPO_URL, SITE_URL } from '../src/content/site'
import { SHARE_ID_PATHS, SHARE_PATHS } from '../src/content/share'

const root = new URL('../', import.meta.url)
const tokens = '$& $` $\' $$ <tag> "quoted" </script>'
const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
const rendered = `<h1>${escapeHtml(tokens)}</h1>`
const teleport = `<div role="dialog">${escapeHtml(tokens)}</div>`
const preload = '/assets/$&-$`-$\'-$$.css'
const routes = [
  ['index', '/', PAGE_META.home], ['faq', '/faq', PAGE_META.faq],
  ['privacy', '/privacy', PAGE_META.privacy],
  ['sync', '/sync', PAGE_META.sync], ['listen', '/listen', PAGE_META.listen], ['party', '/party', PAGE_META.listen],
  ...SHARE_PATHS.map(path => [path.slice(1), path, PAGE_META.share] as const),
  ['404', '/404', PAGE_META.notFound],
] as const

// Run the real generator with a stub renderer, without a build, network, or changes to the checkout.
async function fixture(template: string, check: (dir: string, result: ReturnType<typeof Bun.spawnSync>) => Promise<void>, notFoundPath?: string) {
  const dir = await mkdtemp(join(tmpdir(), 'wavlinsite-postbuild-'))
  try {
    await cp(new URL('scripts', root), join(dir, 'scripts'), { recursive: true })
    await cp(new URL('src/content', root), join(dir, 'src/content'), { recursive: true })
    await mkdir(join(dir, 'src/views'), { recursive: true })
    await cp(new URL('src/views/PrivacyPage.vue', root), join(dir, 'src/views/PrivacyPage.vue'))
    await mkdir(join(dir, 'dist/.vite'), { recursive: true })
    await mkdir(join(dir, 'dist/assets'))
    await mkdir(join(dir, 'dist-ssr'))
    await writeFile(join(dir, 'dist/index.html'), template)
    await writeFile(join(dir, 'dist/.vite/ssr-manifest.json'), JSON.stringify(Object.fromEntries(routes.map(([file, path]) => [path === '/404' ? '/__not-found' : path, [preload, `/assets/${file}.css`, `/assets/${file}.js`]]))))
    await writeFile(join(dir, 'dist-ssr/entry-server.js'), `export const render = async (path) => ({
      html: path === ${JSON.stringify(notFoundPath)} ? '<h1>Page not found</h1>' : ${JSON.stringify(rendered)},
      teleports: { body: ${JSON.stringify(teleport)} },
      modules: new Set([path, ...(path === '/__not-found' || path === ${JSON.stringify(notFoundPath)} ? ['src/views/NotFoundPage.vue'] : [])])
    })`)
    await writeFile(join(dir, 'run.ts'), `
      import { PAGE_META } from './src/content/site'
      import { FAQ_ITEMS } from './src/content/faq'
      const tokens = ${JSON.stringify(tokens)}
      for (const meta of Object.values(PAGE_META)) {
        meta.title += tokens
        meta.description += tokens
      }
      FAQ_ITEMS[0].answer += tokens
      let requests = 0
      globalThis.fetch = async () => { requests++; throw new Error('Build must not fetch') }
      await import('./scripts/postbuild')
      if (requests) throw new Error('Build attempted a network request')
    `)
    const result = Bun.spawnSync([process.execPath, join(dir, 'run.ts')], { cwd: dir })
    await check(join(dir, 'dist'), result)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

for (const ending of [' />', '/>', '>']) {
  test(`postbuild preserves literal replacements and metadata with ${ending} tags`, async () => {
    const template = (await readFile(new URL('index.html', root), 'utf8')).replace(/\s*\/>/g, ending)
    await fixture(template, async (dist, result) => {
      expect(result.stderr.toString()).toBe('')
      expect(result.exitCode).toBe(0)
      const schemas: Record<string, any>[] = []
      for (const [file, path, meta] of routes) {
        const html = await readFile(join(dist, `${file}.html`), 'utf8')
        expect(html).toContain(`<title>${escapeHtml(meta.title + tokens)}</title>`)
        for (const [attribute, name, value] of [
          ['name', 'robots', meta.robots], ['name', 'description', meta.description + tokens],
          ['property', 'og:type', 'website'],
          ['property', 'og:title', meta.title + tokens], ['property', 'og:description', meta.description + tokens],
          ['property', 'og:url', SITE_URL + path], ['name', 'twitter:title', meta.title + tokens],
          ['name', 'twitter:description', meta.description + tokens],
        ]) expect(html).toContain(`<meta ${attribute}="${name}" content="${escapeHtml(value)}" />`)
        if (file === '404') expect(html).not.toContain('rel="canonical"')
        else expect(html).toContain(`<link rel="canonical" href="${SITE_URL}${path}" />`)
        expect(html).toContain(`<body>${teleport}`)
        expect(html).toContain(`<div id="app">${rendered}</div>`)
        expect(html).toContain(`<link rel="stylesheet" href="${preload}" />`)
        expect(html).toContain(`<link rel="stylesheet" href="/assets/${file}.css" />`)
        expect(html).toContain(`<link rel="modulepreload" crossorigin href="/assets/${file}.js" />`)
        if (meta.robots.startsWith('index')) {
          expect(html).toContain(`<link rel="alternate" type="text/markdown" href="/${file}.md" />`)
        }
        expect(html.match(/<\/head>/g)).toHaveLength(1)
        const pageSchemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => {
          expect(match[1]).not.toContain('<')
          return JSON.parse(match[1]!)
        })
        schemas.push(...pageSchemas)
      }
      const app = schemas.find(schema => schema['@type'] === 'SoftwareApplication')!
      expect(app['@id']).toBe(`${SITE_URL}/#app`)
      expect(app.description).toBe(PAGE_META.home.description + tokens)
      expect(app.operatingSystem).toBe('Android')
      expect(app.installUrl).toBe(`${REPO_URL}/releases/latest`)
      expect(app.sameAs).toBe(REPO_URL)
      expect(app.offers.price).toBe('0')
      for (const key of ['softwareVersion', 'dateModified', 'downloadUrl', 'codeRepository']) expect(app).not.toHaveProperty(key)
      expect(schemas.find(schema => schema['@type'] === 'FAQPage')!.mainEntity[0].acceptedAnswer.text).toEndWith(tokens)
      for (const file of ['discord-embed', 'discord-embed-faq', 'discord-embed-privacy']) {
        const json = await readFile(join(dist, `${file}.json`), 'utf8')
        expect(Buffer.byteLength(json)).toBeLessThanOrEqual(3000)
        const embed = JSON.parse(json)
        if (file === 'discord-embed') expect(embed.component.components.at(-1).components[0].content).toBe(`### Ad-free YouTube Music\n${PAGE_META.home.description}${tokens}`)
      }
      const headers = await readFile(join(dist, '_headers'), 'utf8')
      expect(headers).not.toContain('/assets/*')
      expect(headers).not.toContain('Cache-Control:')
      expect(headers).not.toContain('Content-Type: text/markdown')
      expect(headers).toContain('/*.md\n  X-Robots-Tag: noindex')
      expect(headers).not.toContain('feed.xml')
      for (const path of ['/listen', '/party', ...SHARE_PATHS, ...SHARE_ID_PATHS.map(path => `${path}/*`)]) {
        expect(headers).toContain(`${path}\n  X-Robots-Tag: noindex, follow`)
      }
      expect(await readFile(join(dist, '_redirects'), 'utf8')).toBe(SHARE_ID_PATHS.map(path => `${path}/* ${path} 200`).join('\n') + '\n')
      const indexable = routes.filter(([, , meta]) => meta.robots.startsWith('index'))
      const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8')
      expect([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])).toEqual(indexable.map(([, path]) => SITE_URL + path))
      const llms = await readFile(join(dist, 'llms.txt'), 'utf8')
      expect(await Bun.file(join(dist, 'feed.xml')).exists()).toBe(false)
      const markdown = await Promise.all(indexable.map(async ([file, path]) => {
        expect(llms).toContain(`(${SITE_URL}/${file}.md)`)
        expect(headers).toContain(`/${file}.md\n  Link: <${SITE_URL}${path}>; rel="canonical"`)
        const text = await readFile(join(dist, `${file}.md`), 'utf8')
        expect(text).toContain(`Source: ${SITE_URL}${path}\n`)
        return text
      }))
      expect(await readFile(join(dist, 'llms-full.txt'), 'utf8')).toBe(markdown.map(text => text.trim()).join('\n\n---\n\n') + '\n')
    })
  })
}

for (const [file, path] of routes.filter(([, path]) => path === '/faq')) {
  test(`postbuild rejects an indexable not-found render at ${path}`, async () => {
    const template = await readFile(new URL('index.html', root), 'utf8')
    await fixture(template, async (dist, result) => {
      expect(result.exitCode).not.toBe(0)
      expect(result.stderr.toString()).toContain(`Indexable route ${path} rendered NotFoundPage`)
      for (const output of [`${file}.html`, `${file}.md`, 'sitemap.xml', 'llms.txt', 'llms-full.txt']) {
        expect(await Bun.file(join(dist, output)).exists()).toBe(false)
      }
    }, path)
  })
}

test('postbuild fails loudly when required description metadata is missing', async () => {
  const template = (await readFile(new URL('index.html', root), 'utf8')).replace(/<meta name="description"[^>]*>/, '')
  await fixture(template, async (_, result) => {
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr.toString()).toContain('Required HTML placeholder was not found')
  })
})
