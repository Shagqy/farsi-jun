// Öffentliche Konfiguration für das Frontend (keine Geheimnisse!).
// Der Supabase-Anon-Key ist absichtlich öffentlich – geschützt wird über Row Level Security.
import { supabaseUrl } from "./_lib.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    supabaseUrl: supabaseUrl(),
    supabaseAnonKey: String(process.env.SUPABASE_ANON_KEY || "").trim(),
    ai: !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
    stt: !!process.env.OPENAI_API_KEY,
    tts: !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION),
  });
}
