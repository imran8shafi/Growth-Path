# Third-Party Notices

## React Bits

Growth Path includes code adapted from React Bits by David Haz under the
project's license terms. The retained license is available at
`licenses/react-bits-LICENSE.md`.

Upstream project: https://github.com/DavidHDev/react-bits

## Magic Rings

`artifacts/mobile/lib/magic-rings-shader.ts` includes the React Bits MagicRings
fragment shader, retrieved from upstream blob
`abc1d23d4263b37d09ac9f33e9608cc3ba2381c0` on 2026-09-05.

Source: https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/MagicRings/MagicRings.jsx

The host renderer is adapted to browser WebGL and Expo GL without Three.js or
shadcn configuration. Both platforms use the same fragment shader, capped at
24 FPS, with reduced-motion and screen/app visibility handling. Full license
and copyright terms are retained in `licenses/react-bits-LICENSE.md`.

## ThreeUI Energy Orb

`artifacts/mobile/lib/energy-orb-shader.ts` adapts the canonical Energy Orb
fragment shader by Meng To (2026), under the MIT license retained in
`licenses/threeui-LICENSE.md`.

Source: https://github.com/MengTo/threeui/blob/main/src/shaders/energy-orb/energyOrbShaders.ts
Retrieved 2026-09-05. Uniform names were changed to share the existing browser
WebGL / Expo GL host. The app renders at 24 FPS, pauses with screen/app
visibility, and uses a still frame for reduced motion. No ThreeUI Pro assets
or remote preview imagery are included.

## Motion references

Componentry's Kinetic Text Reveal and Raylight's product-motion templates
informed the original staggered entrances, layered layouts, and reward reveal
timing. No Componentry implementation or Raylight template/video was copied.

- https://componentry.dev/docs/components/kinetic-text-reveal
- https://www.raylight.app/templates

The supplied Uiverse URL returned 404 on 2026-09-05; no source was imported.
