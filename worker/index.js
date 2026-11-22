// Wavlin share server + link previews, served by the wavlinsite Worker.
//
//   POST /p               {name, ids[], tracks?[], card?(base64 jpeg)} -> {code}   stores a shared playlist
//   GET  /p/<code>        share page (Open Graph tags, hands the playlist to the app)
//   GET  /p/<code>.json   {name, ids[], tracks?[]}  (tracks keep each song's own title/artists/picture)  (the app reads this when it opens a short link)
//   GET  /card/<id>.jpg   the card picture used as the link preview
//   POST /card/<id>       stores a card picture for a synced playlist id (kept once)
//   GET  /?list=<id> | /?name=..&ids=..   older link formats
//
// The Android intent has no package, so every installed Wavlin build (release, test, PR, debug)
// can handle it and Android lets the user pick when there are several.
// Everything else falls through to the static site (ASSETS).
// Needs the KV namespace binding CARDS (data is kept 180 days).

const FALLBACK_IMAGE = "https://wavlinsite.dvaustria741.workers.dev/og-image.png";
const RELEASES_URL = "https://github.com/WavlinGroup/Wavlin/releases";
const MAX_CARD_BYTES = 800 * 1024;
const MAX_IDS = 10000;
const TTL_SECONDS = 180 * 24 * 3600;
const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wavlin \u2013 Shared playlist</title>
<meta name="theme-color" content="#121113">
<!--OG-->
<style>
  @font-face {
    font-family: 'Google Sans Flex';
    src: url('/fonts/GoogleSansFlex.woff2?v=2') format('woff2');
    font-weight: 400 850; font-display: swap;
  }
  :root {
    color-scheme: dark;
    --surface: #121113; --on-surface: #ebe4eb; --on-surface-variant: #cec4cf;
    --primary: #d9b9ff; --on-primary: #3b1f55;
    --glass-bg: color-mix(in srgb, #ffffff 6%, transparent);
    --glass-bg-strong: color-mix(in srgb, #ffffff 11%, transparent);
    --glass-border: color-mix(in srgb, #ffffff 14%, transparent);
    --glass-filter: blur(22px) saturate(1.6);
    --glass-shadow: inset 0 1px 0 #ffffff1f, 0 10px 40px -14px #000000b3;
  }
  * { box-sizing: border-box; }
  body {
    position: relative; isolation: isolate; overflow-x: hidden;
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px 0;
    background: var(--surface); color: var(--on-surface);
    font: 400 1rem / 1.5 'Google Sans Flex', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  body::before {
    content: ''; position: fixed; inset: -10vmax; z-index: -1; opacity: .55; filter: blur(40px); pointer-events: none;
    background:
      radial-gradient(40vmax 34vmax at 12% 8%, #6a3fb3 0%, transparent 60%),
      radial-gradient(36vmax 32vmax at 92% 30%, #1d3fc4 0%, transparent 60%),
      radial-gradient(40vmax 34vmax at 30% 95%, #8a6d12 0%, transparent 62%);
  }
  .card {
    width: min(92vw, 420px); padding: 36px 24px 28px; text-align: center;
    border: 1px solid var(--glass-border); border-radius: 44px 44px 16px 44px;
    background: var(--glass-bg); box-shadow: var(--glass-shadow);
    -webkit-backdrop-filter: var(--glass-filter); backdrop-filter: var(--glass-filter);
  }
  .brand { font-weight: 620; letter-spacing: .08em; color: var(--primary); font-size: 14px; text-transform: uppercase; font-variation-settings: 'ROND' 100; }
  h1 { margin: 12px 0 6px; font-size: 28px; line-height: 1.15; font-weight: 600; letter-spacing: -0.015em; word-break: break-word; }
  p { margin: 0 0 24px; color: var(--on-surface-variant); font-size: 15px; line-height: 1.5; }
  .btn {
    display: flex; align-items: center; justify-content: center; width: 100%; min-height: 56px; margin-top: 12px; padding: 14px 26px;
    border-radius: 28px; font: 620 1.0625rem / 1.3 'Google Sans Flex', system-ui, sans-serif; font-variation-settings: 'ROND' 100;
    text-decoration: none; border: 0; -webkit-tap-highlight-color: transparent; transition: border-radius 350ms cubic-bezier(0.42, 1.67, 0.21, 0.9);
  }
  .btn:active { border-radius: 16px; }
  .primary { background: var(--primary); color: var(--on-primary); }
  .secondary {
    color: var(--primary); border: 1px solid var(--glass-border); background: var(--glass-bg-strong);
    -webkit-backdrop-filter: var(--glass-filter); backdrop-filter: var(--glass-filter);
  }
  .hidden { display: none; }
</style>
</head>
<body>
<main class="card">
  <div class="brand">Wavlin</div>
  <h1 id="title">Shared playlist</h1>
  <p id="subtitle">Open this playlist in Wavlin.</p>
  <a id="open" class="btn primary" href="#">Open in Wavlin</a>
  <a id="youtube" class="btn secondary hidden" href="#">Open in YouTube Music</a>
  <a id="get" class="btn secondary" href="${RELEASES_URL}">Get Wavlin</a>
</main>
<script>
(function () {
  var params = new URLSearchParams(location.search);
  var list = params.get('list');
  var ids = params.get('ids');
  var name = params.get('name');

  var query = list
    ? 'list=' + encodeURIComponent(list)
    : 'name=' + encodeURIComponent(name || '') + '&ids=' + encodeURIComponent(ids || '');
  var route = list ? 'playlist' : 'shared';
  var hasPlaylist = !!(list || ids);

  if (!hasPlaylist) {
    document.getElementById('subtitle').textContent = 'This link does not contain a playlist.';
    document.getElementById('open').classList.add('hidden');
    return;
  }

  if (name) document.getElementById('title').textContent = name;
  if (ids) {
    var count = ids.split(',').filter(Boolean).length;
    document.getElementById('subtitle').textContent = count + ' track' + (count === 1 ? '' : 's') + ' \u00b7 tap to open in Wavlin';
  }

  var youtubeUrl = list ? 'https://music.youtube.com/playlist?list=' + encodeURIComponent(list) : '';
  if (youtubeUrl) {
    var yt = document.getElementById('youtube');
    yt.href = youtubeUrl;
    yt.classList.remove('hidden');
  }

  var customScheme = 'wavlin://' + route + '?' + query;
  var intentUrl = 'intent://' + route + '?' + query +
    '#Intent;scheme=wavlin;' +
    'S.browser_fallback_url=' + encodeURIComponent(youtubeUrl || '${RELEASES_URL}') + ';end';
  var isAndroid = /Android/i.test(navigator.userAgent);
  var target = isAndroid ? intentUrl : customScheme;

  var open = document.getElementById('open');
  open.href = target;


  // No automatic launch: Chrome blocks package-less intents without a tap and would jump to the
  // fallback URL instead, so the buttons (a real tap) do the opening.
})();
</script>
</body>
</html>
`;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

function renderPage({ title, desc, image, url, search }) {
  const og = [
    '<meta name="description" content="' + esc(desc) + '">',
    '<meta property="og:type" content="music.playlist">',
    '<meta property="og:site_name" content="Wavlin">',
    '<meta property="og:title" content="' + esc(title) + '">',
    '<meta property="og:description" content="' + esc(desc) + '">',
    '<meta property="og:url" content="' + esc(url) + '">',
    '<meta property="og:image" content="' + esc(image) + '">',
    '<meta name="twitter:card" content="summary_large_image">',
  ].join("\n");

  const html = PAGE.replace("<!--OG-->", og)
    .replace("<title>Wavlin \u2013 Shared playlist</title>", "<title>" + esc(title) + " \u2013 Wavlin</title>")
    .replace('<h1 id="title">Shared playlist</h1>', '<h1 id="title">' + esc(title) + "</h1>")
    .replace("new URLSearchParams(location.search)", "new URLSearchParams(" + JSON.stringify(search).replace(/</g, "\\u003c") + ")");

  return new Response(html, {
    headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "public, max-age=300" },
  });
}

const str = (value, max) => (typeof value === "string" ? value.slice(0, max) : "");

// Per-track metadata sent by the app, so a receiver sees the exact versions that were shared.
function cleanTracks(input, ids) {
  if (!Array.isArray(input)) return [];
  const allowed = new Set(ids);
  const seen = new Set();
  const out = [];
  for (const item of input.slice(0, MAX_IDS)) {
    if (!item || typeof item !== "object") continue;
    const id = str(item.id, 11);
    const title = str(item.title, 300);
    if (!allowed.has(id) || seen.has(id) || !title) continue;
    seen.add(id);
    out.push({
      id,
      title,
      artists: (Array.isArray(item.artists) ? item.artists : []).slice(0, 10)
        .map((a) => ({ name: str(a && a.name, 200), id: str(a && a.id, 64) }))
        .filter((a) => a.name),
      album: str(item.album, 300),
      albumId: str(item.albumId, 64),
      duration: Number.isFinite(item.duration) ? Math.max(-1, Math.min(86400, Math.trunc(item.duration))) : -1,
      thumbnail: /^https:\/\//.test(str(item.thumbnail, 600)) ? str(item.thumbnail, 600) : "",
      explicit: item.explicit === true,
    });
  }
  return out;
}

async function createPlaylist(request, env) {
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return json({ error: "bad json" }, 400);
  }
  const ids = Array.isArray(data.ids) ? data.ids.filter((id) => VIDEO_ID_PATTERN.test(id)).slice(0, MAX_IDS) : [];
  if (ids.length === 0) return json({ error: "no tracks" }, 400);
  const name = String(data.name || "").slice(0, 100) || "Shared playlist";
  const tracks = cleanTracks(data.tracks, ids);

  let card = null;
  if (data.card) {
    try {
      card = Uint8Array.from(atob(data.card), (c) => c.charCodeAt(0));
    } catch (e) {
      card = null;
    }
    if (card && card.byteLength > MAX_CARD_BYTES) card = null;
  }

  const code = newCode();
  await env.CARDS.put("pl:" + code, JSON.stringify(tracks.length ? { name, ids, tracks } : { name, ids }), { expirationTtl: TTL_SECONDS });
  if (card) await env.CARDS.put("card:" + code, card, { expirationTtl: TTL_SECONDS });
  return json({ code }, 201);
}

async function handleCard(request, env, id) {
  if (!ID_PATTERN.test(id)) return new Response("Not found", { status: 404 });
  const key = "card:" + id;

  if (request.method === "POST") {
    if (await env.CARDS.get(key, "stream")) return new Response("exists", { status: 409 });
    const body = await request.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_CARD_BYTES) return new Response("bad size", { status: 413 });
    await env.CARDS.put(key, body, { expirationTtl: TTL_SECONDS });
    return new Response("ok", { status: 201 });
  }

  const image = await env.CARDS.get(key, "arrayBuffer");
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(image, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" } });
}

async function handleStoredPlaylist(url, env, rawCode) {
  const asJson = rawCode.endsWith(".json");
  const code = rawCode.replace(/\.json$/, "");
  const stored = await env.CARDS.get("pl:" + code, "json");
  if (!stored) return new Response("Playlist not found or expired", { status: 404 });
  if (asJson) return json(stored);

  const hasCard = !!(await env.CARDS.get("card:" + code, "stream"));
  const image = hasCard
    ? url.origin + "/card/" + code + ".jpg"
    : "https://i.ytimg.com/vi/" + encodeURIComponent(stored.ids[0]) + "/hqdefault.jpg";
  return renderPage({
    title: stored.name,
    desc: stored.ids.length + " tracks \u00b7 tap to open in Wavlin",
    image,
    url: url.href,
    search: "name=" + encodeURIComponent(stored.name) + "&ids=" + stored.ids.join(","),
  });
}

async function handleLegacy(url, env) {
  const list = url.searchParams.get("list");
  const ids = (url.searchParams.get("ids") || "").split(",").filter(Boolean);
  let title = url.searchParams.get("name") || "Playlist on Wavlin";
  let image = FALLBACK_IMAGE;
  let desc = "Tap to open this playlist in Wavlin.";

  try {
    if (list) {
      const res = await fetch(
        "https://www.youtube.com/oembed?format=json&url=" +
          encodeURIComponent("https://www.youtube.com/playlist?list=" + list),
        { cf: { cacheTtl: 3600, cacheEverything: true } },
      );
      if (res.ok) {
        const data = await res.json();
        title = data.title || title;
        image = data.thumbnail_url || image;
      }
      if (env.CARDS && ID_PATTERN.test(list) && (await env.CARDS.get("card:" + list, "stream"))) {
        image = url.origin + "/card/" + list + ".jpg";
      }
    } else if (ids.length) {
      image = "https://i.ytimg.com/vi/" + encodeURIComponent(ids[0]) + "/hqdefault.jpg";
      desc = ids.length + " tracks \u00b7 tap to open in Wavlin";
    }
  } catch (e) {
    // keep the defaults
  }

  return renderPage({ title, desc, image, url: url.href, search: url.search });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isShareApi = url.pathname === "/p" || url.pathname.startsWith("/p/") || url.pathname.startsWith("/card/");
    const isLegacy = url.pathname === "/" && (url.searchParams.has("list") || url.searchParams.has("ids"));
    if (!isShareApi && !isLegacy) return env.ASSETS.fetch(request);
    if (!env.CARDS) return new Response("KV binding CARDS is missing", { status: 500 });

    if (url.pathname === "/p" && request.method === "POST") return createPlaylist(request, env);

    const playlistMatch = url.pathname.match(/^\/p\/([A-Za-z0-9]{4,32}(?:\.json)?)$/);
    if (playlistMatch) return handleStoredPlaylist(url, env, playlistMatch[1]);

    const cardMatch = url.pathname.match(/^\/card\/([^/]+?)(?:\.jpg)?$/);
    if (cardMatch) return handleCard(request, env, cardMatch[1]);

    if (isLegacy) return handleLegacy(url, env);
    return env.ASSETS.fetch(request);
  },
};
