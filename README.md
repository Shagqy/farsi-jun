# Farsi Jun – Persisch-Lern-App

Installierbare Web-App (PWA) zum Lernen von iranischem Alltagsfarsi.
Frontend: HTML/JS ohne Build-Schritt. Backend: Vercel-Funktionen. Konten und Speicherung: Supabase.

```
public/          App (index.html, app.js, data.js = Lerninhalte, styles.css, PWA-Dateien)
api/ai.js        KI: Gesprächspartner, Korrektur, Lektionen, Dialoge (Anthropic)
api/stt.js       Spracherkennung Persisch (OpenAI)
api/tts.js       Persische Stimme (Azure Speech)
api/config.js    Öffentliche Einstellungen fürs Frontend
supabase/schema.sql   Datenbank + Speicher für Aufnahmen
dev-server.js    Lokaler Testserver
```

Alle API-Schlüssel liegen nur auf dem Server, nie im Frontend.

---

## Einrichtung (ca. 30–45 Minuten, einmalig)

### 1. Supabase (Login + Fortschritt + Aufnahmen) – kostenlos
1. Auf https://supabase.com ein Projekt anlegen (Region z. B. Frankfurt).
2. **SQL Editor** → Inhalt von `supabase/schema.sql` einfügen → *Run*.
3. **Authentication → Sign In / Providers → Email**: **„Confirm email“ ausschalten** und speichern. Die App nutzt E-Mail + Passwort, es werden keine E-Mails verschickt.
4. **Project Settings → API**: `Project URL` und `anon public` Key notieren.
5. Wenn ihr beide ein Konto habt: unter **Authentication → Sign In / Providers** „Allow new users to sign up“ ausschalten.

> Hinweis: Kostenlose Supabase-Projekte pausieren nach etwa 1 Woche ohne Nutzung. Bei täglichem Lernen passiert das nicht. Falls doch, im Dashboard auf „Restore“ klicken.

### 2. KI: Anthropic **oder** OpenAI – Pflicht (eins von beiden)
Ohne `ANTHROPIC_API_KEY` nutzt die App für die KI automatisch den `OPENAI_API_KEY` (Modell über `OPENAI_MODEL` änderbar, Standard `gpt-4.1-mini`). Für Claude:
1. Auf https://console.anthropic.com einen API-Key erstellen und Guthaben aufladen.
2. **Unbedingt ein monatliches Ausgabenlimit setzen** (Settings → Limits).

### 3. Azure Speech (persische Stimme) – empfohlen
Ohne Azure nutzt die App die OpenAI-Stimme (falls `OPENAI_API_KEY` gesetzt ist). Die klingt gut, ist aber keine echte iranische Stimme. Azure hat echte fa-IR-Stimmen und eine kostenlose Stufe.
1. Im Azure-Portal eine Ressource vom Typ **Speech** anlegen, Preisstufe **Free F0** (500.000 Zeichen pro Monat gratis), Region z. B. `westeurope`.
2. Unter *Keys and Endpoint* den Key und die Region notieren.
3. Die Stimme ist `fa-IR-DilaraNeural` (weiblich). Männlich wäre `fa-IR-FaridNeural`.

Die App speichert jeden gesprochenen Satz auf dem Gerät. Jeder Satz kostet also nur einmal.

### 4. OpenAI (Spracherkennung) – empfohlen
Damit kann sie direkt ins Handy sprechen. Die App erkennt den Satz und korrigiert ihn. Beim Nachsprechen zeigt sie, welche Wörter erkannt wurden.
1. Auf https://platform.openai.com einen API-Key erstellen und etwas Guthaben aufladen.

Ohne OpenAI-Key nutzt die App die eingebaute Spracherkennung des Browsers, falls vorhanden (Chrome/Android). Sonst bleibt nur das Diktier-Mikrofon der Tastatur.

### 5. Auf Vercel veröffentlichen – kostenlos
**Variante A: ohne GitHub (am schnellsten)**
```bash
cd farsi-jun
npx vercel          # einloggen, Fragen mit Enter bestätigen
```
Dann im Vercel-Dashboard unter **Settings → Environment Variables** die Werte aus `.env.example` eintragen:

| Variable | Wert |
|---|---|
| `ANTHROPIC_API_KEY` **oder** `OPENAI_API_KEY` | aus Schritt 2 / 4 |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | aus Schritt 1 |
| `ALLOWED_EMAILS` | eure beiden E-Mail-Adressen, mit Komma getrennt |
| `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | aus Schritt 3 |
| `OPENAI_API_KEY` | aus Schritt 4 |

Anschließend `npx vercel --prod` ausführen. Die Variablen werden erst nach einem neuen Deploy wirksam.

**Variante B: mit GitHub**
Den Ordner in ein (privates) GitHub-Repo pushen. Danach auf vercel.com → *Add New Project* → Repo importieren (Framework: *Other*), die Variablen eintragen und *Deploy* klicken. Jeder spätere Push wird automatisch veröffentlicht.

`ALLOWED_EMAILS` sorgt dafür, dass nur ihr die kostenpflichtigen KI-, Stimm- und Erkennungsfunktionen nutzen könnt.

### 6. Aufs Handy
- **iPhone:** Link in **Safari** öffnen → Teilen-Symbol → **„Zum Home-Bildschirm“**. Dann startet die App wie eine normale App, ohne Browserleiste.
- **Android:** Link in Chrome öffnen → Menü → **„App installieren“**.
- „Konto erstellen“ antippen, E-Mail und Passwort eingeben. Beim ersten Sprechen fragt das Handy nach dem Mikrofon: erlauben.

Der Fortschritt hängt am Konto und funktioniert auf allen Geräten.

---

## Muttersprachler-Aufnahmen
Bei jedem Ausdruck gibt es „🎙 Muttersprachler-Audio“. Wenn ein Iraner auf **ihrem** Konto einspricht, wird diese Aufnahme ab dann immer statt der Computerstimme abgespielt. Die Aufnahmen liegen privat in Supabase. Dort sieht jede Nutzerin nur ihre eigenen.

## Lokal testen
```bash
cp .env.example .env   # Werte eintragen
node dev-server.js     # → http://localhost:3000
```
Ohne `SUPABASE_URL` läuft die App lokal ohne Login. Der Fortschritt bleibt dann im Browser.
Hinweis: Das Mikrofon funktioniert nur unter `https://` oder `localhost`.

## Inhalte erweitern
- Feste Lektionen stehen in `public/data.js` (`LESSONS`). Jede Lektion hat Ausdrücke im Format
  `[Umschrift, Deutsch, Persisch, Beispiel Umschrift, Beispiel Deutsch, Beispiel Persisch, Verwendung]`, dazu Grammatik, Dialog mit Fragen und eine Sprechaufgabe.
- Wochen ohne feste Lektion (ab Woche 6) erstellt die KI beim ersten Öffnen. Neue feste Lektionen trägst du in `FIXED` in `public/app.js` ein.
- Nach Änderungen an App-Dateien in `public/sw.js` die Versionsnummer bei `CACHE` erhöhen. Sonst sehen installierte Apps noch die alte Version.

## Kosten (grobe Orientierung, ohne Gewähr)
- Vercel, Supabase und Azure F0: bei zwei Nutzerinnen in der Regel kostenlos.
- OpenAI-Spracherkennung: Cent-Beträge pro Lerntag.
- Anthropic: hängt stark davon ab, wie viel mit dem KI-Partner gesprochen wird. Das Ausgabenlimit in der Console schützt vor Überraschungen.

## Bekannte Grenzen
- Die Lerninhalte sind nicht von Muttersprachlern geprüft. Geprüfte Ausdrücke in der App über „Als geprüft markieren“ bestätigen.
- Die Ausspracheerkennung ist ein Hinweis, keine sichere Bewertung. Umgangssprache wird von Spracherkennung manchmal falsch verstanden.
- Push-Erinnerungen sind noch nicht eingebaut. Die App zeigt die Erinnerung nur beim Öffnen. Als Zwischenlösung hilft eine tägliche Handy-Erinnerung.
