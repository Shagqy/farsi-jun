// KI-Anfragen (Gesprächspartner, Korrektur, Lektionen, Dialoge) über die Anthropic-API.
// Der API-Schlüssel bleibt auf dem Server.
import { requireUser, rateLimit, onlyPost } from "./_lib.js";

export const config = { maxDuration: 60 };

const MODELS = {
  quick: process.env.MODEL_QUICK || "claude-haiku-5-5",
  default: process.env.MODEL_DEFAULT || "claude-sonnet-5-5",
  complex: process.env.MODEL_COMPLEX || "claude-sonnet-5-5",
};

export default async function handler(req, res) {
  if (!onlyPost(req, res)) return;
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "not_configured" });
  const user = await requireUser(req, res); if (!user) return;
  if (!rateLimit("ai:" + user.id)) return res.status(429).json({ error: "rate_limited" });

  const { prompt, tier } = req.body || {};
  if (typeof prompt !== "string" || !prompt || prompt.length > 30000) return res.status(400).json({ error: "bad_request" });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODELS[tier] || MODELS.default,
      max_tokens: tier === "complex" ? 8000 : 2500,
      system: "Du bist Teil einer Persisch-Lernapp. Antworte ausschließlich mit gültigem JSON, ohne Markdown-Codeblöcke und ohne Text davor oder danach.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) {
    console.error("Anthropic", r.status, await r.text());
    return res.status(r.status === 429 ? 429 : 502).json({ error: r.status === 429 ? "rate_limited" : "upstream" });
  }
  const data = await r.json();
  const text = (data.content || []).map(c => c.text || "").join("");
  const m = text.match(/\{[\s\S]*\}/);
  try { res.status(200).json({ result: JSON.parse(m ? m[0] : text) }); }
  catch (e) { console.error("JSON parse", text.slice(0, 500)); res.status(502).json({ error: "parse" }); }
}
