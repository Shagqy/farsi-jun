// Persische Sprachausgabe: Azure Speech (echte fa-IR-Stimme, bevorzugt) – sonst OpenAI TTS.
import { requireUser, rateLimit, onlyPost } from "./_lib.js";

const esc = s => String(s).replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));

async function azure(text) {
  const voice = process.env.AZURE_VOICE || "fa-IR-DilaraNeural";
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fa-IR"><voice name="${voice}">${esc(text)}</voice></speak>`;
  const r = await fetch(`https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "farsi-jun" },
    body: ssml,
  });
  if (!r.ok) { console.error("Azure TTS", r.status, await r.text()); throw r.status; }
  return Buffer.from(await r.arrayBuffer());
}

async function openai(text) {
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: process.env.OPENAI_TTS_VOICE || "nova",
      input: text,
      instructions: "Sprich wie eine Muttersprachlerin aus Teheran: natürliches, umgangssprachliches iranisches Persisch, freundlich, deutlich, normales Tempo.",
      response_format: "mp3",
    }),
  });
  if (!r.ok) { console.error("OpenAI TTS", r.status, await r.text()); throw r.status; }
  return Buffer.from(await r.arrayBuffer());
}

export default async function handler(req, res) {
  if (!onlyPost(req, res)) return;
  const useAzure = !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
  if (!useAzure && !process.env.OPENAI_API_KEY) return res.status(503).json({ error: "not_configured" });
  const user = await requireUser(req, res); if (!user) return;
  if (!rateLimit("tts:" + user.id, 400)) return res.status(429).json({ error: "rate_limited" });

  const { text } = req.body || {};
  if (typeof text !== "string" || !text.trim() || text.length > 600) return res.status(400).json({ error: "bad_request" });

  let buf;
  try { buf = useAzure ? await azure(text) : await openai(text); }
  catch (status) { return res.status(status === 429 ? 429 : 502).json({ error: "upstream" }); }
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "private, max-age=31536000");
  res.status(200).send(buf);
}
