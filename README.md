# WheelPixi

Wheel of Fortune — a spinning prize wheel with a configurable number of sectors, eased rotation animation, and winner selection, built with [Pixi.js](https://pixijs.com/).

🎡 Live demo: deployed automatically to GitHub Pages on every push to `main` — https://giorgi-kobalia.github.io/WheelPixi/

## Features

- Start screen to pick the number of sectors (6–16, via `+`/`-` buttons)
- Animated wheel spin with easing (ease-in-out), ~4 second duration
- Pick the winner two ways: click a specific sector button, or hit `RANDOM` for a random pick
- Winning sector flashes/highlights after the wheel stops
- Sector buttons auto-layout into two columns on either side of the wheel once there are more than 8
- Entire scene is rendered with Pixi.js (background, wheel, text, buttons) — the HTML page only hosts the canvas
- Responsive: a fixed design resolution (1100×650) is scaled and centered to fit any window size

## Tech stack

- [Pixi.js](https://pixijs.com/) v7 — canvas/WebGL rendering
- [Vite](https://vitejs.dev/) — dev server and bundling
- Vanilla JavaScript (ES modules), no UI framework

## Project structure

```
index.html       — entry point, contains only the #wheel container
script.js        — all game logic: menu, wheel rendering, spin animation, winner selection
style.css        — page background and base styles for the canvas container
vite.config.js   — Vite config (relative base path for GitHub Pages)
.github/workflows/static.yml — GitHub Pages deployment
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The production build is written to `dist/`.

## Deployment

Pushing to `main` triggers [`.github/workflows/static.yml`](.github/workflows/static.yml), which installs dependencies, runs `npm run build`, and publishes `dist/` to GitHub Pages.
