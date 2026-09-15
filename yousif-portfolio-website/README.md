# Yousif Awadelkarim — 3D Portfolio

A responsive, animated portfolio for a backend and full-stack software engineer specializing in distributed systems and cloud infrastructure.

## Features

- Interactive Three.js 3D “software core” in the hero
- Responsive desktop, tablet, and mobile layouts
- Scroll reveals, project motion, card tilt, terminal typing, and pointer interactions
- Accessibility support, including reduced-motion handling
- Always-visible LinkedIn, GitHub, and CV profile dock
- Full CV preview displayed directly inside the page, with open and download actions
- Featured Sakinah Quran mobile app with real application screenshots
- Selected GitHub projects, email, and professional profile links
- Local fonts and local Three.js build: no CDN is required at runtime

## Preview locally

From this folder, run:

```bash
python -m http.server 4173 --bind 0.0.0.0
```

Then open `http://localhost:4173`.

> Use a local server rather than opening `index.html` directly because the 3D JavaScript is loaded as an ES module.

## Deploy

This is a static site. Upload the folder to GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any static host. No build step is required.

## Main files

- `index.html` — page structure and content
- `styles.css` — full visual design and responsive styles
- `script.js` — interactions and 3D scene
- `three.module.js` and `three.core.js` — local Three.js modules
- `assets/Yousif-Awadelkarim-CV.pdf` — polished ATS-ready PDF CV
- `assets/Yousif-Awadelkarim-CV.docx` — editable Microsoft Word CV
- `../Yousif-Awadelkarim-Portfolio.html` — standalone one-file version that opens directly

## Update later

Replace the CV using the same filename, or update the PDF link in `index.html`. Project text and links are in the “Selected Work” section of `index.html`.
