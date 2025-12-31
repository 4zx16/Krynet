/* ===== ZERO STATE ===== */
try {
  localStorage.clear()
  sessionStorage.clear()
} catch {}
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/")
})

/* ===== PRIVACY STATUS ===== */
const status = document.getElementById("status")
status.textContent = "Private search mode"

/* ===== PRIVACY-FOCUSED ENGINES ===== */
const ENGINES = {
  startpage: q => `https://www.startpage.com/sp/search?query=${q}`,
  duckduckgo: q => `https://duckduckgo.com/?q=${q}&kl=wt-wt`,
  brave: q => `https://search.brave.com/search?q=${q}`,
  mojeek: q => `https://www.mojeek.com/search?q=${q}`,
  qwant: q => `https://www.qwant.com/?q=${q}&t=web`
}

function pickEngine(name) {
  if (name && ENGINES[name]) return ENGINES[name]
  return ENGINES.startpage // default
}

/* ===== SAFE NAVIGATION ===== */
function navigate(url) {
  window.location.assign(url)
}

/* ===== QUERY HANDLER ===== */
function handleQuery(value, engineName, isUrl=false) {
  if (!value) return
  value = value.trim()
  const engineFunc = pickEngine(engineName)
  
  if (isUrl) {
    const q = encodeURIComponent(value)
    navigate(engineFunc(q))
    return
  }

  if (/^http:\/\//i.test(value)) return
  if (/^https:\/\//i.test(value)) {
    navigate(value)
    return
  }

  const q = encodeURIComponent(value)
  navigate(engineFunc(q))
}

/* ===== AUTO EXEC (?q=term OR ?url=site&engine=name) ===== */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search)
  const engine = params.get("engine")
  let query = params.get("q")
  let urlParam = params.get("url")

  if (urlParam) {
    try { urlParam = decodeURIComponent(urlParam) } catch {}
    handleQuery(urlParam, engine, true)
  } else if (query) {
    try { query = decodeURIComponent(query) } catch {}
    handleQuery(query, engine)
  }
})

/* ===== UI ===== */
document.getElementById("go").onclick = () => {
  const value = document.getElementById("q").value
  handleQuery(value)
}
