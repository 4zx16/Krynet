/* ===== STRICT PRIVACY ===== */
for(const k of['localStorage','sessionStorage','indexedDB']) try{Object.defineProperty(window,k,{value:null})}catch{}
document.cookie.split(';').forEach(c=>document.cookie=c.replace(/^ +/,'').replace(/=.*/,'=;expires=Thu,01 Jan 1970 00:00:00 UTC;path=/'))
if(location.protocol!=='https:'&&location.hostname!=='localhost') location.replace('https://'+location.host+location.pathname)
if(top!==self) document.documentElement.innerHTML=''

/* ===== TOR DETECTION ===== */
const isTor = navigator.userAgent.includes('Tor Browser')||(navigator.platform==='Linux x86_64'&&navigator.doNotTrack==='1')
document.getElementById('status').textContent = isTor ? 'Tor detected · Onion enabled' : 'Clear-net mode'

/* ===== ENGINES ===== */
const clearnet = [
  q=>`https://www.startpage.com/sp/search?query=${q}`,
  q=>`https://duckduckgo.com/?q=${q}&kl=wt-wt`
]
const onion = [
  q=>`http://startpage.onion/sp/search?query=${q}`,
  q=>`http://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/?q=${q}`
]

/* ===== FINGERPRINT DEFENSE ===== */
const jitter = () => new Promise(r => setTimeout(r, Math.random()*160+80))
const _getContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function(t){
  const ctx = _getContext.call(this,t)
  if(t==='2d'){const g=ctx.getImageData;ctx.getImageData=function(){
    const d=g.apply(this,arguments)
    for(let i=0;i<32;i++){const p=Math.floor(Math.random()*d.data.length);d.data[p]^=1}
    return d
  }}
  return ctx
}
Object.defineProperty(document,'fonts',{value:null})

/* ===== SEARCH LOGIC ===== */
function launch(url){window.location.href=url}

// Auto-launch from ?url= or ?q=
const params = new URLSearchParams(window.location.search)
let inputParam = params.get('url') || params.get('q')
if(inputParam){
  try{inputParam = decodeURIComponent(inputParam)}catch{}
  const u = inputParam.trim()
  if(/^https?:\/\//i.test(u) || /\.onion/i.test(u)) launch(u)
}

// Normal search input (ignored if ?url or ?q exists)
document.getElementById('go').onclick = async () => {
  if(inputParam) return
  const v = document.getElementById('q').value.trim()
  if(!v) return
  await jitter()
  if(/^http:\/\//i.test(v)) return
  if(/^(https:\/\/|http:\/\/.*\.onion)/i.test(v)){ launch(v); return }
  const q = encodeURIComponent(v)
  
  // Choose a random engine from the list
  const engines = isTor ? onion : clearnet
  if(!engines.length) return // fail-safe
  const engine = engines[Math.floor(Math.random()*engines.length)]
  launch(engine(q))
}
