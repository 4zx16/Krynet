/* ===== ZERO STATE ===== */
try {
  localStorage.clear()
  sessionStorage.clear()
} catch {}

document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/")
})

/* ===== TOR DETECTION (PASSIVE) ===== */
const isTor =
  navigator.userAgent.includes("Tor Browser") ||
  navigator.doNotTrack === "1"

const status = document.getElementById("status")
status.textContent = isTor ? "Tor detected · onion-ready" : "Clear-net mode"

/* ===== SEARCH ENGINES ===== */
const ENGINES_CLEAR = [
  q => `https://www.startpage.com/sp/search?query=${q}`,
  q => `https://duckduckgo.com/?q=${q}&kl=wt-wt`
]

const ENGINES_ONION = [
  q => `http://startpage.onion/sp/search?query=${q}`,
  q => `http://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/?q=${q}`
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/* ===== SAFE NAVIGATION ===== */
function navigate(url) {
  window.location.assign(url)
}

/* ===== QUERY HANDLER ===== */
function handleQuery(value) {
  if (!value) return

  value = value.trim()

  if (/^http:\/\//i.test(value)) return
  if (/^https:\/\//i.test(value) || /\.onion$/i.test(value)) {
    navigate(value)
    return
  }

  const q = encodeURIComponent(value)
  const engine = isTor ? pick(ENGINES_ONION) : pick(ENGINES_CLEAR)
  navigate(engine(q))
}

/* ===== AUTO EXEC (?url / ?q) ===== */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search)
  let v = params.get("url") || params.get("q")
  if (v) {
    try { v = decodeURIComponent(v) } catch {}
    handleQuery(v)
  }
})

/* ===== UI ===== */
document.getElementById("go").onclick = () => {
  const v = document.getElementById("q").value
  handleQuery(v)
}
