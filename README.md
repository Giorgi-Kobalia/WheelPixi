# WheelPixi

Wheel of Fortune — a spinning prize wheel built with [Pixi.js](https://pixijs.com/).

Live demo: deployed automatically to GitHub Pages on every push to `main`.

## Features

- Start screen to pick the number of sectors (6–16)
- Animated wheel spin with easing
- Pick a winning sector directly, or spin randomly
- Fully rendered in Pixi.js (background, wheel, buttons) — the page only hosts the canvas
- Responsive, scales to any window size

## Tech stack

- [Pixi.js](https://pixijs.com/) v7 (npm package)
- [Vite](https://vitejs.dev/) for dev server and bundling
- Vanilla JavaScript, no UI framework

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
