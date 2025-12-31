/* ===============================
   ZERO STATE (best-effort)
================================ */
try {
  localStorage.clear()
  sessionStorage.clear()
} catch {}

try {
  document.cookie.split(";").forEach(c => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/")
  })
} catch {}

/* ===============================
   PLUGIN CORE (STATIC + SAFE)
================================ */
window.KRY_PLUGINS ||= []

const KRY_CONTEXT = Object.freeze({
  ua: navigator.userAgent,
  lang: navigator.language,
  platform: navigator.platform,
  url: location.href
})

function runPlugins() {
  for (const plugin of window.KRY_PLUGINS) {
    try {
      if (plugin?.run) plugin.run(KRY_CONTEXT)
    } catch {
      // silent by design
    }
  }
}

/* ===============================
   UI STATUS
================================ */
const status = document.getElementById("status")
if (status) status.textContent = "Private search mode"

/* ===============================
   PRIVACY ENGINES ONLY
================================ */
const ENGINES = {
  startpage: q => `https://www.startpage.com/sp/search?query=${q}`,
  duckduckgo: q => `https://duckduckgo.com/?q=${q}&kl=wt-wt`,
  brave: q => `https://search.brave.com/search?q=${q}`,
  mojeek: q => `https://www.mojeek.com/search?q=${q}`,
  qwant: q => `https://www.qwant.com/?q=${q}&t=web`
}

function pickEngine(name) {
  return ENGINES[name] || ENGINES.startpage
}

/* ===============================
   SAFE NAVIGATION
================================ */
function navigate(url) {
  window.location.assign(url)
}

/* ===============================
   QUERY HANDLER
================================ */
function handleQuery(value, engineName, isUrl = false) {
  if (!value) return
  value = value.trim()

  const engine = pickEngine(engineName)

  // hard block http
  if (/^http:\/\//i.test(value)) return

  // direct https
  if (!isUrl && /^https:\/\//i.test(value)) {
    navigate(value)
    return
  }

  const q = encodeURIComponent(value)
  navigate(engine(q))
}

/* ===============================
   AUTO EXEC (?q= OR ?url=)
================================ */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search)
  const engine = params.get("engine")

  let q = params.get("q")
  let url = params.get("url")

  if (url) {
    try { url = decodeURIComponent(url) } catch {}
    handleQuery(url, engine, true)
  } else if (q) {
    try { q = decodeURIComponent(q) } catch {}
    handleQuery(q, engine)
  }

  runPlugins()
})

/* ===============================
   UI BINDINGS
================================ */
const goBtn = document.getElementById("go")
if (goBtn) {
  goBtn.onclick = () => {
    const value = document.getElementById("q")?.value
    handleQuery(value)
  }
}
