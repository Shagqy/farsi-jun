// Persische Sprachausgabe über Azure Speech (neuronale Stimme fa-IR).
import { requireUser, rateLimit, onlyPost } from "./_lib.js";

const esc = s => String(s).replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));

export default async function handler(req, res) {
  if (!onlyPost(req, res)) return;
  const key = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return res.status(503).json({ error: "not_configured" });
  const user = await requireUser(req, res); if (!user) return;
  if (!rateLimit("tts:" + user.id, 400)) return res.status(429).json({ error: "rate_limited" });

  const { text } = req.body || {};
  if (typeof text !== "string" || !text.trim() || text.length > 600) return res.status(400).json({ error: "bad_request" });
  const voice = process.env.AZURE_VOICE || "fa-IR-DilaraNeural";
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fa-IR"><voice name="${voice}">${esc(text)}</voice></speak>`;

  const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": key, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "farsi-jun" },
    body: ssml,
  });
  if (!r.ok) { console.error("TTS", r.status, await r.text()); return res.status(502).json({ error: "upstream" }); }
  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "private, max-age=31536000");
  res.status(200).send(buf);
}
