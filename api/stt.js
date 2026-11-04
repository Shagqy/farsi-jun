// Spracherkennung (Persisch) über die OpenAI-Transkriptions-API.
import { requireUser, rateLimit, onlyPost } from "./_lib.js";

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (!onlyPost(req, res)) return;
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "not_configured" });
  const user = await requireUser(req, res); if (!user) return;
  if (!rateLimit("stt:" + user.id, 120)) return res.status(429).json({ error: "rate_limited" });

  const { audio, type = "audio/webm" } = req.body || {};
  if (typeof audio !== "string") return res.status(400).json({ error: "bad_request" });
  const buf = Buffer.from(audio, "base64");
  if (buf.length > 3.5e6) return res.status(413).json({ error: "too_large" });

  const ext = type.includes("mp4") || type.includes("m4a") ? "m4a" : type.includes("ogg") ? "ogg" : type.includes("wav") ? "wav" : "webm";
  const fd = new FormData();
  fd.append("file", new Blob([buf], { type }), "aufnahme." + ext);
  fd.append("model", process.env.STT_MODEL || "gpt-4o-transcribe");
  fd.append("language", "fa");
  // Hinweis an das Modell: gesprochene Umgangssprache, nicht in Schriftsprache "korrigieren"
  fd.append("prompt", "گفتگوی محاوره‌ای تهرانی. لطفاً دقیقاً همان چیزی که گفته شده را بنویس، حتی اگر اشتباه باشد.");

  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST", headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY }, body: fd,
  });
  if (!r.ok) { console.error("STT", r.status, await r.text()); return res.status(502).json({ error: "upstream" }); }
  const j = await r.json();
  res.status(200).json({ text: j.text || "" });
}
