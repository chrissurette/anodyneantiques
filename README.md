# Anodyne Antiques — deployable site

This folder is the complete, ready-to-deploy website for **anodyneantiques.com**.
Static files only — no build step required.

## Deploying via GitHub → Netlify

1. Drag **the contents of this folder** (not the folder itself) into the root of
   your GitHub repository — `index.html` should sit at the repo root.
2. Commit. If the repo is connected to Netlify, it deploys automatically.
   - When connecting the site in Netlify the first time: build command = *(leave empty)*,
     publish directory = `/` (the repo root). The included `netlify.toml` sets this too.

## Alternative: direct drop

Drag this whole folder onto https://app.netlify.com/drop for an instant deploy
without GitHub.

## Keeping this folder up to date

This is a copy of the working site one level up. After any edits to the main
project, double-click `update-staging.bat` in the project root to refresh this
folder before pushing.
