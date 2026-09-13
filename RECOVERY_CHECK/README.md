# Bright Health Specialized Hospital website

A lightweight, bilingual patient-facing website built as an isolated React + Vite project.

## Architecture

- `src/App.jsx` — bilingual content, reusable data, sections, search, navigation and appointment flow
- `src/styles.css` — responsive design system and all breakpoints; no CSS framework
- `public/` — optimized local Bright Health brand assets
- No router, component library, icon package, analytics or external font request

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Before launch

Replace the generic map destination and hospital address with the confirmed street location. Add the confirmed hospital reception/appointment hotline when available. Emergency actions currently use Bangladesh's national emergency number, `999`, rather than an invented hospital number.
