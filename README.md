# Anodyne Antiques — deployable site

This folder is the complete, ready-to-deploy website for **anodyneantiques.com**.
Static files only — nothing for Netlify to build.

**This folder is generated.** It is rewritten every time `update-staging.bat` (or
`preview.bat`) runs `node build.mjs` in the project root. Edit the site in `src/pages/`,
`src/partials/`, `src/site.json` and `assets/` one level up — never here.

## Deploying via GitHub → Netlify

1. Copy **the contents of this folder** (not the folder itself) over the root of the
   GitHub repository — `index.html`, `404.html`, `netlify.toml`, `sitemap.xml`, `robots.txt`,
   `assets/` and the page folders (`estate-services/`, `sell/`, …) all sit at the repo root.
2. Commit. The repo is connected to Netlify, so it deploys automatically.
   - Netlify settings: build command *(empty)*, publish directory `/`. `netlify.toml` sets headers.
   - Enable **Forms** detection in Netlify → Site settings → Forms so `/contact/` works, and add
     a notification email.
3. If you **deleted** a page, remember GitHub's web upload can't remove files — use GitHub
   Desktop (copy this folder's contents over the clone; it shows deletions) or delete the old
   folder in the GitHub UI.

## Alternative: direct drop

Drag this whole folder onto https://app.netlify.com/drop for an instant deploy
without GitHub.
