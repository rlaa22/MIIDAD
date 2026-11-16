# MIDAD — Cinematic Intro

This version adds a cinematic opening screen before the MIDAD dashboard.

## Intro behavior
- Animated MIDAD mark with a soft floating motion.
- Blue/purple ambient lighting, orbital lines, particles, and a moving light sweep.
- Arabic tagline and three short platform benefits.
- **Skip** button in the upper-right corner.
- Automatically enters the dashboard after 6.5 seconds.
- The intro is shown once per browser session using `sessionStorage`.
- Skip and automatic completion use a short fade/blur transition.
- Responsive layout and reduced-motion support.

## Run
```bash
npm install
npm run dev
```
Open http://localhost:3000

To preview the intro again in the same browser session, open DevTools Console and run:
```js
sessionStorage.removeItem('midad-intro-seen'); location.reload();
```
