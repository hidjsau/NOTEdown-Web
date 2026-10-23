# NoteDown (PWA)

Upload everything in this folder to the **root** of a GitHub repository, then:

1. Repo > Settings > Pages > Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`, Save.
2. Wait 1-2 minutes. Open `https://<your-username>.github.io/<repo-name>/`.
3. Android Chrome: menu (three dots) > Install app / Add to Home screen. iPhone Safari: Share > Add to Home Screen.

Notes
- Works offline after the first visit.
- Opening `.notedown` / `.notes` files straight from a file manager is supported only on desktop Chrome/Edge (installed app). On Android use the app's Import button.
- When you update `index.html`, change `V` in `sw.js` (for example `notedown-v2f`) so phones fetch the new version.
