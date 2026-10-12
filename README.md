# Personal Workout & Body Tracker

A single-user, mobile-first Progressive Web App for logging body metrics and workouts on one iPhone. It is a static site (no server, no accounts) and stores everything in IndexedDB on the device. Host it on GitHub Pages and install it to the Home Screen.

## Tech choices

**Vite + React + TypeScript + Dexie**, with custom SVG charts. Vite builds on Windows or Linux with Node.js and emits a static site. React keeps the Calendar / Day / Library / Graphs screens manageable. TypeScript matches the spec data model. Dexie is a small IndexedDB wrapper, isolated in `src/data/` so a later cloud sync layer can replace it without touching UI. Charts are custom SVG so tap-to-show tooltips work on iPhone without a charting library or extra runtime requests. Fonts and libraries are bundled; the app makes no third-party network calls after load.

## Decisions beyond the spec

- Dates stay as local `YYYY-MM-DD` strings; IDs use `crypto.randomUUID()`.
- Import is replace-only (not merge), so a backup restore is predictable.
- Built-in units (`kg`, `lb`, `reps`, `sec`, `min`) use stable IDs so they survive export/import.
- Empty body-metric days are not saved, so opening a day does not create a calendar marker.
- GitHub Pages is served from the `/workout-app/` repo subpath.
- Duplicate workout to another date is included as the spec’s nice-to-have.

## Local development

Need Node.js 20+ (22 is fine). In PowerShell or a terminal:

1. `cd` into this folder.
2. `npm install`
3. `npm run dev`
4. Open the URL Vite prints (usually `http://localhost:5173/workout-app/`).

Other commands:

- `npm run build` — typecheck and write the static site to `dist/`
- `npm run preview` — serve `dist/` locally (also under `/workout-app/`)

## Deploy to GitHub Pages

1. Create a GitHub repository named **workout-app** (the URL path must be `/workout-app/` unless you also change `base` in `vite.config.ts`, `index.html`, `src/constants.ts`, and `public/manifest.webmanifest`).
2. From this folder, push the code:

```bash
git init
git add .
git commit -m "Add workout tracker PWA"
git branch -M main
git remote add origin https://github.com/<your-username>/workout-app.git
git push -u origin main
```

3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.
5. Your app URL is:

`https://<your-username>.github.io/workout-app/`

Later updates: push to `main`. GitHub Actions rebuilds and deploys. On the phone, reopen the installed app; if a new version is waiting you will see **Update available. Reload**.

## Install on iPhone

1. Open the GitHub Pages URL in **Safari** (not Chrome).
2. Tap **Share** → **Add to Home Screen**.
3. Open the new Home Screen icon. It should launch full-screen (standalone).
4. Use **only the installed app** after that.

Safari tabs and the Home Screen app have **separate storage**. Data you log in Safari will not appear in the installed app, and the reverse is also true.

## Backups (export / import)

All data lives only on this device. Export is the backup.

1. Open **Settings** (gear, top right).
2. Tap **Export data**. On iOS, Share the file to Files / iCloud Drive.
3. To restore: **Import data**, confirm the counts, then **Confirm replace all data**. That wipes current data and loads the file.

If you have never exported, or the last export was more than 30 days ago, the Calendar tab shows a reminder.

## Offline

After the first successful load (on Wi-Fi or cellular), turn on Airplane Mode and reopen the installed app. It should still work. The service worker precaches the app shell and updates when a new deploy is available.

## Layout of the app

- **Calendar** — month grid; dots for workouts, smaller dots for body metrics; tap a day to log.
- **Day** — weight (kg/lb), calories, macros, and unlimited workouts / exercises / sets.
- **Graphs** — bodyweight or any exercise with data; tap a point for details.
- **Library** — custom exercises and units (load vs reps/RIR).
- **Settings** — week start, default units, export/import.
