// Gemeinsame Hilfen für alle API-Funktionen

// Akzeptiert die volle URL oder nur die Projekt-ID (z. B. "abcd1234") und macht daraus https://abcd1234.supabase.co
export function supabaseUrl() {
  let u = String(process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = u.includes(".") ? "https://" + u : "https://" + u + ".supabase.co";
  return u;
}

// Prüft das Supabase-Login-Token und (optional) die erlaubten E-Mails.
// Ohne SUPABASE_URL (lokale Entwicklung) ist kein Login nötig.
export async function requireUser(req, res) {
  const url = supabaseUrl(), anon = String(process.env.SUPABASE_ANON_KEY || "").trim();
  if (!url) return { id: "local", email: "local" };
  const token = String(req.headers.authorization || "").replace(/^Bearer /i, "");
  if (!token) { res.status(401).json({ error: "login" }); return null; }
  const r = await fetch(url + "/auth/v1/user", { headers: { Authorization: "Bearer " + token, apikey: anon } });
  if (!r.ok) { res.status(401).json({ error: "login" }); return null; }
  const user = await r.json();
  const allow = (process.env.ALLOWED_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  if (allow.length && !allow.includes(String(user.email || "").toLowerCase())) { res.status(403).json({ error: "forbidden" }); return null; }
  return user;
}

// Einfache Begrenzung pro Nutzer (pro Server-Instanz) gegen versehentliche Kostenexplosion
const hits = new Map();
export function rateLimit(key, max = 80, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (arr.length >= max) { hits.set(key, arr); return false; }
  arr.push(now); hits.set(key, arr); return true;
}

export function onlyPost(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "method" }); return false; }
  return true;
}
