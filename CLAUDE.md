# Farsi Jun – Kontext für Claude Code

Persisch-Lern-App (PWA) für eine deutschsprachige Anfängerin: iranisches Alltagsfarsi (Teheraner Umgangssprache) in 12 Monaten verstehen und sprechen. Schwerpunkt: Hören und Sprechen, nicht Schrift. Die persische Schrift ist optional.
Besitzer: Shayan. Antworten bitte auf Deutsch, kurz und direkt.

## Stack
- **Frontend:** `public/` – reines HTML/JS ohne Build (`app.js` = gesamte App, `data.js` = Lerninhalte, `styles.css`, `sw.js`, `manifest.webmanifest`).
- **Backend:** Vercel Functions in `api/` (Node, ESM). Dateien mit `_` am Anfang sind keine Endpunkte.
  - `ai.js`: KI-Aufrufe. Nimmt Anthropic, wenn `ANTHROPIC_API_KEY` gesetzt ist, sonst OpenAI (`OPENAI_MODEL`, Standard `gpt-4.1-mini`). Antwortet immer mit JSON `{result}`.
  - `stt.js`: Spracherkennung über OpenAI (`gpt-4o-transcribe`, language `fa`).
  - `tts.js`: Sprachausgabe. Azure (`fa-IR-DilaraNeural`), falls `AZURE_SPEECH_KEY` und `AZURE_SPEECH_REGION` gesetzt sind, sonst OpenAI TTS.
  - `config.js`: öffentliche Einstellungen (Supabase-URL, publishable Key, Feature-Flags `ai`/`stt`/`tts`, `ttsVoice`).
  - `_lib.js`: prüft das Supabase-Token (`/auth/v1/user`), `ALLOWED_EMAILS`, einfache Begrenzung der Aufrufe, normalisiert `SUPABASE_URL` (nur die Projekt-ID reicht auch).
- **Supabase:** Login per E-Mail und Passwort („Confirm email“ ist AUS). Tabelle `progress` (user_id, state jsonb) mit RLS. Privater Storage-Bucket `recordings/<user-id>/<key>` für Muttersprachler-Aufnahmen. Schema: `supabase/schema.sql`.
- **Deployment:** GitHub `Shagqy/farsi-jun` → Vercel. Jeder Push auf `main` geht automatisch live.
- **Lokal:** `node dev-server.js` (liest `.env`, emuliert Vercel). Ohne `SUPABASE_URL` läuft die App ohne Login.

## Wichtige Konzepte in app.js
- Zustand `S` (siehe `DEF()`): `srs`, `days` (Sekunden pro Tag), `done`, `listen`, `speak`, `quiz`, `errors`, `tests`, `gen` (KI-Lektionen `G<woche>` und KI-Dialoge `D…`), `verified`. Gespeichert in localStorage und per `save()`/`flush()` (verzögert) in Supabase. Zusammengeführt wird über `S.at`.
- Lernpfad: `MONTHS` (data.js) → `WEEKS` (52). `FIXED` ordnet die Wochen 1–5 den 10 festen Lektionen zu. Ab Woche 6 erstellt die KI die Lektion beim ersten Öffnen (`genLesson`).
- Ausdrucksformat: `[Umschrift, Deutsch, Persisch, Bsp-Umschrift, Bsp-Deutsch, Bsp-Persisch, Verwendung]`. Umschrift-Regeln stehen in `TRANSLIT`: â, kh, gh, sh, ch, zh, immer die gesprochene Form (miram, khune, umadam).
- SRS SM-2-artig (`rateCard`), getrennt nach passiv `p:` und aktiv `a:`.
- Tagestraining `buildSession()`: Wiederholen → Neu → Hören → Fehler → Sprechen. Modus min/std/int, Schwerpunkt auf dem schwächsten Bereich (`weakest()`).
- Audio `playKey()`: eigene Aufnahme (IndexedDB oder Supabase) → Server-TTS (in IndexedDB zwischengespeichert, Schlüssel `tts:<voice>:<text>`) → Browser-Stimme.
- Mikrofon: `toggleRec()`/`afterRec()` mit den Zwecken `native` | `shadow` | `check` | `chat`. Fallback: Web Speech API oder Datei-Eingabe.
- Fehlerprofil: `addErrors()`, Wiederholung nach 2/5/12/30 Tagen, gilt nach 3 Treffern als behoben. Typ `erkennung` (Erkennungsfehler) zählt nicht als Fehler der Lernerin.
- Routing: `V.tab` + `render()`. Klicks laufen über `data-act` → `ACT`.

## Regeln
- Keine API-Schlüssel im Frontend.
- Nach Änderungen an Dateien in `public/` die Versionsnummer bei `CACHE` in `public/sw.js` erhöhen, sonst sehen installierte Apps die alte Version.
- Lerninhalte nicht als „von Muttersprachlern geprüft“ ausgeben. KI-Inhalte als „KI-generiert“ markieren. Keine Redewendungen erfinden.
- Commits: kurz, auf Deutsch.

## Stand (06.11.2026)
- Läuft auf Vercel. KI und Spracherkennung laufen über OpenAI. Login per E-Mail und Passwort funktioniert.
- Offen: Azure-Stimme war noch nicht aktiv, weil es in Vercel versehentlich zwei Projekte gab. Die Env-Variablen müssen im richtigen Projekt stehen; das doppelte Projekt löschen. Prüfen über `/api/config` → `ttsVoice` sollte `fa-IR-DilaraNeural` sein.
- Offen: `ALLOWED_EMAILS` setzen. Nachdem beide Konten existieren, in Supabase „Allow new users to sign up“ ausschalten.
- Ideen: Push-Erinnerungen (Web Push), echte Muttersprachler-Audios, Prüfung der Inhalte durch Muttersprachler, weitere feste Lektionen ab Woche 6.
