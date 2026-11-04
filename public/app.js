"use strict";
// ---------- Hilfen ----------
const $ = s => document.querySelector(s);
const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DAY = 864e5;
const today = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
const shuffle = a => { a = a.slice(); for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const norm = s => String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z؀-ۿ ]/g," ").replace(/\s+/g," ").trim();
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=[...Array(n+1).keys()];for(let i=1;i<=m;i++){let c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c;}return p[n];}
const sim = (a,b) => { a = norm(a); b = norm(b); return 1 - lev(a,b) / Math.max(a.length, b.length, 1); };
const ICON = {
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
 learn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M9 8h6"/></svg>',
 vocab:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="14" height="14" rx="3"/><path d="M7 3h11a3 3 0 0 1 3 3v11"/></svg>',
 listen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/></svg>',
 speak:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
 stats:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 x:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 back:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
};
function toast(t){const d=document.createElement("div");d.className="toast pop";d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2600);}
function confetti(){const c=document.createElement("canvas");c.className="confetti";c.width=innerWidth;c.height=innerHeight;document.body.appendChild(c);const x=c.getContext("2d");const P=[...Array(90)].map(()=>({x:Math.random()*c.width,y:-20-Math.random()*200,v:2+Math.random()*4,r:Math.random()*6.3,s:5+Math.random()*6,col:["#E2712F","#1F9E8F","#E8B021","#7B5EA7","#F4A259"][Math.floor(Math.random()*5)]}));let t=0;(function f(){x.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.y+=p.v;p.r+=.1;x.save();x.translate(p.x+Math.sin(p.r)*10,p.y);x.rotate(p.r);x.fillStyle=p.col;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore();});if(++t<140)requestAnimationFrame(f);else c.remove();})();}

// Umschrift → deutsche Aussprachehilfe
function pron(f){
 const map={kh:"ch",gh:"gh",sh:"sch",ch:"tsch",zh:"sh",â:"ô",a:"ä",j:"dsch",y:"j",v:"w",z:"s",s:"ß"};
 return String(f).toLowerCase().replace(/kh|gh|sh|ch|zh|â|./g, m => map[m] ?? m);
}

// ---------- Wochen & Lektionen ----------
const WEEKS = [];
MONTHS.forEach(M => { const ws = M.weeks.slice(); if ([3,6,9,12].includes(M.m) && M.m !== 12) ws.push("Wiederholung & Monatstest"); if (M.m===12) ws.splice(3,0,"Gesamtwiederholung"); ws.forEach(t => WEEKS.push({n: WEEKS.length+1, m: M.m, title: t})); });
const FIXED = {1:[1,2],2:[3,4],3:[5,6],4:[7,8],5:[9,10]};
WEEKS.forEach(w => w.lessons = FIXED[w.n] ? FIXED[w.n].map(String) : ["G"+w.n]);
const GRAMQ = [
[1,"Wie fragst du die Mutter deines Partners höflich, wie es ihr geht?",["khubi?","khubin?","khubam?"],1],
[2,"„Ich bin Deutsche\" heißt …",["âlmâni-am","âlmâni-i","âlmâni-e"],0],
[3,"„meine Mama\"",["mâmânet","mâmânam","mâmânesh"],1],
[3,"„dein Bruder\"",["barâdaret","barâdaram","barâdaresh"],0],
[4,"„zwei Tee\"",["do chây-hâ","do tâ chây","do chây tâ"],1],
[5,"Welcher Tag ist im Iran Wochenende?",["shanbe","jom'e","doshanbe"],1],
[5,"„sâ'at-e do o nim\" ist …",["1:30","2:30","12:30"],1],
[6,"„Ich verstehe nicht\"",["mifahmam","nemifahmam","nafahmam"],1],
[6,"„du gehst\"",["miram","miri","mire"],1],
[7,"Wie wird im Gespräch eine Ja/Nein-Frage gebildet?",["Verb an den Anfang","Gleiche Satzstellung, Stimme geht hoch","Immer mit „âyâ\""],1],
[8,"„Ich habe Hunger\"",["gorosnam-e","gorosnat-e","gorosne dâram"],0],
[9,"„Was ist passiert?\"",["chi shode?","chi mishe?","chi kardi?"],0],
[10,"„er ging\"",["rafte","raft","raftesh"],1],
[10,"„ich bin nicht gegangen\"",["nemiram","naraftam","raftam na"],1]];

// ---------- Zustand ----------
const DEF = () => ({v:1, created: Date.now(), mode:"std", script:true, srs:{}, days:{}, done:{}, listen:[], speak:[], quiz:[], errors:[], tests:{}, verified:{}, gen:{}, seen:{}, chats:0, lastNew:{} });
let S = DEF();
function getLesson(id){ id=String(id); if (id[0]==="G"||id[0]==="D") return S.gen[id] || null; return LESSONS.find(l => String(l.id)===id); }
function lessonItems(id){ const L=getLesson(id); return L ? L.items.map((it,i)=>({key:id+"-"+i, lesson:id, f:it[0], d:it[1], p:it[2], ef:it[3], ed:it[4], ep:it[5], u:it[6], ai: id[0]==="G"})) : []; }
function allItems(){ const out=[]; WEEKS.forEach(w=>w.lessons.forEach(id=>out.push(...lessonItems(id)))); return out; }
const itemByKey = k => allItems().find(i => i.key===k);
function curWeek(){ for (const w of WEEKS) if (!w.lessons.every(id => S.done[id])) return w; return WEEKS[WEEKS.length-1]; }
function weekState(w){ const c=curWeek(); return w.lessons.every(id=>S.done[id]) ? "ok" : (w.n===c.n ? "on" : (w.n<c.n?"ok":"lock")); }
function learnedItems(){ return allItems().filter(i => S.srs["p:"+i.key]); }

// ---------- Speicherung (Supabase + lokal) ----------
let CFG={}, SB=null, USER=null, AI_OK=false, cloudOk=false, saveT=null, saving=false, dirty=false;
function lsGet(){ try { return JSON.parse(localStorage.getItem("farsi-jun")||"null"); } catch(e){ return null; } }
function lsSet(){ try { localStorage.setItem("farsi-jun", JSON.stringify(S)); } catch(e){} }
function save(now){ S.at=Date.now(); lsSet(); dirty=true; clearTimeout(saveT); saveT=setTimeout(flush, now?50:4000); }
async function flush(){
 if(!SB||!USER||saving||!dirty) return; saving=true; dirty=false;
 try { const {error} = await SB.from("progress").upsert({user_id: USER.id, state: S, updated_at: new Date().toISOString()}); if (error) throw error; }
 catch(e){ dirty=true; }
 saving=false; if (dirty) saveT=setTimeout(flush, 8000);
}
async function initCloud(){
 try { CFG = await (await fetch("/api/config", {cache:"no-store"})).json(); } catch(e){ CFG={}; }
 if (CFG.supabaseUrl && window.supabase) {
  SB = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {auth:{persistSession:true, autoRefreshToken:true}});
  const {data:{session}} = await SB.auth.getSession();
  if (session) await onLogin(session.user); else { V={tab:"login"}; render(); }
 } else { AI_OK = !!CFG.ai; render(); } // lokaler Modus ohne Konto
}
async function onLogin(u){
 USER=u;
 try {
  const {data} = await SB.from("progress").select("state").eq("user_id", u.id).maybeSingle();
  if (data && data.state && (data.state.at||0) > (S.at||0)) { S = Object.assign(DEF(), data.state); lsSet(); }
  else if (S.at) { dirty=true; flush(); }
  cloudOk = true;
 } catch(e){}
 AI_OK = !!CFG.ai; syncRecList();
 if (V.tab==="login") V={tab:"home"};
 render();
}
async function logout(){ await flush(); if (SB) await SB.auth.signOut(); try { localStorage.removeItem("farsi-jun"); } catch(e){} S=DEF(); USER=null; V={tab:"login"}; render(); }
async function api(path, body, raw){
 const hd = {"Content-Type":"application/json"};
 if (SB) { const {data:{session}} = await SB.auth.getSession(); if (session) hd.Authorization = "Bearer "+session.access_token; }
 const r = await fetch(path, {method:"POST", headers:hd, body: JSON.stringify(body)});
 if (!r.ok) { let code="error"; try { code=(await r.json()).error||code; } catch(e){} if (r.status===401) code="login"; if (r.status===403) code="forbidden"; if (r.status===429) code="rate_limited"; throw {code}; }
 return raw ? r : r.json();
}

// ---------- Lernzeit ----------
let lastAct = Date.now();
["click","keydown","touchstart","input"].forEach(ev => addEventListener(ev, () => lastAct = Date.now(), {passive:true}));
setInterval(() => {
 if (document.visibilityState !== "visible" || Date.now()-lastAct > 60000) return;
 const d=today(); const before=S.days[d]||0; S.days[d]=before+5;
 if (before < 600 && S.days[d] >= 600) { confetti(); toast("Tagesziel erreicht! 10 Minuten geschafft 🎉"); }
 renderTop(); if (S.days[d] % 30 === 0) save();
}, 5000);
function streak(){ let n=0, d=new Date(); if ((S.days[today(d)]||0) < 600) d=new Date(Date.now()-DAY); while ((S.days[today(d)]||0) >= 600){ n++; d=new Date(d-DAY); } return n; }
const totalMin = () => Math.round(Object.values(S.days).reduce((a,b)=>a+b,0)/60);
const todayMin = () => Math.floor((S.days[today()]||0)/60);

// ---------- Audio: eigene Aufnahmen → Azure-Stimme → Browser-Stimme ----------
let VOICES=[];
function loadVoices(){ try { VOICES = speechSynthesis.getVoices().filter(v => /^fa/i.test(v.lang)); } catch(e){} }
try { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; } catch(e){}
const RATE = {slow:.7, normal:1, fast:1.25};
let speed = "normal";
const idb = (() => { let p; const open=()=>p||(p=new Promise((res,rej)=>{const r=indexedDB.open("farsi-audio",1);r.onupgradeneeded=()=>r.result.createObjectStore("a");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);})); const tx=(m,f)=>open().then(db=>new Promise((res,rej)=>{const t=db.transaction("a",m);const q=f(t.objectStore("a"));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error);})); return {get:k=>tx("readonly",s=>s.get(k)),set:(k,v)=>tx("readwrite",s=>s.put(v,k)),del:k=>tx("readwrite",s=>s.delete(k)),keys:()=>tx("readonly",s=>s.getAllKeys())}; })();
let REC = new Set();   // Schlüssel mit Muttersprachler-Aufnahme
idb.keys().then(k => k.filter(x=>!String(x).startsWith("tts:")).forEach(x=>REC.add(x))).catch(()=>{});
async function syncRecList(){ if(!SB||!USER) return; try { const {data} = await SB.storage.from("recordings").list(USER.id, {limit:1000}); (data||[]).forEach(f=>REC.add(f.name)); } catch(e){} }
async function saveRecording(key, blob){
 await idb.set(key, blob).catch(()=>{}); REC.add(key);
 if (SB && USER) { const {error} = await SB.storage.from("recordings").upload(USER.id+"/"+key, blob, {upsert:true, contentType: blob.type||"audio/webm"}); if (error) throw error; }
}
async function recBlob(key){
 let b=null; try { b = await idb.get(key); } catch(e){}
 if (!b && SB && USER && REC.has(key)) { const {data} = await SB.storage.from("recordings").download(USER.id+"/"+key); if (data) { b=data; idb.set(key,b).catch(()=>{}); } }
 return b;
}
async function ttsBlob(text){
 const k="tts:"+text; let b=null; try { b = await idb.get(k); } catch(e){}
 if (b) return b;
 const r = await api("/api/tts", {text}, true); b = await r.blob(); idb.set(k,b).catch(()=>{}); return b;
}
let curAudio=null;
function stopAudio(){ try{speechSynthesis.cancel();}catch(e){} if(curAudio){curAudio.pause();curAudio=null;} }
function playBlob(b, rate){ return new Promise(res => { const a=new Audio(URL.createObjectURL(b)); a.playbackRate = rate || RATE[speed]; try { a.preservesPitch = true; } catch(e){} curAudio=a; a.onended=res; a.onerror=res; a.play().catch(res); }); }
function speak(text, rate){
 return new Promise(res => {
  try {
   const u = new SpeechSynthesisUtterance(text); u.lang="fa-IR"; if (VOICES[0]) u.voice=VOICES[0];
   u.rate = (rate || RATE[speed])*.95; u.onend=res; u.onerror=res; speechSynthesis.speak(u);
   setTimeout(res, 1500 + text.length*160/(u.rate));
  } catch(e){ res(); }
 });
}
async function playKey(key, text, rate){
 stopAudio();
 try { const b = await recBlob(key); if (b) return playBlob(b, rate); } catch(e){}
 if (CFG.tts && text) { try { return await playBlob(await ttsBlob(text), rate); } catch(e){} }
 if (!VOICES.length) noVoiceHint();
 await speak(text, rate);
}
let hinted=false;
function noVoiceHint(){ if (hinted) return; hinted=true; toast("Keine persische Stimme verfügbar – siehe Hinweis im Bereich Hören."); }
async function playLines(lines, keyBase){ stopAudio(); playing=true; for (let i=0;i<lines.length && playing;i++){ hlLine(i); await playKey(keyBase+"-"+i, lines[i][3]); await new Promise(r=>setTimeout(r,350)); } hlLine(-1); playing=false; }
let playing=false;
function hlLine(i){ document.querySelectorAll("[data-line]").forEach(el => el.style.outline = (+el.dataset.line===i) ? "3px solid var(--pri2)" : ""); }

// ---------- Mikrofon & Spracherkennung ----------
const MIC_OK = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recording = null; // {purpose, k}
const recorder = {
 mr:null, chunks:[],
 async start(){
  const stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true}});
  const type = ["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
  this.mr = new MediaRecorder(stream, type ? {mimeType:type} : undefined); this.chunks=[];
  this.mr.ondataavailable = e => { if (e.data && e.data.size) this.chunks.push(e.data); };
  this.mr.start();
 },
 stop(){ return new Promise(res => { const mr=this.mr; if(!mr) return res(null); mr.onstop = () => { mr.stream.getTracks().forEach(t=>t.stop()); res(new Blob(this.chunks, {type: (mr.mimeType||"audio/webm").split(";")[0]})); }; mr.stop(); this.mr=null; }); }
};
async function stt(blob){
 const b64 = await new Promise(r => { const fr=new FileReader(); fr.onload=()=>r(String(fr.result).split(",")[1]); fr.readAsDataURL(blob); });
 return (await api("/api/stt", {audio:b64, type:blob.type||"audio/webm"})).text || "";
}
function liveRecognize(){ // Fallback ohne Server-Spracherkennung (z. B. Chrome/Android)
 return new Promise((res, rej) => { const r=new SR(); r.lang="fa-IR"; r.interimResults=false; r.maxAlternatives=1; let out=""; r.onresult=e=>{ out=[...e.results].map(x=>x[0].transcript).join(" "); }; r.onerror=e=>rej(e); r.onend=()=>res(out); r.start(); recording.sr=r; });
}
const canSpeakIn = () => (MIC_OK && CFG.stt) || !!SR;
function micBtn(purpose, k, label, cls){
 const on = recording && recording.purpose===purpose && recording.k===k;
 return `<button class="btn ${cls||"tq"} ${on?"":""}" data-act="rec" data-a="${purpose}" data-k="${h(k||"")}" style="${on?"background:var(--red);box-shadow:0 4px 0 #9B2C2C":""}">${on? (recording.busy?'<span class="spin"></span> Erkenne …':"⏹ Stopp") : label}</button>`;
}
async function toggleRec(purpose, k){
 if (recording && recording.busy) return;
 const live = !(MIC_OK && (CFG.stt || purpose==="native" || purpose==="shadow")) && SR && (purpose==="check" || purpose==="chat");
 if (!recording) {
  recording = {purpose, k}; render();
  try {
   if (live) { const text = await liveRecognize(); const r=recording; recording=null; await afterRec(r, null, text); return; }
   await recorder.start();
  } catch(e){ recording=null; toast("Kein Zugriff aufs Mikrofon – bitte in den Einstellungen erlauben."); render(); }
  return;
 }
 if (recording.sr) { recording.sr.stop(); return; }
 const r = recording; r.busy=true; render();
 const blob = await recorder.stop();
 let text = null;
 if (blob && CFG.stt && ["check","chat","shadow"].includes(r.purpose)) { try { text = await stt(blob); } catch(e){ toast(aiErr(e)); } }
 recording = null; await afterRec(r, blob, text);
}
async function afterRec(r, blob, text){
 if (r.purpose==="native" && blob) { try { await saveRecording(r.k, blob); toast("Aufnahme gespeichert – wird ab jetzt abgespielt ✓"); } catch(e){ toast("Lokal gespeichert, Upload fehlgeschlagen."); } }
 if (r.purpose==="shadow" && blob) { V.myRec = URL.createObjectURL(blob); V.shadowTx = text; }
 if (r.purpose==="check" && text!==null) { const ta=$("#chkIn"); const ctx=r.k; V.check = {ctx, input:text, dict:true}; render(); if (text.trim()) return doCheck(ctx); else toast("Nichts erkannt – bitte nochmal."); }
 if (r.purpose==="chat" && text!==null) { if (text.trim()) { V.chat.msgs.push({role:"me", text, spoken:true}); return chatTurn(); } toast("Nichts erkannt – bitte nochmal."); }
 render();
}
// Vergleich gesprochene Aufnahme ↔ Ziel (nur Hinweis, Erkennung kann irren)
const faNorm = t => String(t||"").replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/[ً-ْ‌]/g,"").replace(/[^؀-ۿa-zâ ]/gi," ").replace(/\s+/g," ").trim();
function compareSpoken(target, heard){
 const tw = faNorm(target).split(" ").filter(Boolean), hw = faNorm(heard).split(" ").filter(Boolean);
 const marks = tw.map(w => hw.some(x => x===w || sim(x,w)>=.75));
 return {score: tw.length ? Math.round(marks.filter(Boolean).length/tw.length*100) : 0, html: tw.map((w,i)=>`<span style="color:${marks[i]?"var(--tq)":"var(--red)"};font-weight:700">${h(w)}</span>`).join(" ")};
}

// ---------- KI ----------
const TRANSLIT = "Umschrift-Regeln (immer exakt so): â = langes dunkles a (آ), a = kurzes a, e, o, i, u, kh (خ), gh (ق/غ), sh (ش), ch (چ), zh (ژ), j (ج), y (ی), ' (ع/ء). Schreibe IMMER die gesprochene Teheraner Form (miram statt miravam, mikhâm statt mikhâham, khune statt khâne, umadam statt âmadam, -e statt ast).";
async function ai(prompt, tier){
 if (!AI_OK) throw {code:"none"};
 return (await api("/api/ai", {prompt, tier: tier||"default"})).result;
}
function aiErr(e){ if (e && e.code==="rate_limited") return "Die KI ist gerade ausgelastet – bitte in einer Minute nochmal."; if (e && e.code==="none") return "Die KI ist auf dem Server noch nicht eingerichtet (ANTHROPIC_API_KEY fehlt)."; if (e && e.code==="forbidden") return "Dieses Konto ist nicht freigeschaltet (ALLOWED_EMAILS)."; if (e && e.code==="login") return "Bitte neu anmelden."; if (e && e.code==="not_configured") return "Diese Funktion ist auf dem Server nicht eingerichtet."; return "Das hat nicht geklappt. Bitte nochmal versuchen."; }
function levelCtx(){ const w=curWeek(); const words = learnedItems().slice(-80).map(i=>i.f).join(", "); return `Lernstand: Woche ${w.n} von 52 (Monat ${w.m}, Thema: ${w.title}). Bereits gelernte Ausdrücke: ${words || "noch fast keine (absolute Anfängerin)"}.`; }

// ---------- SRS ----------
function addSRS(key){ ["p:","a:"].forEach(d => { if (!S.srs[d+key]) S.srs[d+key] = {e:2.5,i:0,r:0,l:0,due: Date.now() + (d==="a:"? 4*3600e3 : 0)}; }); S.seen[key]=Date.now(); }
function rateCard(ck, q){
 const c = S.srs[ck]; if (!c) return;
 if (q===0){ c.r=0; c.i=0; c.l++; c.e=Math.max(1.3,c.e-.2); c.due=Date.now()+10*60e3; }
 else { c.r++; c.i = c.r===1 ? (q===3?3:1) : c.r===2 ? (q===1?3:6) : Math.round(c.i*c.e*(q===1?.8:q===3?1.3:1)); c.e=Math.max(1.3,c.e+(q===1?-.15:q===3?.15:0)); c.due=Date.now()+c.i*DAY; }
 c.last=Date.now(); save();
}
const dueCards = () => Object.keys(S.srs).filter(k => S.srs[k].due <= Date.now() && itemByKey(k.slice(2))).sort((a,b)=>S.srs[a].due-S.srs[b].due);
function vocabStats(){ let pa=0,ac=0,ps=0,as=0; for (const k in S.srs){ const c=S.srs[k]; if (k[0]==="p"){ if(c.r>=1) pa++; if(c.i>=21) ps++; } else { if(c.r>=1) ac++; if(c.i>=21) as++; } } return {pa,ac,ps,as,total: allItems().length}; }
const VTARGET = {2:450,4:1050,6:1650,8:2250,10:2750,12:3250};

// ---------- Fehlerprofil ----------
const ECAT = {grammatik:"Grammatik", wortwahl:"Wortwahl", unnatürlich:"Unnatürlich / zu formell", aussprache:"Aussprache", erkennung:"Erkennungsfehler (kein echter Fehler)"};
function addErrors(list, source){
 (list||[]).forEach(e => {
  if (!e || !e.correct_f) return;
  const type = ECAT[e.type] ? e.type : "grammatik";
  S.errors.push({id: Date.now().toString(36)+Math.random().toString(36).slice(2,6), d: Date.now(), said: e.said||e.part||"", correct_f: e.correct_f, correct_de: e.correct_de||"", type, tag: e.tag||"", expl: e.explanation||"", due: Date.now()+2*DAY, stage:0, fixed:false, src:source});
 });
 if (S.errors.length > 300) S.errors = S.errors.slice(-300);
 save();
}
const dueErrors = () => S.errors.filter(e => !e.fixed && e.type!=="erkennung" && e.due <= Date.now());
function errProfile(){ const by={}, tags={}; S.errors.filter(e=>e.type!=="erkennung").forEach(e=>{ by[e.type]=(by[e.type]||0)+1; if(e.tag) tags[e.tag]=(tags[e.tag]||0)+(e.fixed?0:1); }); return {by, tags: Object.entries(tags).filter(t=>t[1]>0).sort((a,b)=>b[1]-a[1])}; }

// ---------- Kennzahlen ----------
const avg = (arr, n=10) => { const a=arr.slice(-n); return a.length ? Math.round(a.reduce((s,x)=>s+x.s,0)/a.length*100) : null; };
function skills(){
 const v = vocabStats(); const learned = learnedItems().length;
 const ret = (() => { let ok=0,t=0; for(const k in S.srs){ const c=S.srs[k]; if(c.last){ t++; if(c.l===0||c.r>=2) ok++; } } return t? Math.round(ok/t*100) : null; })();
 return {listen: avg(S.listen), speak: avg(S.speak), grammar: avg(S.quiz.filter(q=>q.g)), vocab: ret, learned, v};
}
function weakest(){ const s=skills(); const c=[["listen",s.listen,"Hörverständnis"],["speak",s.speak,"Sprechen"],["vocab",s.vocab,"Vokabeln"],["grammar",s.grammar,"Grammatik"]].filter(x=>x[1]!==null); if(!c.length) return null; c.sort((a,b)=>a[1]-b[1]); return c[0][1] < 70 ? c[0] : null; }
const BADGES = [
 ["🌱","Erste Lektion",()=>Object.keys(S.done).length>=1],["🔥","3 Tage Serie",()=>streak()>=3],["⚡","7 Tage Serie",()=>streak()>=7],["🏆","30 Tage Serie",()=>streak()>=30],
 ["📚","50 Wörter",()=>vocabStats().pa>=50],["💯","150 Wörter",()=>vocabStats().pa>=150],["⏱️","60 Min. gesamt",()=>totalMin()>=60],["🎧","10 Hörübungen",()=>S.listen.length>=10],
 ["💬","Erstes KI-Gespräch",()=>S.chats>=1],["🧹","5 Fehler behoben",()=>S.errors.filter(e=>e.fixed).length>=5],["📝","Erster Monatstest",()=>Object.keys(S.tests).length>=1],["🌙","Monat 1 geschafft",()=>curWeek().n>4]];

// ---------- Routing ----------
let V = {tab:"home"};
const TABS=[["home","Home","home"],["lernen","Lernen","learn"],["vokabeln","Vokabeln","vocab"],["hoeren","Hören","listen"],["sprechen","Sprechen","speak"],["fortschritt","Fortschritt","stats"]];
function go(tab, extra){ stopAudio(); playing=false; V = Object.assign({tab}, extra||{}); if (!extra) { try { history.replaceState(null,"","#"+tab); } catch(e){} } render(); scrollTo(0,0); }
function renderNav(){ $("#nav").innerHTML = TABS.map(t=>`<button data-act="tab" data-a="${t[0]}" class="${V.tab===t[0]?"on":""}">${ICON[t[2]]}${t[1]}</button>`).join(""); }
function renderTop(){ const el=$("#topbar"); if(!el) return; const m=todayMin(); el.innerHTML = `<div class="logo">Farsi<b>Jun</b></div><span class="sp"></span><span class="chip" title="Lernserie">🔥 ${streak()}</span><span class="chip" title="Heute gelernt" style="color:${m>=10?"var(--tq)":"inherit"}">⏱️ ${m}/10</span>`; }
function shell(body, opts={}){ return (opts.bare ? "" : `<div class="top" id="topbar"></div>`) + body; }
function render(){
 const app=$("#app"); renderNav();
 const f = ({login:vLogin, home:vHome, lernen:vLernen, vokabeln:vVokabeln, hoeren:vHoeren, sprechen:vSprechen, fortschritt:vFortschritt, lesson:vLesson, session:vSession, cards:vCards, quiz:vQuiz, listenEx:vListenEx, chat:vChat, test:vTest, errfix:vErrFix, shadow:vShadow})[V.tab] || vHome;
 app.innerHTML = f(); renderTop();
 document.querySelector("nav").style.display = ["session","cards","quiz","listenEx","test","errfix","shadow","chat","login"].includes(V.tab) ? "none" : "";
 if (V.after) { const fn=V.after; V.after=null; fn(); }
}

// ---------- Bausteine ----------
const ring = (val,max,col="#fff",bg="rgba(255,255,255,.3)") => { const p=Math.min(1,val/max), r=36, C=2*Math.PI*r; return `<svg class="ring" viewBox="0 0 84 84"><circle cx="42" cy="42" r="${r}" fill="none" stroke="${bg}" stroke-width="9"/><circle cx="42" cy="42" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p)}" transform="rotate(-90 42 42)"/><text x="42" y="40" text-anchor="middle" font-weight="900" font-size="20" fill="${col}">${Math.min(val,99)}</text><text x="42" y="56" text-anchor="middle" font-weight="700" font-size="10" fill="${col}">von ${max} Min.</text></svg>`; };
const playBtn = (key, text, big) => `<button class="play${big?" big":""}" data-act="say" data-k="${h(key)}" data-t="${h(text)}" aria-label="Anhören">${ICON.play}</button>`;
const faText = t => S.script && t ? `<div class="fa" style="font-size:18px;color:var(--mut)">${h(t)}</div>` : "";
function itemCard(it, opts={}){
 const ver = S.verified[it.key];
 return `<div class="card">
  <div class="row" style="align-items:flex-start">${playBtn(it.key, it.p)}<div style="flex:1">
   <div class="term">${h(it.f)}</div>${faText(it.p)}
   <div style="font-weight:700;margin-top:2px">${h(it.d)}</div>
   <div class="pron">🗣 ${h(pron(it.f))}</div></div></div>
  <div style="margin-top:10px;padding:10px 12px;background:var(--bg);border-radius:14px">
   <div class="row" style="align-items:flex-start">${playBtn(it.key+"-ex", it.ep)}<div><b>${h(it.ef)}</b>${faText(it.ep)}<div class="mut sm">${h(it.ed)}</div></div></div>
  </div>
  ${it.u?`<p class="sm">💡 ${h(it.u)}</p>`:""}
  ${opts.tools===false?"":`<div class="row wrap" style="margin-top:6px">
   <span class="tag ${ver?"tq":it.ai?"pur":"gold"}">${ver?"✓ Von Muttersprachler bestätigt":it.ai?"KI-generiert · ungeprüft":"Kuratiert · noch nicht von Muttersprachler geprüft"}</span>
   <button class="btn gh small" data-act="verify" data-a="${h(it.key)}">${ver?"Bestätigung zurücknehmen":"Als geprüft markieren"}</button>
   ${MIC_OK ? micBtn("native", it.key, "🎙 "+(REC.has(it.key)?"Aufnahme ersetzen":"Muttersprachler-Audio"), "gh small") : `<label class="btn gh small">🎙 ${REC.has(it.key)?"Aufnahme ersetzen":"Muttersprachler-Audio"}<input type="file" accept="audio/*" hidden data-rec="${h(it.key)}"></label>`}
  </div>`}
 </div>`;
}
const header = (title, back="home") => `<div class="top"><button class="x" data-act="tab" data-a="${back}">${ICON.back}</button><h3 style="margin:0;flex:1">${h(title)}</h3></div>`;
const progBar = (i,n,exit="home") => `<div class="top"><button class="x" data-act="tab" data-a="${exit}">${ICON.x}</button><div class="prog"><i style="width:${Math.round(i/n*100)}%"></i></div><span class="chip">⏱️ ${todayMin()}</span></div>`;
function calendar(){
 const d=new Date(), y=d.getFullYear(), m=d.getMonth(); const first=(new Date(y,m,1).getDay()+6)%7, n=new Date(y,m+1,0).getDate();
 let c = ["Mo","Di","Mi","Do","Fr","Sa","So"].map(x=>`<div class="e">${x}</div>`).join("") + "<div class='e'></div>".repeat(first);
 for (let i=1;i<=n;i++){ const k=today(new Date(y,m,i)), s=S.days[k]||0; c += `<div class="${s>=600?"f":s>0?"p":""} ${k===today()?"t":""}" title="${Math.round(s/60)} Min.">${i}</div>`; }
 return `<div class="cal">${c}</div><div class="row sm mut" style="margin-top:8px;gap:14px"><span>🟧 Tagesziel erreicht</span><span>🟠 angefangen</span></div>`;
}

// ---------- HOME ----------
function vHome(){
 const w=curWeek(), M=MONTHS[w.m-1], m=todayMin(), due=dueCards().length, ed=dueErrors().length, wk=weakest();
 const next = w.lessons.find(id=>!S.done[id]);
 const L = next ? getLesson(next) : null;
 const modeName = {min:"Minimum · 10 Min.", std:"Standard · 20–30 Min.", int:"Intensiv · 45–60 Min."};
 return shell(`
 <div class="hero"><div class="row" style="position:relative;z-index:1">
  ${ring(m,10)}<div style="flex:1"><div style="font-weight:800;opacity:.9;font-size:14px">Heute</div>
  <div style="font-size:21px;font-weight:900;line-height:1.2">${m>=10?"Tagesziel geschafft! 🎉":m>0?"Weiter so – noch "+(10-m)+" Min.":"Salâm! Bereit für heute?"}</div>
  <div style="font-size:13px;opacity:.9;margin-top:4px">🔥 ${streak()} Tage Serie · ${totalMin()} Min. gesamt</div></div></div>
  <button class="btn full" data-act="startSession" style="margin-top:14px;background:#fff;color:var(--pri);box-shadow:0 4px 0 rgba(0,0,0,.15);position:relative;z-index:1">▶ Tagestraining starten</button>
 </div>
 <div class="seg" style="margin-bottom:6px">${["min","std","int"].map(k=>`<button class="${S.mode===k?"on":""}" data-act="mode" data-a="${k}">${{min:"Minimum",std:"Standard",int:"Intensiv"}[k]}</button>`).join("")}</div>
 <p class="sm mut" style="margin:4px 4px 0">${modeName[S.mode]} – das Training passt sich deinem Stand an. Das Tagesziel zählt erst ab 10 echten Lernminuten.</p>
 ${wk?`<div class="note">🎯 Dein schwächster Bereich ist gerade <b>${wk[2]}</b> (${wk[1]} %). Das Tagestraining legt dort heute einen Schwerpunkt.</div>`:""}
 <h2>Dein Weg</h2>
 <button class="week" data-act="${L?"lesson":"tab"}" data-a="${L?L.id:"lernen"}">
  <div class="dot on">${w.n}</div><div style="flex:1"><div class="sm mut" style="font-weight:800">Monat ${w.m} · Woche ${w.n} von 52</div>
  <div style="font-weight:900">${L? h(L.title) : h(w.title)}</div><div class="sm mut">${L? h(L.goal) : (w.lessons[0][0]==="G" && !S.gen[w.lessons[0]] ? "Lektion wird beim Öffnen erstellt" : h(M.goal))}</div></div><span style="font-size:22px">›</span></button>
 <div class="grid2" style="margin-top:12px">
  <button class="stat" data-act="cards" style="text-align:left"><span class="sm mut" style="font-weight:800">Fällig</span><b>${due}</b><span class="sm">Karten wiederholen</span></button>
  <button class="stat" data-act="errfix" style="text-align:left"><span class="sm mut" style="font-weight:800">Fehler</span><b>${ed}</b><span class="sm">zum Üben fällig</span></button>
 </div>
 <h2>Dieser Monat</h2><div class="card">${calendar()}</div>
 ${m<10?`<div class="note tq">⏰ Erinnerung: Heute fehlen noch ${10-m} Minuten bis zum Tagesziel.</div>`:""}
 <p class="sm mut" style="text-align:center;margin-top:18px">${cloudOk?"☁️ Fortschritt wird in deinem Konto gespeichert – auf allen Geräten":"💾 Fortschritt wird auf diesem Gerät gespeichert"}</p>
 `);
}

// ---------- LERNEN ----------
function vLernen(){
 const cw = curWeek();
 return shell(`<h1>Lernpfad</h1><p class="mut">52 Wochen bis zum iranischen Alltagsfarsi. Ziel nach 12 Monaten: B1–B2 im Hören, B1 im Sprechen.</p>
 ${MONTHS.map(M => { const ws=WEEKS.filter(w=>w.m===M.m); const open = M.m===cw.m;
  const testOk = ws[ws.length-1].n < cw.n || ws.every(w=>w.lessons.every(id=>S.done[id]));
  return `<details class="card" ${open?"open":""}><summary><div class="row"><div class="dot ${M.m<cw.m?"ok":M.m===cw.m?"on":""}">${M.m}</div><div style="flex:1"><div style="font-weight:900">${h(M.title)}</div><div class="sm mut">${h(M.goal)}</div></div>${S.tests[M.m]?`<span class="tag tq">Test ${S.tests[M.m].total}%</span>`:""}</div></summary>
  <div style="margin-top:10px">${ws.map(w => { const st=weekState(w); return `<div style="margin:10px 0"><div class="sm mut" style="font-weight:800">Woche ${w.n} · ${h(w.title)}</div>
   ${w.lessons.map(id => { const L=getLesson(id); const done=S.done[id]; const lock = st==="lock";
    return `<button class="week" ${lock?"disabled style='opacity:.55'":""} data-act="lesson" data-a="${id}"><div class="dot ${done?"ok":st==="on"?"on":""}">${done?"✓":lock?"🔒":"▶"}</div><div style="flex:1"><div style="font-weight:800">${L?h(L.title):h(w.title)}</div><div class="sm mut">${L? L.items.length+" Ausdrücke · Dialog · Grammatik" : lock? "Wird freigeschaltet, wenn du hier ankommst" : "Wird mit KI passend zu deinem Stand erstellt"}${L&&id[0]==="G"?" · KI-generiert":""}</div></div></button>`; }).join("")}</div>`; }).join("")}
  <button class="btn ${testOk?"tq":"sec"} full" ${testOk?"":"disabled"} data-act="test" data-a="${M.m}">📝 ${M.m===12?"Abschlusstest":"Monatstest "+M.m}${testOk?"":" (nach Woche "+ws[ws.length-1].n+")"}</button></div></details>`; }).join("")}`);
}
function vLesson(){
 const id=V.id, L=getLesson(id);
 if (!L) return header("Lektion wird erstellt","lernen") + (V.genErr ? `<div class="note red">${h(V.genErr)}</div><button class="btn full" data-act="lesson" data-a="${id}">Nochmal versuchen</button>` : `<div class="card" style="text-align:center"><div class="spin"></div><p>Ich erstelle die Lektion für <b>${h(WEEKS.find(w=>"G"+w.n===id).title)}</b> passend zu deinem Lernstand …</p><p class="sm mut">Das dauert etwa 30–60 Sekunden.</p></div>`);
 const items=lessonItems(id), tab=V.lt||"words";
 return header(L.title,"lernen") + `<p class="mut" style="margin-top:-6px">${h(L.goal)}</p>
 ${id[0]==="G"?`<div class="note">🤖 Diese Lektion wurde von der KI erstellt. Ausdrücke sind nicht von Muttersprachlern geprüft – lass sie dir am besten bestätigen.</div>`:""}
 <div class="seg" style="margin:10px 0">${[["words","Ausdrücke"],["gram","Grammatik"],["dialog","Dialog"],["speak","Sprechen"]].map(t=>`<button class="${tab===t[0]?"on":""}" data-act="lt" data-a="${t[0]}">${t[1]}</button>`).join("")}</div>
 ${tab==="words" ? `<div class="row"><span class="sm mut" style="flex:1">${items.length} Ausdrücke · alle landen in deinem Vokabeltrainer</span><label class="sm row" style="gap:6px"><input type="checkbox" data-act="script" ${S.script?"checked":""}> Schrift</label></div>${items.map(it=>itemCard(it)).join("")}` : ""}
 ${tab==="gram" ? `<div class="card"><h3>${h(L.grammar.title)}</h3><p>${h(L.grammar.text)}</p>${L.grammar.ex.map(e=>`<div class="list"><div class="it"><b style="flex:1">${h(e[0])}</b><span class="mut">${h(e[1])}</span></div></div>`).join("")}</div>
   <div class="card"><h3>So klingt's im Dialog</h3>${L.dialog.lines.slice(0,3).map(l=>`<p><b>${h(l[1])}</b><br><span class="mut sm">${h(l[2])}</span></p>`).join("")}</div>` : ""}
 ${tab==="dialog" ? `<div class="card"><h3>${h(L.dialog.title)}</h3><p class="sm mut">Erst hören, dann lesen. Im Bereich Hören kannst du den Dialog ohne Text trainieren.</p>
   <div class="row wrap" style="margin:8px 0"><button class="btn tq small" data-act="playDialog" data-a="${id}">▶ Ganzen Dialog abspielen</button>${speedSeg()}</div>
   ${L.dialog.lines.map((l,i)=>dLine(l,i,id,true)).join("")}</div>
   <button class="btn full sec" data-act="listenEx" data-a="${id}">🎧 Als Hörübung ohne Text</button>` : ""}
 ${tab==="speak" ? `<div class="card"><h3>Sprechaufgabe</h3><p>${h(L.speak)}</p><p class="sm mut">Schreib oder diktiere deine Antwort – die KI korrigiert sie und zeigt dir, wie es natürlich klingt.</p></div>${checkerBox("lesson:"+id)}` : ""}
 <div style="height:10px"></div>
 <button class="btn full" data-act="lessonQuiz" data-a="${id}">${S.done[id]?"✓ Abgeschlossen · Quiz wiederholen":"Lektion abschließen (Quiz)"}</button>`;
}
const speedSeg = () => `<div class="seg" style="flex:1;min-width:200px">${[["slow","🐢 Langsam"],["normal","Normal"],["fast","🐇 Schnell"]].map(s=>`<button class="${speed===s[0]?"on":""}" data-act="speed" data-a="${s[0]}">${s[1]}</button>`).join("")}</div>`;
const COLORS=["#E2712F","#1F9E8F","#7B5EA7","#E8B021","#D64545"];
function dLine(l,i,base,show){ const sp=[...new Set((V.speakers||[]))]; return `<div class="line" data-line="${i}"><div class="av" style="background:${COLORS[i%2]}">${h(l[0][0])}</div><div class="bub"><div class="row"><div style="flex:1"><div class="sm mut" style="font-weight:800">${h(l[0])}</div>${show?`<b>${h(l[1])}</b>${faText(l[3])}<div class="mut sm">${h(l[2])}</div>`:`<span class="mut">• • •</span>`}</div>${playBtn(base+"-"+i, l[3])}</div></div></div>`; }

// ---------- Prüfer (Sprachkorrektur) ----------
function checkerBox(ctx){
 const r = V.check && V.check.ctx===ctx ? V.check : null;
 return `<div class="card"><h3>✍️ Satz prüfen</h3>
 <textarea class="ta" id="chkIn" placeholder="z. B. man diruz bazar miram … (Umschrift oder persische Schrift)">${h(r?r.input:"")}</textarea>
 <label class="row sm" style="gap:6px;margin:6px 0"><input type="checkbox" id="chkDict" ${r&&r.dict?"checked":""}> Gesprochen (Spracherkennung) – Erkennungsfehler berücksichtigen</label>
 <div class="grid2">${canSpeakIn()&&AI_OK ? micBtn("check", ctx, "🎤 Sprechen") : ""}<button class="btn ${canSpeakIn()&&AI_OK?"sec":"tq"}" style="${canSpeakIn()&&AI_OK?"":"grid-column:span 2"}" data-act="check" data-a="${h(ctx)}" ${AI_OK?"":"disabled"}>${r&&r.loading?'<span class="spin"></span> Prüfe …':"Text prüfen"}</button></div>
 ${canSpeakIn()?`<p class="sm mut" style="margin:6px 0 0">🎤 Sprich auf Persisch – die App erkennt deinen Satz und korrigiert ihn. Unsichere Erkennungen werden nicht als dein Fehler gezählt.</p>`:`<p class="sm mut" style="margin:6px 0 0">🎤 Tipp: Stell deine Handy-Tastatur auf Persisch und nutze das Diktier-Mikrofon.</p>`}
 ${AI_OK?"":`<p class="sm mut">Die KI ist auf dem Server noch nicht eingerichtet.</p>`}
 ${r&&r.err?`<div class="note red">${h(r.err)}</div>`:""}
 ${r&&r.res?checkResult(r.res):""}</div>`;
}
const RATING = {"natürlich":["tq","✓ Natürlich – so sagt man das!"],"korrekt_aber_unnatürlich":["gold","Korrekt, aber so sagt das kein Iraner"],"verständlich_mit_fehlern":["","Verständlich, mit Fehlern"],"zu_formell":["pur","Korrekt, aber zu formell / schriftlich"],"unverständlich":["red","Schwer zu verstehen"]};
function checkResult(r){
 const rt = RATING[r.rating] || ["",r.rating||""];
 return `<div class="pop" style="margin-top:12px">
 <span class="tag ${rt[0]}">${h(rt[1])}</span>
 ${r.praise?`<p>👏 ${h(r.praise)}</p>`:""}
 <p class="sm mut">Verstanden als: „${h(r.understood)}\"</p>
 ${(r.errors||[]).map(e=>`<div class="note ${e.type==="erkennung"?"tq":"red"}"><b>${h(ECAT[e.type]||e.type)}${e.part?": „"+h(e.part)+"\"":""}</b><br>${h(e.explanation)}${e.type==="erkennung"?"<br><i class='sm'>Wird nicht als dein Fehler gezählt.</i>":""}</div>`).join("")}
 ${r.correct_f?`<div class="card" style="background:var(--tqS);box-shadow:none"><div class="sm" style="font-weight:800;color:#0E6B60">Korrekt</div><div class="row">${playBtn("chk-c",r.correct_fa||"")}<div><b>${h(r.correct_f)}</b>${faText(r.correct_fa)}<div class="sm mut">${h(r.correct_de)}</div></div></div></div>`:""}
 ${r.natural_f && norm(r.natural_f)!==norm(r.correct_f)?`<div class="card" style="background:var(--goldS);box-shadow:none"><div class="sm" style="font-weight:800;color:#8A6500">So würde es ein Iraner sagen</div><div class="row">${playBtn("chk-n",r.natural_fa||"")}<div><b>${h(r.natural_f)}</b>${faText(r.natural_fa)}<div class="sm">${h(r.natural_note)}</div></div></div></div>`:""}
 </div>`;
}
async function doCheck(ctx){
 const input = $("#chkIn").value.trim(); const dict = $("#chkDict").checked; if (!input) return;
 V.check = {ctx, input, dict, loading:true}; render();
 const prompt = `Du bist eine freundliche Persischlehrerin aus Teheran für eine deutschsprachige Lernerin. ${levelCtx()}
Aufgabe/Kontext: ${ctx.startsWith("lesson:") ? getLesson(ctx.slice(7)).speak : "freie Übung"}.
Die Lernerin hat folgenden persischen Satz ${dict ? "GESPROCHEN (Text stammt aus automatischer Spracherkennung – seltsame Wörter können Erkennungsfehler sein; markiere sie dann als type 'erkennung' und NICHT als Aussprache- oder Grammatikfehler. Nur wenn ein Fehler eindeutig durch falsche Aussprache entstanden sein muss, nutze 'aussprache' und sag, dass das unsicher ist)" : "geschrieben (Umschrift oder persische Schrift)"}:
"""${input}"""
Bewerte nach gesprochenem Teheraner Alltagspersisch, nicht nach Schriftsprache. ${TRANSLIT}
Antworte NUR mit JSON:
{"understood":"was sie sagen wollte, auf Deutsch","rating":"natürlich|korrekt_aber_unnatürlich|verständlich_mit_fehlern|zu_formell|unverständlich","praise":"ein kurzer ermutigender Satz auf Deutsch","errors":[{"part":"fehlerhafter Teil","type":"grammatik|wortwahl|unnatürlich|aussprache|erkennung","tag":"kurzes Thema, z.B. Vergangenheitsform, Satzstellung, Personalendung, Präposition","explanation":"kurz, freundlich, Deutsch, warum"}],"correct_f":"korrekte Version (Umschrift)","correct_fa":"korrekte Version in persischer Schrift (umgangssprachlich)","correct_de":"deutsche Übersetzung","natural_f":"natürlichste umgangssprachliche Variante (Umschrift)","natural_fa":"dieselbe in persischer Schrift","natural_note":"kurz auf Deutsch, was daran natürlicher ist"}
Wenn alles richtig ist: errors = [].`;
 try {
  const r = await ai(prompt);
  V.check = {ctx, input, dict, res:r};
  const errs = (r.errors||[]).filter(e=>e.type!=="erkennung");
  S.speak.push({d:Date.now(), s: r.rating==="natürlich"?1 : r.rating==="unverständlich"?.2 : Math.max(.3, (r.rating==="verständlich_mit_fehlern"?.75:.85) - errs.length*.1)});
  addErrors(errs.slice(0,1).map(e=>({said: input, correct_f: r.natural_f||r.correct_f, correct_de: r.correct_de, type:e.type, tag:e.tag, explanation:e.explanation})), "check");
  save();
  if (V.onChecked) V.onChecked(r);
 } catch(e){ V.check = {ctx, input, dict, err: aiErr(e)}; }
 render();
}

// ---------- Tagestraining ----------
function buildSession(){
 const n = {min:{rev:10,new:3,lis:1,spk:1,err:0}, std:{rev:25,new:6,lis:2,spk:2,err:3}, int:{rev:45,new:10,lis:3,spk:3,err:5}}[S.mode];
 const wk = weakest(); if (wk && wk[0]==="listen") n.lis++; if (wk && wk[0]==="speak") n.spk++; if (wk && wk[0]==="vocab") { n.rev+=10; n.new=Math.max(2,n.new-2); }
 const due = dueCards();
 // Keine Überforderung: viele fällige Karten → weniger neue
 if (due.length > n.rev*2) n.new = Math.max(1, Math.floor(n.new/2));
 const steps = [];
 if (due.length) steps.push({t:"review", cards: due.slice(0,n.rev)});
 const w=curWeek(); const fresh=[]; for (const wk2 of WEEKS.filter(x=>x.n<=w.n)) for (const id of wk2.lessons) for (const it of lessonItems(id)) if (!S.srs["p:"+it.key]) fresh.push(it.key);
 if (fresh.length) steps.push({t:"new", keys: fresh.slice(0,n.new), i:0});
 const dialogs = WEEKS.filter(x=>x.n<=w.n).flatMap(x=>x.lessons).filter(id=>getLesson(id)).map(String);
 const curL = w.lessons.find(id=>!S.done[id] && getLesson(id)) || dialogs[dialogs.length-1];
 const lisOrder = [curL, ...shuffle(dialogs.filter(d=>d!==curL))].filter(Boolean);
 for (let i=0;i<n.lis && i<lisOrder.length;i++) steps.push({t:"listen", id: lisOrder[i]});
 const de = dueErrors(); if (n.err && de.length) steps.push({t:"errors", ids: de.slice(0,n.err).map(e=>e.id)});
 const spkL = dialogs.length ? [curL, ...shuffle(dialogs)].slice(0,n.spk) : [];
 spkL.forEach(id => steps.push({t:"speak", id}));
 steps.push({t:"done"});
 return steps;
}
function vSession(){
 const s = V.s, st = s.steps[s.i];
 const pb = progBar(s.i, s.steps.length-1);
 const label = {review:"🔁 Wiederholen", new:"✨ Neue Ausdrücke", listen:"🎧 Hörverständnis", errors:"🧹 Fehler üben", speak:"🗣 Sprechen", done:""}[st.t];
 const head = pb + (label?`<div class="sm mut" style="font-weight:800;margin-bottom:6px">${label} · Schritt ${s.i+1} von ${s.steps.length-1}</div>`:"");
 if (st.t==="review") return head + cardUI(st);
 if (st.t==="new") { const it=itemByKey(st.keys[st.i]); return head + `<p class="sm mut">Hör dir den Ausdruck an und sprich ihn laut nach.</p>` + itemCard(it,{tools:false}) + `<button class="btn full" data-act="newNext">${st.i<st.keys.length-1?"Weiter":"Fertig"}</button>`; }
 if (st.t==="listen") return head + listenUI(st);
 if (st.t==="errors") return head + errUI(st);
 if (st.t==="speak") { const L=getLesson(st.id); return head + `<div class="card"><h3>Deine Aufgabe</h3><p>${h(L.speak)}</p><p class="sm mut">Sprich es zuerst laut. Dann schreib oder diktiere es hier.</p></div>${checkerBox("lesson:"+st.id)}<button class="btn full ${V.check&&V.check.res?"":"sec"}" data-act="next">${V.check&&V.check.res?"Weiter":"Überspringen"}</button>`; }
 const m=todayMin();
 return pb + `<div class="card pop" style="text-align:center;padding:28px 16px"><div style="font-size:56px">${m>=10?"🎉":"💪"}</div><h1>${m>=10?"Tagesziel erreicht!":"Training geschafft!"}</h1>
  <p>${m>=10?`Du hast heute ${m} Minuten gelernt. Âfarin!`:`Heute ${m} Min. – noch ${10-m} Min. bis zum Tagesziel. Mach noch eine Runde Wiederholung oder ein Gespräch.`}</p>
  <p class="sm mut">🔥 Serie: ${streak()} Tage</p></div>
  <div class="grid2"><button class="btn sec" data-act="startSession">Noch eine Runde</button><button class="btn" data-act="tab" data-a="home">Fertig</button></div>`;
}
function nextStep(){ stopAudio(); V.check=null; V.s.i++; V.lis=null; if (V.s.steps[V.s.i].t==="done") { save(true); if (todayMin()>=10) confetti(); } render(); scrollTo(0,0); }

// ---------- Karteikarten ----------
function cardUI(st){
 st.j = st.j||0; const ck = st.cards[st.j]; if (!ck) { setTimeout(()=>st.onEnd(),0); return ""; }
 const it = itemByKey(ck.slice(2)), act = ck[0]==="a", flip = st.flip;
 const front = act ? `<span class="tag pur">Aktiv · Sag es auf Persisch</span><div class="term" style="margin-top:8px">${h(it.d)}</div><p class="sm mut">Sprich laut, dann aufdecken.</p>`
                   : `<span class="tag tq">Passiv · Was bedeutet das?</span>${playBtn(it.key,it.p,true)}<div class="term">${h(it.f)}</div>${faText(it.p)}`;
 const back = `<div style="height:1px;background:var(--line);width:100%;margin:6px 0"></div>${act?`${playBtn(it.key,it.p)}<div class="term">${h(it.f)}</div>${faText(it.p)}<div class="pron">🗣 ${h(pron(it.f))}</div>`:`<div style="font-size:20px;font-weight:900">${h(it.d)}</div>`}<p class="sm"><b>${h(it.ef)}</b><br><span class="mut">${h(it.ed)}</span></p>`;
 const c=S.srs[ck]; const iv = q => { if(q===0) return "10 Min."; const r=c.r+1, i= r===1?(q===3?3:1): r===2?(q===1?3:6): Math.round(c.i*c.e*(q===1?.8:q===3?1.3:1)); return i+(i===1?" Tag":" Tage"); };
 return `<div class="sm mut" style="text-align:right">${st.j+1} / ${st.cards.length}</div><div class="card fcard pop">${front}${flip?back:""}</div>
 ${flip?`<div class="rate">${[["Nochmal",0],["Schwer",1],["Gut",2],["Leicht",3]].map(r=>`<button data-act="rate" data-a="${r[1]}">${r[0]}<small>${iv(r[1])}</small></button>`).join("")}</div>`:`<button class="btn full" data-act="flip">Aufdecken</button>`}`;
}
function vCards(){ const st=V.st; return progBar(st.j||0, st.cards.length, "vokabeln") + (st.cards.length ? cardUI(st) : `<div class="card" style="text-align:center"><div style="font-size:48px">✅</div><h3>Alles wiederholt!</h3><p class="mut">Gerade ist nichts fällig. Lerne neue Ausdrücke in einer Lektion.</p></div><button class="btn full" data-act="tab" data-a="vokabeln">Zurück</button>`); }
function startCards(cards, onEnd){ V = {tab:"cards", st:{cards, j:0, flip:false, onEnd: onEnd || (()=>{ toast("Wiederholung abgeschlossen ✓"); go("vokabeln"); })}}; render(); }

// ---------- Quiz ----------
function makeQuiz(items, n, gramIds){
 const pool = allItems().filter(i=>!/[…]/.test(i.f));
 const qs = pick(items, Math.min(n, items.length)).map((it,k) => {
  const others = pick(pool.filter(o=>o.key!==it.key && o.d!==it.d), 3);
  if (k%3===2) return {q:`Wie sagt man „${it.d}\"?`, o: shuffle([it.f, ...others.map(o=>o.f)]), a: it.f, key: it.key, kind:"aktiv"};
  if (k%3===1) return {q:"Hör zu: Was bedeutet das?", audio:[it.key,it.p], o: shuffle([it.d, ...others.map(o=>o.d)]), a: it.d, key: it.key, kind:"hören"};
  return {q:`Was bedeutet „${it.f}\"?`, o: shuffle([it.d, ...others.map(o=>o.d)]), a: it.d, key: it.key, kind:"passiv"};
 });
 (gramIds||[]).forEach(id => GRAMQ.filter(g=>String(g[0])===String(id)).forEach(g => qs.push({q:g[1], o:g[2].slice(), a:g[2][g[3]], kind:"grammatik", g:true})));
 return qs;
}
function startQuiz(qs, title, onEnd){ V = {tab:"quiz", qz:{qs, i:0, ok:0, ans:null, title, res:[], onEnd}}; render(); }
function vQuiz(){
 const z=V.qz, q=z.qs[z.i];
 if (!q) { const pct=Math.round(z.ok/z.qs.length*100); return progBar(1,1) + `<div class="card pop" style="text-align:center;padding:26px"><div style="font-size:54px">${pct>=70?"🏅":"📖"}</div><h1>${pct} %</h1><p>${z.ok} von ${z.qs.length} richtig.</p><p class="mut">${pct>=70?"Stark! Weiter geht's.":"Noch nicht ganz – wiederhole die Lektion und versuch es nochmal (ab 70 % bestanden)."}</p></div><button class="btn full" data-act="quizEnd">Weiter</button>`; }
 return progBar(z.i, z.qs.length, "vokabeln") + `<div class="sm mut" style="font-weight:800">${h(z.title)} · ${q.kind}</div><div class="card"><h3 style="font-size:19px">${h(q.q)}</h3>${q.audio?`<div style="text-align:center;margin:10px">${playBtn(q.audio[0],q.audio[1],true)}</div>`:""}</div>
 ${q.o.map(o=>`<button class="opt ${z.ans!==null?(o===q.a?"ok":o===z.ans?"no":""):""}" data-act="ans" data-a="${h(o)}" ${z.ans!==null?"disabled":""}>${h(o)}</button>`).join("")}
 ${z.ans!==null?`<div class="note ${z.ans===q.a?"tq":"red"}">${z.ans===q.a?"✓ Richtig!":"Richtig wäre: <b>"+h(q.a)+"</b>"}</div><button class="btn full" data-act="qnext">Weiter</button>`:""}`;
}

// ---------- Hören ----------
function listenUI(st){
 const L=getLesson(st.id); const lis = V.lis || (V.lis = {phase:"listen", ans:{}, plays:0});
 const d=L.dialog;
 if (lis.phase==="listen") return `<div class="card" style="text-align:center"><h3>${h(d.title)}</h3><p class="sm mut">Hör zu – ohne Text. ${lis.plays?`(${lis.plays}× gehört)`:"Du darfst mehrmals hören."}</p>
  <button class="play big" style="margin:10px auto" data-act="playDialog" data-a="${st.id}">${ICON.play}</button>${speedSeg()}
  <p class="sm mut" style="margin-top:10px">Tipp: Erst langsam, dann normal, dann schnell.</p></div>
  <div style="display:none">${d.lines.map((l,i)=>`<span data-line="${i}"></span>`).join("")}</div>
  <button class="btn full" data-act="lisQ">Zu den Fragen</button>`;
 if (lis.phase==="q") { const all = d.q.every((_,i)=>lis.ans[i]!==undefined);
  return `<div class="card"><div class="row"><h3 style="flex:1">Was hast du verstanden?</h3><button class="play" data-act="playDialog" data-a="${st.id}">${ICON.play}</button></div></div>
  ${d.q.map((q,i)=>`<div class="card"><b>${i+1}. ${h(q[0])}</b>${q[1].map((o,j)=>`<button class="opt ${lis.ans[i]===j?"ok":""}" style="${lis.ans[i]===j?"background:var(--priS);box-shadow:0 0 0 2px var(--pri) inset":""}" data-act="lisA" data-a="${i}:${j}">${h(o)}</button>`).join("")}</div>`).join("")}
  <button class="btn full" data-act="lisCheck" ${all?"":"disabled"}>Auswerten</button>`; }
 const ok = d.q.filter((q,i)=>lis.ans[i]===q[2]).length;
 return `<div class="card pop" style="text-align:center"><div style="font-size:44px">${ok===d.q.length?"🎯":ok?"👍":"🎧"}</div><h3>${ok} von ${d.q.length} verstanden</h3></div>
 ${d.q.map((q,i)=>`<div class="note ${lis.ans[i]===q[2]?"tq":"red"} sm"><b>${h(q[0])}</b><br>${h(q[1][q[2]])}</div>`).join("")}
 <h2>Transkript & Übersetzung</h2><div class="row wrap"><button class="btn tq small" data-act="playDialog" data-a="${st.id}">▶ Nochmal mit Text</button>${speedSeg()}</div>
 ${d.lines.map((l,i)=>dLine(l,i,st.id,true)).join("")}
 <button class="btn full" data-act="${V.tab==="session"?"next":"tab"}" data-a="hoeren">Weiter</button>`;
}
function vListenEx(){ return header("Hörübung","hoeren") + listenUI(V.st); }
function vHoeren(){
 const w=curWeek(); const ids = WEEKS.filter(x=>x.n<=w.n).flatMap(x=>x.lessons).filter(id=>getLesson(id));
 const la = avg(S.listen);
 return shell(`<h1>Hören</h1><p class="mut">Mindestens 40 % deines Trainings. Erst verstehen, dann lesen.</p>
 ${CFG.tts?`<div class="note tq">🔈 Persische Neural-Stimme aktiv. Muttersprachler-Aufnahmen (🎙 bei jedem Ausdruck) werden immer bevorzugt abgespielt.</div>`: !VOICES.length?`<div class="note">🔈 <b>Keine persische Stimme gefunden.</b> Richte auf dem Server Azure Speech ein (siehe Anleitung) – dann klingt jeder Satz natürlich. Bis dahin: Lass einen Muttersprachler die Ausdrücke einsprechen – bei jedem Ausdruck gibt es „🎙 Muttersprachler-Audio\". Diese Aufnahmen werden immer bevorzugt.</div>`:`<div class="note tq">🔈 Persische Stimme: ${h(VOICES[0].name)}. Eigene Muttersprachler-Aufnahmen werden bevorzugt abgespielt.</div>`}
 <div class="grid2"><div class="stat"><span class="sm mut" style="font-weight:800">Hörverständnis</span><b>${la===null?"–":la+" %"}</b><span class="sm">letzte 10 Übungen</span></div><div class="stat"><span class="sm mut" style="font-weight:800">Übungen</span><b>${S.listen.length}</b><span class="sm">absolviert</span></div></div>
 <h2>Unbekannter Dialog</h2><div class="card"><p>Die KI erstellt einen neuen Dialog mit deinen gelernten Wörtern – in neuem Zusammenhang, mit natürlichen Verkürzungen und Füllwörtern.</p>
 <button class="btn full tq" data-act="genDialog" ${AI_OK?"":"disabled"}>${V.genD?'<span class="spin"></span> Wird erstellt …':"✨ Neuen Dialog erstellen"}</button>${V.genDErr?`<div class="note red">${h(V.genDErr)}</div>`:""}${AI_OK?"":`<p class="sm mut">KI auf dem Server nicht eingerichtet.</p>`}</div>
 <h2>Dialoge aus deinen Lektionen</h2>
 ${ids.map(id=>{const L=getLesson(id); const last=[...S.listen].reverse().find(x=>x.id===id); return `<div class="week"><div class="dot ${last?"ok":""}">🎧</div><div style="flex:1"><div style="font-weight:800">${h(L.dialog.title)}</div><div class="sm mut">${h(L.title)}${last?" · zuletzt "+Math.round(last.s*100)+" %":""}</div></div><button class="btn small" data-act="listenEx" data-a="${id}">Hören</button><button class="btn small sec" data-act="shadow" data-a="${id}">Nachsprechen</button></div>`;}).join("")}
 ${Object.keys(S.gen).filter(k=>k.startsWith("D")).map(id=>`<div class="week"><div class="dot">✨</div><div style="flex:1"><div style="font-weight:800">${h(S.gen[id].dialog.title)}</div><div class="sm mut">KI-generiert</div></div><button class="btn small" data-act="listenEx" data-a="${id}">Hören</button></div>`).join("")}`);
}
async function genDialog(){
 V.genD=true; V.genDErr=null; render();
 const prompt = `Erstelle einen kurzen, realistischen Alltagsdialog in gesprochenem Teheraner Persisch für eine deutschsprachige Lernerin. ${levelCtx()}
Nutze überwiegend die gelernten Ausdrücke in NEUEN Situationen, höchstens 2–3 neue, leicht erschließbare Wörter. Natürliche Verkürzungen und Füllwörter (khob, yani, are dige) passend zum Niveau. 6–9 Zeilen, 2 Sprecher mit iranischen Vornamen. Keine erfundenen Redewendungen – nur gebräuchliche Ausdrücke. ${TRANSLIT}
NUR JSON: {"title":"kurzer deutscher Titel","lines":[["Sprechername","Umschrift","Deutsch","persische Schrift (umgangssprachlich)"]],"q":[["Verständnisfrage auf Deutsch",["Antwort A","Antwort B","Antwort C"],Index der richtigen Antwort 0-2]]} mit genau 3 Fragen.`;
 try { const d = await ai(prompt); if (!d.lines || !d.q) throw {}; const id="D"+Date.now().toString(36); S.gen[id]={id, title:"KI-Dialog", goal:"", items:[], dialog:d}; save(); V.genD=false; go("listenEx",{st:{id}}); }
 catch(e){ V.genD=false; V.genDErr=aiErr(e); render(); }
}
// Shadowing
function vShadow(){
 const L=getLesson(V.id), d=L.dialog, i=V.si||0, l=d.lines[i];
 return progBar(i, d.lines.length, "hoeren") + `<div class="sm mut" style="font-weight:800">🔁 Shadowing · ${h(d.title)} · Satz ${i+1}/${d.lines.length}</div>
 <div class="card" style="text-align:center">${playBtn(V.id+"-"+i, l[3], true)}<div class="term" style="margin-top:8px">${h(l[1])}</div>${faText(l[3])}<div class="mut">${h(l[2])}</div><div class="pron">🗣 ${h(pron(l[1]))}</div></div>
 ${speedSeg()}
 <div class="card"><h3>Jetzt du</h3><p class="sm">Hör den Satz und sprich ihn sofort nach. Nimm dich auf, um Original und deine Aussprache zu vergleichen.</p>
 ${MIC_OK ? micBtn("shadow", V.id+"-"+i, "🎙 Mich aufnehmen", "tq full") : `<label class="btn full tq">🎙 Mich aufnehmen<input type="file" accept="audio/*" capture hidden data-shadow="1"></label>`}
 ${V.myRec?`<div class="grid2" style="margin-top:10px"><button class="btn sec" data-act="say" data-k="${V.id}-${i}" data-t="${h(l[3])}">▶ Original</button><button class="btn sec" data-act="playMine">▶ Ich</button></div>
 ${V.shadowTx!=null?(()=>{const c=compareSpoken(l[3], V.shadowTx); return `<div class="note ${c.score>=80?"tq":""}" style="margin-top:10px"><b>Erkannt: ${c.score} % der Wörter</b><div class="fa" style="font-size:20px;margin:6px 0">${c.html}</div><span class="sm">Rot = nicht erkannt. Das ist nur ein Hinweis – die Spracherkennung kann sich irren, besonders bei Umgangssprache. Vergleiche immer auch mit dem Ohr.</span></div>`;})():""}
 <p class="sm mut">Achte auf: Melodie, langes „â\", „kh\"/„gh\" und die Betonung am Wortende.</p>`:`<p class="sm mut">Deine Aufnahme wird nicht gespeichert${CFG.stt?" – nur kurz zur Erkennung an den Server geschickt":""}.</p>`}</div>
 <div class="grid2"><button class="btn sec" data-act="shadowStep" data-a="-1" ${i?"":"disabled"}>Zurück</button><button class="btn" data-act="shadowStep" data-a="1">${i<d.lines.length-1?"Nächster Satz":"Fertig"}</button></div>`;
}

// ---------- Fehler-Wiederholung ----------
function errUI(st){
 st.j=st.j||0; const e = S.errors.find(x=>x.id===st.ids[st.j]);
 if (!e) return `<div class="card" style="text-align:center"><div style="font-size:44px">🧹</div><h3>Keine Fehler fällig</h3><p class="mut">Super! Fehler aus Korrekturen und Gesprächen tauchen hier nach ein paar Tagen wieder auf.</p></div><button class="btn full" data-act="${V.tab==="session"?"next":"tab"}" data-a="sprechen">Weiter</button>`;
 const r = st.res;
 return `<div class="card"><span class="tag red">${h(ECAT[e.type])}${e.tag?" · "+h(e.tag):""}</span><p class="sm mut" style="margin-top:8px">Du hattest gesagt:</p><p><s>${h(e.said)}</s></p><p class="sm mut">Gemeint war:</p><p style="font-weight:800;font-size:18px">„${h(e.correct_de)}\"</p></div>
 <input class="inp" id="efIn" placeholder="Sag es richtig (Umschrift oder Schrift)" ${r?"disabled":""} value="${h(st.typed||"")}">
 ${r?`<div class="note ${r.ok?"tq":"red"}">${r.ok?"✓ Richtig! ":"Noch nicht ganz. "}Korrekt: <b>${h(e.correct_f)}</b><br><span class="sm">${h(e.expl)}</span></div><button class="btn full" data-act="errNext">Weiter</button>`:`<button class="btn full" style="margin-top:10px" data-act="errCheck">Prüfen</button>`}`;
}
function vErrFix(){ const st=V.st; return progBar(st.j||0, Math.max(1,st.ids.length), "sprechen") + errUI(st); }

// ---------- SPRECHEN ----------
const SCEN = [
 ["friend_m","👨 Iranischer Freund","Du bist Arash, 28, ein lockerer Freund aus Teheran. Duzen, Umgangssprache, etwas Humor."],
 ["friend_f","👩 Iranische Freundin","Du bist Neda, 27, eine herzliche Freundin aus Teheran. Duzen, viele liebe Ausdrücke wie azizam."],
 ["family","👪 Familienmodus: Eltern des Partners","Du spielst die Mutter (Mahin) und manchmal den Vater (Hamid) des iranischen Partners der Lernerin. Herzlich, neugierig, ta'ârof, fragst nach Arbeit, Familie, Essen. Die Lernerin sollte euch siezen. Markiere, wer spricht (z.B. 'Mahin: ...')."],
 ["dinner","🍚 Familienessen","Gemeinsames Abendessen bei der iranischen Familie. Mehrere Familienmitglieder (Mutter, Vater, Tante), drängt zum Weiteressen, ta'ârof, Komplimente. Markiere Sprecher."],
 ["party","🎉 Familienfeier","Eine Familienfeier (z.B. Geburtstag oder Yalda). Verwandte stellen Fragen, machen Witze. Markiere Sprecher."],
 ["restaurant","🍽 Restaurant","Du bist ein Kellner in einem Teheraner Restaurant."],
 ["shop","🛍 Einkaufen","Du bist ein Verkäufer auf dem Basar, freundlich, handelst gern."],
 ["date","📅 Verabredung","Du bist eine Freundin/ein Freund, ihr wollt euch fürs Wochenende verabreden."],
 ["phone","📞 Telefonat","Ein Telefonat mit einer Tante (khâle) aus Teheran, die anruft, um zu plaudern."],
 ["small","☕ Small Talk","Small Talk mit einer neuen Bekanntschaft auf einer Party."]];
function vSprechen(){
 const p=errProfile(), sk=skills(), de=dueErrors().length;
 return shell(`<h1>Sprechen</h1><p class="mut">Rede mit deinem KI-Partner – er antwortet auf Persisch und fasst am Ende deine wichtigsten Fehler zusammen.</p>
 ${AI_OK?"":`<div class="note">Die KI ist auf dem Server noch nicht eingerichtet (ANTHROPIC_API_KEY).</div>`}
 <h2>Gesprächspartner</h2>
 <div class="grid2">${SCEN.map(s=>`<button class="stat" style="text-align:left" data-act="chat" data-a="${s[0]}" ${AI_OK?"":"disabled"}><span style="font-weight:800">${s[1]}</span></button>`).join("")}</div>
 <h2>Satz prüfen</h2>${checkerBox("free")}
 <h2>Dein Fehlerprofil</h2>
 <div class="card">${Object.keys(p.by).length ? Object.entries(p.by).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div style="margin:8px 0"><div class="row sm"><b style="flex:1">${h(ECAT[k])}</b><span>${v}</span></div><div class="bar"><i style="width:${Math.min(100,v*10)}%;background:var(--red)"></i></div></div>`).join("") + (p.tags.length?`<p class="sm" style="margin-top:12px"><b>Deine Baustellen:</b> ${p.tags.slice(0,6).map(t=>`<span class="tag red" style="margin:2px">${h(t[0])} · ${t[1]}</span>`).join(" ")}</p>`:"") : `<p class="mut">Noch keine Fehler gesammelt. Sobald du Sätze prüfen lässt oder mit dem KI-Partner sprichst, entsteht hier dein persönliches Profil.</p>`}
 <p class="sm mut">${S.errors.filter(e=>e.fixed).length} Fehler dauerhaft behoben · Sprechen: ${sk.speak===null?"–":sk.speak+" %"}</p>
 <button class="btn full ${de?"":"sec"}" data-act="errfix">🧹 Fehler üben (${de} fällig)</button></div>`);
}
function vChat(){
 const c=V.chat, sc=SCEN.find(s=>s[0]===c.scen);
 return header(sc[1],"sprechen") + `
 ${c.msgs.map((m,i)=> m.role==="me" ? `<div class="line me"><div class="av" style="background:var(--pri)">Du</div><div class="bub">${m.spoken?"🎤 ":""}<span class="${/[\u0600-\u06ff]/.test(m.text)?"fa":""}">${h(m.text)}</span></div></div>`
  : `<div class="line"><div class="av" style="background:var(--tq)">${h((m.who||"K")[0])}</div><div class="bub"><div class="row" style="align-items:flex-start"><div style="flex:1">${m.who?`<div class="sm mut" style="font-weight:800">${h(m.who)}</div>`:""}<b>${h(m.f)}</b>${faText(m.fa)}${m.show?`<div class="sm mut">${h(m.de)}</div>`:`<button class="btn gh small" style="padding:4px 0" data-act="showDe" data-a="${i}">Übersetzung zeigen</button>`}${m.note?`<div class="note sm" style="margin:6px 0 0">💡 ${h(m.note)}</div>`:""}</div>${playBtn("chat-"+i, m.fa||"")}</div></div></div>`).join("")}
 ${c.loading?`<div class="line"><div class="av" style="background:var(--tq)">…</div><div class="bub"><span class="spin"></span></div></div>`:""}
 ${c.err?`<div class="note red">${h(c.err)}</div>`:""}
 ${c.fb ? `<div class="card pop"><h3>📋 Feedback zum Gespräch</h3><p>${h(c.fb.summary)}</p>${(c.fb.errors||[]).map(e=>`<div class="note red sm"><s>${h(e.said)}</s> → <b>${h(e.correct_f)}</b><br>${h(e.explanation)}</div>`).join("")}${(c.fb.tips||[]).map(t=>`<p class="sm">✅ ${h(t)}</p>`).join("")}<p class="sm mut">Die Fehler wurden in dein Fehlerprofil übernommen und kommen in ein paar Tagen zur Wiederholung.</p></div><button class="btn full" data-act="tab" data-a="sprechen">Fertig</button>`
 : `<div style="position:sticky;bottom:10px;background:var(--bg);padding-top:8px"><textarea class="ta" id="chatIn" style="min-height:60px" placeholder="Antworte auf Persisch … (Umschrift oder Schrift)"></textarea>
  <div class="row" style="margin-top:8px">${canSpeakIn()?micBtn("chat","","🎤","small"):""}<button class="btn sec small" data-act="chatHelp">Hilfe 🇩🇪</button><button class="btn sec small" data-act="chatEnd" ${c.msgs.length>2?"":"disabled"}>Beenden & Feedback</button><span class="sp"></span><button class="btn small" data-act="chatSend" ${c.loading?"disabled":""}>Senden</button></div></div>`}`;
}
function chatPrompt(c, extra){
 const sc=SCEN.find(s=>s[0]===c.scen);
 const hist = c.msgs.map(m => m.role==="me" ? (m.spoken?"Lernerin (gesprochen, per Spracherkennung – kann Erkennungsfehler enthalten): ":"Lernerin: ")+m.text : "Du: "+(m.who?m.who+": ":"")+m.f).join("\n");
 return `Du bist ein Gesprächspartner in einer Persisch-Lernapp. Rolle: ${sc[2]}
Verhalte dich wie ein echter Iraner, nicht wie ein Lehrbuch. Sprich gesprochenes Teheraner Persisch, aber passe Wortschatz und Satzlänge an die Lernerin an (kurze Sätze, überwiegend bekannte Wörter, höchstens 1 neues Wort pro Antwort). ${levelCtx()}
Unterbrich das Gespräch NICHT für Korrekturen. Nur wenn du sie gar nicht verstehst, frag auf Persisch nach. Stelle am Ende fast immer eine Frage, damit das Gespräch weitergeht. ${TRANSLIT}
Bisheriges Gespräch:
${hist || "(noch leer – beginne du das Gespräch passend zur Situation)"}
${extra||""}
NUR JSON: {"who":"Name des Sprechers oder leer","f":"deine Antwort in Umschrift","fa":"in persischer Schrift (umgangssprachlich)","de":"deutsche Übersetzung","note":"nur wenn ein neues Wort/eine Redewendung vorkommt: kurze deutsche Erklärung, sonst leer"}`;
}
async function chatTurn(extra){
 const c=V.chat; c.loading=true; c.err=null; render(); window.scrollTo(0,document.body.scrollHeight);
 try { const r = await ai(chatPrompt(c, extra), "quick"); c.msgs.push({role:"ai", who:r.who||"", f:r.f, fa:r.fa, de:r.de, note:r.note||"", show:false}); }
 catch(e){ c.err=aiErr(e); }
 c.loading=false; render(); window.scrollTo(0,document.body.scrollHeight);
}
async function chatEnd(){
 const c=V.chat; c.loading=true; render();
 const mine = c.msgs.filter(m=>m.role==="me").map(m=>m.text);
 const prompt = `Du bist eine freundliche Persischlehrerin aus Teheran. Analysiere die Äußerungen einer deutschsprachigen Lernerin aus einem Übungsgespräch. ${levelCtx()}
Gesprächsverlauf:\n${c.msgs.map(m=>m.role==="me"?(m.spoken?"Lernerin (gesprochen, Spracherkennung): ":"Lernerin: ")+m.text:"Partner: "+m.f).join("\n")}
Bei gesprochenen Äußerungen: Werte offensichtliche Erkennungsfehler NICHT als Fehler der Lernerin.
Fasse die WICHTIGSTEN Fehler zusammen (max. 5, Kleinigkeiten weglassen). Bewerte nach gesprochenem Teheraner Persisch. Unterscheide grammatik, wortwahl, unnatürlich (korrekt, aber so sagt es kein Iraner / zu formell). ${TRANSLIT}
NUR JSON: {"summary":"2 Sätze Deutsch: was gut lief","errors":[{"said":"was sie gesagt hat","correct_f":"korrekt & natürlich (Umschrift)","correct_de":"deutsche Bedeutung","type":"grammatik|wortwahl|unnatürlich","tag":"kurzes Thema","explanation":"kurz, Deutsch"}],"tips":["1-2 konkrete Tipps"],"score":Zahl 0-100 für Verständlichkeit und Natürlichkeit}`;
 try { const r = await ai(prompt); c.fb=r; addErrors(r.errors, "chat"); S.chats++; if (typeof r.score==="number") S.speak.push({d:Date.now(), s:Math.max(0,Math.min(1,r.score/100))}); save(true); }
 catch(e){ c.err=aiErr(e); }
 c.loading=false; render(); window.scrollTo(0,document.body.scrollHeight);
}

// ---------- VOKABELN ----------
function vVokabeln(){
 const v=vocabStats(), due=dueCards().length, li=learnedItems(), q=V.vq||"";
 const shown = li.filter(i => !q || norm(i.f+" "+i.d).includes(norm(q)));
 return shell(`<h1>Vokabeln</h1>
 <div class="grid2"><div class="stat"><span class="sm mut" style="font-weight:800">Passiv (verstehen)</span><b>${v.pa}</b><span class="sm">${v.ps} sicher</span></div><div class="stat"><span class="sm mut" style="font-weight:800">Aktiv (sagen)</span><b>${v.ac}</b><span class="sm">${v.as} sicher</span></div></div>
 <div class="card"><div class="row"><div style="flex:1"><h3>${due} Karten fällig</h3><p class="sm mut" style="margin:0">Spaced Repetition: Was du gut kannst, kommt seltener.</p></div></div>
 <button class="btn full" style="margin-top:10px" data-act="cards" ${due?"":"disabled"}>🔁 Jetzt wiederholen</button></div>
 <div class="grid2"><button class="btn sec" data-act="vquiz" ${li.length>=4?"":"disabled"}>❓ Quiz (10 Fragen)</button><button class="btn sec" data-act="hardCards" ${li.length?"":"disabled"}>💪 Schwierigste üben</button></div>
 <h2>Dein Wortschatz (${li.length})</h2>
 <input class="inp" id="vq" placeholder="Suchen …" value="${h(q)}" data-act-input="vq">
 <div class="card list" style="margin-top:10px">${shown.length? shown.slice(0,200).map(i=>{const c=S.srs["p:"+i.key], a=S.srs["a:"+i.key]; const lvl = Math.min(c?c.i:0, a?a.i:0); return `<div class="it">${playBtn(i.key,i.p)}<div style="flex:1"><b>${h(i.f)}</b><div class="sm mut">${h(i.d)}</div></div><span class="tag ${lvl>=21?"tq":lvl>=3?"gold":""}">${lvl>=21?"sicher":lvl>=3?"lernend":"neu"}</span></div>`;}).join("") : `<p class="mut">${li.length?"Nichts gefunden.":"Noch keine Wörter – starte das Tagestraining oder eine Lektion."}</p>`}</div>`);
}

// ---------- TESTS ----------
async function startTest(m){
 const ws=WEEKS.filter(w=>w.m<=m && (m===12 || w.m===m)); const ids=ws.flatMap(w=>w.lessons).filter(id=>getLesson(id));
 const items=ids.flatMap(lessonItems); if (items.length<4) { toast("Für diesen Test fehlen noch Lektionen."); return; }
 V = {tab:"test", t:{m, phase:"intro", ids}}; render();
}
function vTest(){
 const t=V.t;
 if (t.phase==="intro") return header(t.m===12?"Abschlusstest":"Monatstest "+t.m,"lernen") + `<div class="card"><h3>So läuft der Test</h3><p>1. Wortschatz (passiv & aktiv) · 2. Grammatik · 3. Hörverständnis mit einem <b>unbekannten Dialog</b>.</p><p class="sm mut">Das Hörverständnis wird separat bewertet. Ab 70 % bestanden.</p></div>
 <button class="btn full" data-act="testGo" ${t.loading?"disabled":""}>${t.loading?'<span class="spin"></span> Unbekannter Dialog wird erstellt …':"Test starten"}</button>`;
 if (t.phase==="listen") return progBar(1,2,"lernen") + `<div class="sm mut" style="font-weight:800">Teil 3: Hörverständnis ${t.unknown?"· unbekannter Dialog":"· Dialog aus deinen Lektionen (KI nicht verfügbar)"}</div>` + listenUI({id:t.lid});
 const tot=t.res.total; return header("Ergebnis","lernen") + `<div class="card pop" style="text-align:center"><div style="font-size:54px">${tot>=70?"🏆":"📖"}</div><h1>${tot} %</h1><p>${tot>=70?"Bestanden! Âfarin!":"Noch nicht bestanden – wiederhole die Inhalte und probier's nochmal."}</p></div>
 <div class="card">${Object.entries(t.res.sec).map(([k,v])=>`<div style="margin:8px 0"><div class="row sm"><b style="flex:1">${h(k)}</b><span>${v} %</span></div><div class="bar"><i style="width:${v}%;background:${v>=70?"var(--tq)":"var(--pri)"}"></i></div></div>`).join("")}</div>
 <button class="btn full" data-act="tab" data-a="fortschritt">Zum Fortschritt</button>`;
}
async function testGo(){
 const t=V.t; t.loading=true; render();
 const items=t.ids.flatMap(lessonItems);
 // Unbekannter Dialog per KI, sonst Lektionsdialog
 let lid=null;
 if (AI_OK) { try { const d = await ai(`Erstelle einen UNBEKANNTEN Hörverständnis-Testdialog (8-10 Zeilen) in gesprochenem Teheraner Persisch für Monat ${t.m} einer 12-Monats-Lernreise. Nutze Wortschatz aus: ${items.slice(0,90).map(i=>i.f).join(", ")}. Neue Situation, natürliche Verkürzungen, 2-3 Sprecher. ${TRANSLIT}
NUR JSON: {"title":"Titel Deutsch","lines":[["Name","Umschrift","Deutsch","persische Schrift"]],"q":[["Frage Deutsch",["A","B","C"],0]]} mit genau 4 Fragen.`); if (d.lines&&d.q) { lid="D"+Date.now().toString(36); S.gen[lid]={id:lid,title:"Testdialog",goal:"",items:[],dialog:d}; t.unknown=true; } } catch(e){} }
 if (!lid) lid = shuffle(t.ids)[0];
 t.lid=lid; t.loading=false;
 const qs = makeQuiz(items, 10, t.ids);
 startQuiz(qs, "Teil 1–2: Wortschatz & Grammatik", z => {
  const sec = {}; const kinds = {"Wortschatz passiv":["passiv","hören"], "Wortschatz aktiv":["aktiv"], "Grammatik":["grammatik"]};
  for (const [name,ks] of Object.entries(kinds)) { const r=z.res.filter(x=>ks.includes(x.kind)); if (r.length) sec[name]=Math.round(r.filter(x=>x.ok).length/r.length*100); }
  t.sec=sec; t.phase="listen"; V={tab:"test", t}; V.lis=null; render();
 });
}
function finishTestListen(ok, n){
 const t=V.t; t.sec["Hörverständnis"]=Math.round(ok/n*100);
 const vals=Object.values(t.sec); t.res={sec:t.sec, total: Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)};
 S.tests[t.m]={total:t.res.total, sec:t.sec, d:Date.now()}; save(true); t.phase="res"; if (t.res.total>=70) confetti();
}

// ---------- FORTSCHRITT ----------
function vFortschritt(){
 const sk=skills(), v=sk.v, w=curWeek(); const tgtM = Object.keys(VTARGET).map(Number).find(m=>m>=w.m)||12; const tgt=VTARGET[tgtM];
 const last7 = [...Array(7)].map((_,i)=>{const d=new Date(Date.now()-(6-i)*DAY); return [d.toLocaleDateString("de-DE",{weekday:"short"}).slice(0,2), Math.round((S.days[today(d)]||0)/60)];});
 const mx = Math.max(10,...last7.map(x=>x[1]));
 const sb = (n,v,col) => `<div style="margin:10px 0"><div class="row sm"><b style="flex:1">${n}</b><span>${v===null?"noch keine Daten":v+" %"}</span></div><div class="bar"><i style="width:${v||0}%;background:${col}"></i></div></div>`;
 return shell(`<h1>Fortschritt</h1>
 <div class="grid2"><div class="stat"><span class="sm mut" style="font-weight:800">Serie</span><b>🔥 ${streak()}</b><span class="sm">Tage am Stück</span></div><div class="stat"><span class="sm mut" style="font-weight:800">Lernzeit</span><b>${totalMin()}</b><span class="sm">Minuten gesamt</span></div>
 <div class="stat"><span class="sm mut" style="font-weight:800">Woche</span><b>${w.n}/52</b><span class="sm">Monat ${w.m}</span></div><div class="stat"><span class="sm mut" style="font-weight:800">Lektionen</span><b>${Object.keys(S.done).length}</b><span class="sm">abgeschlossen</span></div></div>
 <h2>Letzte 7 Tage</h2><div class="card"><div class="row" style="align-items:flex-end;height:120px;gap:8px">${last7.map(x=>`<div style="flex:1;text-align:center"><div style="height:${Math.max(4,x[1]/mx*90)}px;border-radius:8px;background:${x[1]>=10?"var(--pri)":"var(--pri2)"};opacity:${x[1]?1:.25}"></div><div class="sm mut" style="font-weight:800">${x[0]}</div></div>`).join("")}</div><div class="sm mut" style="margin-top:6px">Minuten pro Tag · Tagesziel 10 Min.</div></div>
 <h2>Fähigkeiten</h2><div class="card">
  ${sb("🎧 Hörverständnis", sk.listen, "var(--tq)")}${sb("🗣 Sprechen & Natürlichkeit", sk.speak, "var(--pri)")}${sb("🧠 Vokabeln (Behaltensquote)", sk.vocab, "var(--pur)")}${sb("📐 Grammatik", sk.grammar, "var(--gold)")}
  ${weakest()?`<div class="note">🎯 Du liegst bei <b>${weakest()[2]}</b> zurück. Dein Tagestraining wird automatisch angepasst.</div>`:""}</div>
 <h2>Wortschatz</h2><div class="card"><div class="row sm"><b style="flex:1">Passiv: ${v.pa} · Aktiv: ${v.ac}</b><span>Ziel Monat ${tgtM}: ${tgt}</span></div><div class="bar" style="margin-top:6px"><i style="width:${Math.min(100,v.pa/tgt*100)}%;background:var(--tq)"></i></div><div class="bar" style="margin-top:6px"><i style="width:${Math.min(100,v.ac/tgt*100)}%;background:var(--pur)"></i></div><p class="sm mut">Orientierung: Monat 2 ≈ 450, Monat 6 ≈ 1.650, Monat 12 ≈ 3.250 Wörter & Ausdrücke.</p></div>
 <h2>Monatstests</h2><div class="card">${MONTHS.map(M=>`<div class="row" style="margin:6px 0"><span style="flex:1;font-weight:700">${M.m===12?"Abschlusstest":"Monat "+M.m}</span>${S.tests[M.m]?`<span class="tag ${S.tests[M.m].total>=70?"tq":""}">${S.tests[M.m].total} % · Hören ${S.tests[M.m].sec["Hörverständnis"]??"–"} %</span>`:`<span class="sm mut">offen</span>`}</div>`).join("")}</div>
 <h2>Erfolge</h2><div class="card" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${BADGES.map(b=>`<div class="badge ${b[2]()?"on":""}"><span>${b[0]}</span>${b[1]}</div>`).join("")}</div>
 <h2>Kalender</h2><div class="card">${calendar()}</div>
 <h2>Einstellungen</h2><div class="card"><label class="row" style="gap:8px"><input type="checkbox" data-act="script" ${S.script?"checked":""}> Persische Schrift anzeigen</label>
 ${USER?`<p class="sm" style="margin-top:12px">Angemeldet als <b>${h(USER.email)}</b></p><button class="btn sec small" data-act="logout">Abmelden</button>`:""}
 <details style="margin-top:12px"><summary class="sm" style="color:var(--red)">Fortschritt zurücksetzen …</summary><p class="sm">Löscht alle Lernstände, Statistiken und Fehler unwiderruflich.</p><button class="btn small" style="background:var(--red);box-shadow:0 4px 0 #9B2C2C" data-act="reset">Endgültig zurücksetzen</button></details></div>`);
}

// ---------- Lektion per KI erzeugen ----------
async function genLesson(id){
 const w = WEEKS.find(x=>"G"+x.n===id); const M=MONTHS[w.m-1]; V.genErr=null;
 const prompt = `Erstelle Lektion für Woche ${w.n} von 52 einer Persisch-Lernapp (iranisches Alltagsfarsi, Teheraner Umgangssprache) für eine deutschsprachige Lernerin. Monat ${w.m}: „${M.title}\" – Ziel: ${M.goal}. Wochenthema: „${w.title}\". ${levelCtx()}
Anforderungen: 14 neue, wirklich häufig gebrauchte Ausdrücke (keine Wiederholung bekannter), passend zum Niveau. Verwende NUR tatsächlich gebräuchliche Ausdrücke, erfinde keine Redewendungen. Praxisnahe Grammatik mit gesprochenen Beispielen (kurz!). Ein natürlicher Dialog (7–10 Zeilen, ab Monat 5 mit Füllwörtern und Verkürzungen, ab Monat 7 mit 3 Sprechern). ${TRANSLIT}
NUR JSON:
{"title":"kurzer deutscher Titel","goal":"1 Satz Lernziel","grammar":{"title":"...","text":"2-3 Sätze Deutsch","ex":[["Umschrift","Deutsch"]]},
"items":[["Umschrift","Deutsch","persische Schrift (umgangssprachlich)","Beispielsatz Umschrift","Beispielsatz Deutsch","Beispielsatz persische Schrift","Verwendung: wann/wie, Register (1 Satz Deutsch)"]],
"dialog":{"title":"...","lines":[["Name","Umschrift","Deutsch","persische Schrift"]],"q":[["Frage Deutsch",["A","B","C"],0]]},
"speak":"Sprechaufgabe auf Deutsch"} – dialog.q genau 3 Fragen.`;
 try { const L = await ai(prompt, "complex"); if (!L.items || !L.dialog) throw {}; L.id=id; S.gen[id]=L; lessonItems(id).forEach(it=>addSRS(it.key)); save(true); }
 catch(e){ V.genErr = aiErr(e); }
 if (V.tab==="lesson" && V.id===id) render();
}


// ---------- LOGIN ----------
function vLogin(){
 const L = V.login || (V.login = {step:"mail"});
 return `<div style="text-align:center;padding:40px 8px 10px"><div style="font-size:64px">🌸</div><div class="logo" style="font-size:34px">Farsi<b>Jun</b></div><p class="mut">Iranisches Alltagsfarsi in 12 Monaten</p></div>
 <div class="card">${L.step==="mail" ? `<h3>Anmelden</h3><p class="sm mut">Wir schicken dir einen 6-stelligen Code per E-Mail. Kein Passwort nötig.</p>
  <input class="inp" id="lgMail" type="email" autocomplete="email" placeholder="deine@email.de" value="${h(L.mail||"")}">
  <button class="btn full" style="margin-top:10px" data-act="sendCode" ${L.busy?"disabled":""}>${L.busy?'<span class="spin"></span>':"Code senden"}</button>`
 : `<h3>Code eingeben</h3><p class="sm mut">Wir haben einen Code an <b>${h(L.mail)}</b> geschickt.</p>
  <input class="inp" id="lgCode" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" style="font-size:24px;letter-spacing:6px;text-align:center">
  <button class="btn full" style="margin-top:10px" data-act="verifyCode" ${L.busy?"disabled":""}>${L.busy?'<span class="spin"></span>':"Anmelden"}</button>
  <button class="btn gh full" data-act="tab" data-a="login">Andere E-Mail</button>`}
 ${L.err?`<div class="note red">${h(L.err)}</div>`:""}</div>`;
}
async function sendCode(){
 const mail=$("#lgMail").value.trim(); if(!/^\S+@\S+\.\S+$/.test(mail)) { V.login.err="Bitte eine gültige E-Mail eingeben."; return render(); }
 V.login={step:"mail", mail, busy:true}; render();
 const {error} = await SB.auth.signInWithOtp({email:mail, options:{shouldCreateUser:true}});
 V.login = error ? {step:"mail", mail, err:"Senden hat nicht geklappt: "+error.message} : {step:"code", mail}; render();
}
async function verifyCode(){
 const token=$("#lgCode").value.replace(/\D/g,""); const mail=V.login.mail; if(token.length<6) return;
 V.login.busy=true; V.login.err=null; render();
 const {data, error} = await SB.auth.verifyOtp({email:mail, token, type:"email"});
 if (error) { V.login={step:"code", mail, err:"Code ungültig oder abgelaufen."}; return render(); }
 await onLogin(data.user);
}

// ---------- Aktionen ----------
const ACT = {
 tab: a => { if (a==='login') { V={tab:'login'}; return render(); } go(a); },
 say: (a, el) => playKey(el.dataset.k, el.dataset.t),
 mode: a => { S.mode=a; save(); render(); },
 script: (a, el) => { S.script = el.checked; save(); render(); },
 speed: a => { speed=a; stopAudio(); render(); },
 verify: a => { if (S.verified[a]) delete S.verified[a]; else S.verified[a]=true; save(); render(); },
 lesson: a => { V={tab:"lesson", id:a, lt:"words"}; render(); scrollTo(0,0); const L=getLesson(a); if (!L) { if (!AI_OK) { V.genErr="Für diese Woche wird eine KI-Lektion erstellt – die KI ist auf dem Server aber noch nicht eingerichtet."; render(); } else genLesson(a); } else lessonItems(a).forEach(it => { if(!S.srs["p:"+it.key]) addSRS(it.key); }), save(); },
 lt: a => { V.lt=a; V.check=null; stopAudio(); render(); },
 playDialog: a => { if (playing) { playing=false; stopAudio(); return; } if (V.lis) V.lis.plays++; playLines(getLesson(a).dialog.lines, a); },
 lessonQuiz: a => { const id=a; startQuiz(makeQuiz(lessonItems(id), 8, [id]), getLesson(id).title, z => { const pct=z.ok/z.qs.length; if (pct>=.7 && !S.done[id]) { S.done[id]=Date.now(); confetti(); toast("Lektion abgeschlossen! 🎉"); } save(true); go("lernen"); }); },
 startSession: () => { V={tab:"session", s:{steps: buildSession(), i:0}}; const s=V.s; s.steps.forEach(st=>{ if(st.t==="review") st.onEnd=()=>nextStep(); }); render(); },
 next: () => nextStep(),
 newNext: () => { const st=V.s.steps[V.s.i]; addSRS(st.keys[st.i]); save(); if (st.i < st.keys.length-1) { st.i++; render(); scrollTo(0,0); } else nextStep(); },
 flip: () => { const st = V.tab==="session" ? V.s.steps[V.s.i] : V.st; st.flip=true; render(); const it=itemByKey(st.cards[st.j].slice(2)); if (st.cards[st.j][0]==="a") playKey(it.key, it.p); },
 rate: a => { const st = V.tab==="session" ? V.s.steps[V.s.i] : V.st; const ck=st.cards[st.j]; rateCard(ck, +a); if (+a===0 && st.cards.filter(x=>x===ck).length<3) st.cards.push(ck); st.j++; st.flip=false; if (st.j>=st.cards.length) st.onEnd(); else { render(); const nk=st.cards[st.j]; if(nk[0]==="p"){ const it=itemByKey(nk.slice(2)); playKey(it.key,it.p); } } },
 cards: () => startCards(dueCards().slice(0,50)),
 hardCards: () => { const ks=Object.keys(S.srs).filter(k=>itemByKey(k.slice(2))).sort((a,b)=>(S.srs[b].l-S.srs[a].l)||(S.srs[a].e-S.srs[b].e)).slice(0,15); startCards(ks); },
 vquiz: () => startQuiz(makeQuiz(learnedItems(), 10), "Vokabelquiz", z => { save(); go("vokabeln"); }),
 ans: a => { const z=V.qz, q=z.qs[z.i]; z.ans=a; const ok = a===q.a; if (ok) z.ok++; z.res.push({kind:q.kind, ok}); S.quiz.push({d:Date.now(), s:ok?1:0, g:!!q.g}); if (S.quiz.length>500) S.quiz=S.quiz.slice(-500); if (q.key){ const c=S.srs[(q.kind==="aktiv"?"a:":"p:")+q.key]; if (c && !ok) { c.due=Math.min(c.due, Date.now()); c.l++; } } render(); },
 qnext: () => { const z=V.qz; z.i++; z.ans=null; render(); const q=z.qs[z.i]; if (q && q.audio) playKey(q.audio[0], q.audio[1]); },
 quizEnd: () => { const z=V.qz; save(); z.onEnd(z); },
 listenEx: a => { V={tab:"listenEx", st:{id:a}}; render(); scrollTo(0,0); },
 lisQ: () => { stopAudio(); playing=false; V.lis.phase="q"; render(); },
 lisA: a => { const [i,j]=a.split(":").map(Number); V.lis.ans[i]=j; render(); },
 lisCheck: () => { const id = V.tab==="session" ? V.s.steps[V.s.i].id : V.tab==="test" ? V.t.lid : V.st.id; const d=getLesson(id).dialog; const ok=d.q.filter((q,i)=>V.lis.ans[i]===q[2]).length; S.listen.push({d:Date.now(), id, s: ok/d.q.length, plays: V.lis.plays}); V.lis.phase="res"; save(); if (V.tab==="test") { finishTestListen(ok, d.q.length); } render(); scrollTo(0,0); },
 genDialog: () => genDialog(),
 shadow: a => { V={tab:"shadow", id:a, si:0}; render(); },
 shadowStep: a => { const L=getLesson(V.id); V.si=(V.si||0)+(+a); V.myRec=null; V.shadowTx=null; if (V.si>=L.dialog.lines.length) { toast("Shadowing geschafft! 🎙"); go("hoeren"); return; } render(); const l=L.dialog.lines[V.si]; playKey(V.id+"-"+V.si, l[3]); },
 playMine: () => { if (V.myRec) { stopAudio(); curAudio=new Audio(V.myRec); curAudio.play().catch(()=>{}); } },
 check: a => doCheck(a),
 chat: a => { V={tab:"chat", chat:{scen:a, msgs:[]}}; render(); chatTurn(); },
 chatSend: () => { const t=$("#chatIn").value.trim(); if(!t) return; V.chat.msgs.push({role:"me", text:t}); chatTurn(); },
 chatHelp: () => { const t=$("#chatIn").value.trim(); chatTurn(`Die Lernerin braucht Hilfe${t?` und möchte auf Deutsch sagen: "${t}"`:""}. Gib in "note" auf Deutsch einen kurzen Vorschlag, was sie antworten könnte (mit Umschrift), und wiederhole in "f" deine letzte Frage einfacher.`); },
 showDe: a => { V.chat.msgs[+a].show=true; render(); },
 chatEnd: () => chatEnd(),
 errfix: () => { const ids=dueErrors().slice(0,10).map(e=>e.id); V={tab:"errfix", st:{ids, j:0}}; render(); },
 errCheck: () => { const st = V.tab==="session" ? V.s.steps[V.s.i] : V.st; const e=S.errors.find(x=>x.id===st.ids[st.j]); st.typed=$("#efIn").value; const ok = sim(st.typed, e.correct_f) >= .8; st.res={ok}; if (ok) { e.stage++; e.due=Date.now()+[2,5,12,30][Math.min(e.stage,3)]*DAY; if (e.stage>=3) { e.fixed=true; toast("Fehler dauerhaft behoben! 🧹"); } } else { e.stage=0; e.due=Date.now()+DAY; } save(); render(); },
 errNext: () => { const st = V.tab==="session" ? V.s.steps[V.s.i] : V.st; st.j++; st.res=null; st.typed=""; if (st.j>=st.ids.length) { if (V.tab==="session") nextStep(); else { toast("Fehlerübung abgeschlossen ✓"); go("sprechen"); } } else render(); },
 test: a => startTest(+a),
 testGo: () => testGo(),
 rec: (a, el) => toggleRec(a, el.dataset.k),
 logout: () => logout(),
 sendCode: () => sendCode(),
 verifyCode: () => verifyCode(),
 reset: () => { S=DEF(); save(true); go("home"); toast("Zurückgesetzt."); }
};
document.addEventListener("click", e => { const el=e.target.closest("[data-act]"); if (!el || el.disabled) return; if (el.tagName==="INPUT") return; const f=ACT[el.dataset.act]; if (f) { e.preventDefault(); f(el.dataset.a, el); } });
document.addEventListener("change", async e => {
 const el=e.target;
 if (el.dataset.act==="script") return ACT.script(null, el);
 if (el.dataset.rec && el.files[0]) { const k=el.dataset.rec; try { await saveRecording(k, el.files[0]); toast("Aufnahme gespeichert – wird ab jetzt abgespielt ✓"); render(); } catch(err){ toast("Speichern hat nicht geklappt."); } }
 if (el.dataset.shadow && el.files[0]) { V.myRec = URL.createObjectURL(el.files[0]); render(); }
});
document.addEventListener("keydown", e => { if (e.key!=="Enter") return; if (e.target.id==="lgMail") sendCode(); if (e.target.id==="lgCode") verifyCode(); });
document.addEventListener("input", e => { if (e.target.dataset.actInput==="vq") { V.vq=e.target.value; const pos=e.target.selectionStart; render(); const n=$("#vq"); n.focus(); n.setSelectionRange(pos,pos); } });
// Session-Schritte für Karten
addEventListener("hashchange", () => { if (V.tab==="login") return; const t=location.hash.slice(1); if (TABS.some(x=>x[0]===t) && V.tab!==t) go(t); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState==="hidden") { lsSet(); flush(); } });

// ---------- Start ----------
(function boot(){
 const local = lsGet(); if (local) S = Object.assign(DEF(), local);
 const t=location.hash.slice(1); if (TABS.some(x=>x[0]===t)) V.tab=t;
 render(); initCloud();
 if ('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('/sw.js').catch(()=>{});
})();
