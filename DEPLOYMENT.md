# Deployment Guide (Namecheap + Vercel or Netlify)

This app is a Create React App (CRA) single-page application. Use either Vercel or Netlify. Both work well with client-side routing.

## Option A: Vercel (recommended if you already have an account)

Prereqs:
- Repo: `THGPtrading/charting-platform`
- Domain registrar: Namecheap, subdomain `app.thgptrading.com`

Steps:
1. Push `main` to GitHub.
2. Import the repo in Vercel → New Project → select repo.
3. Framework Preset: React (CRA). Build command auto-detected (`npm run build`). Output directory `build`.
4. Environment Variables (Production):
   - `REACT_APP_USE_TV=0`
   - (optional) `REACT_APP_SHOW_INTERNAL=1` if you want internal pages visible in prod.
5. Deploy.
6. Add Custom Domain in Vercel: `app.thgptrading.com`.
7. In Namecheap DNS:
   - Add CNAME record:
     - Host: `app`
     - Value: the Vercel-provided target (e.g., `your-project.vercel.app`)
     - TTL: `Automatic`
8. Wait for DNS to propagate, then verify:
   ```cmd
   nslookup app.thgptrading.com
   curl -I https://app.thgptrading.com
   ```

Notes:
- `vercel.json` is included to force SPA rewrites so all routes load (client-side routing).

## Option B: Netlify

Steps:
1. Log into Netlify → Add new site → Import from Git → select repo.
2. Build command: `npm run build`. Publish directory: `build/`.
3. Environment Variables:
   - `REACT_APP_USE_TV=0`
   - (optional) `REACT_APP_SHOW_INTERNAL=1`
4. Deploy.
5. Domain settings → Add custom domain `app.thgptrading.com`.
6. In Namecheap DNS:
   - Add CNAME record:
     - Host: `app`
     - Value: your Netlify site domain (e.g., `your-site.netlify.app`)
     - TTL: `Automatic`
7. Verify after propagation:
   ```cmd
   nslookup app.thgptrading.com
   curl -I https://app.thgptrading.com
   ```

Notes:
- SPA routing is handled by `public/_redirects` (`/* /index.html 200`).

## Visibility Rules
- Production shows only `TrendEdge`, `MomentumEdge`, `WarriorEdge` by default.
- To temporarily expose internal pages in prod: set `REACT_APP_SHOW_INTERNAL=1` and redeploy.

## Troubleshooting
- DNS not resolving: confirm CNAME is set at Namecheap and no conflicting A/ALIAS records for `app`.
- 404 on deep links: ensure Vercel `vercel.json` (rewrites) or Netlify `_redirects` is present.
- Env vars not taking effect: verify they are set in the hosting provider and redeploy.
