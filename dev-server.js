// Lokaler Testserver: node dev-server.js  →  http://localhost:3000
// Liest .env, liefert public/ aus und leitet /api/* an die Funktionen in api/ weiter (wie Vercel).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
if (fs.existsSync(path.join(root, ".env"))) {
  for (const line of fs.readFileSync(path.join(root, ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname.startsWith("/api/")) {
    const name = url.pathname.slice(5).replace(/[^a-z]/g, "");
    const file = path.join(root, "api", name + ".js");
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    let body = ""; for await (const c of req) body += c;
    try { req.body = body ? JSON.parse(body) : {}; } catch { req.body = {}; }
    res.status = c => { res.statusCode = c; return res; };
    res.json = o => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); };
    res.send = b => res.end(b);
    try { (await import(pathToFileURL(file).href)).default(req, res); }
    catch (e) { console.error(e); res.statusCode = 500; res.end(); }
    return;
  }
  let p = path.join(root, "public", url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname));
  if (!p.startsWith(path.join(root, "public")) || !fs.existsSync(p)) { res.writeHead(404); return res.end("Nicht gefunden"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(process.env.PORT || 3000, () => console.log("Farsi Jun läuft auf http://localhost:" + (process.env.PORT || 3000)));
