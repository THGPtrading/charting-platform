# THGP Trading — Website

This folder contains a minimal, static marketing site for the root domain `thgptrading.com`.

Contents
- `index.html`: Landing page with company overview and CTA to the app
- `privacy.html`, `terms.html`, `contact.html`: Basic compliance pages
- `styles.css`: Minimal styling

Deploy on Vercel (Monorepo)
1) Create a new Vercel project and import this GitHub repo.
2) When prompted, set “Root Directory” to `website`.
3) Framework preset: “Other”. No build command, output dir not needed (static).
4) Connect the domain `thgptrading.com` to this project in Vercel → Settings → Domains.
5) DNS (Namecheap): Set apex A record to `76.76.21.21` (or migrate DNS to Vercel).
6) Deploy. The app remains at `app.thgptrading.com` on your existing project.

Optional environment variables
- None required for this static site.

Notes
- This satisfies “official website” requirements for vendor applications.
- The app itself lives at `https://app.thgptrading.com` and is linked from the landing page.
- Update copy and emails as needed (`contact@`, `support@`, `legal@`).
