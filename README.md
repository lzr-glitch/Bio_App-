# Bio App PWA

A simple progressive web app that lets you pick between two users, `G` and `R`, and keeps your choice offline-ready.

## What is included

- `index.html` — main page with user selection
- `styles.css` — app styling
- `app.js` — app logic and service worker registration
- `manifest.json` — PWA metadata
- `sw.js` — offline cache service worker
- `icon.svg` — app icon

## How to run locally

1. Open this folder in VS Code.
2. Start a local server. You can use Live Server, or from the terminal:

   ```powershell
   python -m http.server 8000
   ```

3. Open your browser at `http://localhost:8000`.

## How to install on your phone

1. Open the app URL from your phone browser.
2. Tap the browser menu and choose `Add to Home screen` or `Install app`.
3. After installation, you can open it like a native app.
4. The app works offline after the first load.

## GitHub setup and phone access

1. Initialize Git inside the folder if needed:

   ```powershell
   git init
   git add .
   git commit -m "Initial PWA app"
   ```

2. Create a GitHub repository, then add the remote and push:

   ```powershell
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```

3. Enable GitHub Pages in the repository settings:
   - Go to `Settings` > `Pages`
   - Select the `main` branch and root folder `/`
   - Save and wait a few minutes

4. Your app URL will be like:

   ```text
   https://<your-username>.github.io/<repo-name>/
   ```

5. Open that URL on your phone and install it using your browser menu.

## Notes

- The service worker caches the app shell so it continues to work offline.
- Your selected user is saved in `localStorage`, so the letter persists after reload.
