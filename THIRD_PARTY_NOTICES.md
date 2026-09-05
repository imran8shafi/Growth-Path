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
