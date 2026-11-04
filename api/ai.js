// KI-Anfragen (Gesprächspartner, Korrektur, Lektionen, Dialoge).
// Nutzt Anthropic (Claude), falls ANTHROPIC_API_KEY gesetzt ist – sonst OpenAI (OPENAI_API_KEY).
// Die API-Schlüssel bleiben auf dem Server.
import { requireUser, rateLimit, onlyPost } from "./_lib.js";

export const config = { maxDuration: 60 };

const SYSTEM = "Du bist Teil einer Persisch-Lernapp. Antworte ausschließlich mit gültigem JSON, ohne Markdown-Codeblöcke und ohne Text davor oder danach.";
const OPENAI_MODELS = {
  quick: process.env.OPENAI_MODEL_QUICK || process.env.OPENAI_MODEL || "gpt-4.1-mini",
  default: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  complex: process.env.OPENAI_MODEL_COMPLEX || process.env.OPENAI_MODEL || "gpt-4.1-mini",
};
const MODELS = {
  quick: process.env.MODEL_QUICK || "claude-haiku-5-5",
  default: process.env.MODEL_DEFAULT || "claude-sonnet-5-5",
  complex: process.env.MODEL_COMPLEX || "claude-sonnet-5-5",
};

async function askClaude(prompt, tier) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODELS[tier] || MODELS.default, max_tokens: tier === "complex" ? 8000 : 2500, system: SYSTEM, messages: [{ role: "user", content: prompt }] }),
  });
  if (!r.ok) { console.error("Anthropic", r.status, await r.text()); throw r.status; }
  const data = await r.json();
  return (data.content || []).map(c => c.text || "").join("");
}

async function askOpenAI(prompt, tier) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      model: OPENAI_MODELS[tier] || OPENAI_MODELS.default,
      max_tokens: tier === "complex" ? 8000 : 2500,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }],
    }),
  });
  if (!r.ok) { console.error("OpenAI", r.status, await r.text()); throw r.status; }
  const data = await r.json();
  return data.choices?.[0]?.message?.content || "";
}

export default async function handler(req, res) {
  if (!onlyPost(req, res)) return;
  const useClaude = !!process.env.ANTHROPIC_API_KEY;
  if (!useClaude && !process.env.OPENAI_API_KEY) return res.status(503).json({ error: "not_configured" });
  const user = await requireUser(req, res); if (!user) return;
  if (!rateLimit("ai:" + user.id)) return res.status(429).json({ error: "rate_limited" });

  const { prompt, tier } = req.body || {};
  if (typeof prompt !== "string" || !prompt || prompt.length > 30000) return res.status(400).json({ error: "bad_request" });

  let text;
  try { text = useClaude ? await askClaude(prompt, tier) : await askOpenAI(prompt, tier); }
  catch (status) { return res.status(status === 429 ? 429 : 502).json({ error: status === 429 ? "rate_limited" : "upstream" }); }

  const m = text.match(/\{[\s\S]*\}/);
  try { res.status(200).json({ result: JSON.parse(m ? m[0] : text) }); }
  catch (e) { console.error("JSON parse", text.slice(0, 500)); res.status(502).json({ error: "parse" }); }
}
