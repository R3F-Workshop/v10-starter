# R3F v10 Starter

A minimal [react-three-fiber **v10 alpha**](https://github.com/pmndrs/react-three-fiber) starter for the workshop — Vite, TypeScript, Tailwind v4, [drei v11 alpha](https://github.com/pmndrs/drei), and [Leva](https://github.com/pmndrs/leva). Use it as a jumping-off point.

```bash
npm install
npm run dev
```

## What's in the scene

- **Six interactive cubes** laid out on the floor in the shape of the actual [Poimandres logo](https://pmnd.rs) (it really is a 3×3 pixel grid). Hover tints them with the Leva `hoverColor`, click cycles accent colors — all driven by **TSL uniforms** via the new v10 `useUniforms` hook (see below).
- **A pyramid** floating above — hover it and it spins up smoothly (the `useFrame` demo).
- **`<Lights>`** with a shadow-casting directional key light + a violet accent spot.
- **Leva panel** — background color, a `Camera` folder with auto-rotate (on by default), and a `Cubes` folder whose colors flow straight into the cube shader as uniforms.
- **DOM overlays** (header/footer) on top of the canvas, styled with Tailwind. Note the `pointer-events-none` on the bars and `pointer-events-auto` on the links so orbiting still works everywhere else.

## Project tour

```
src/
├── App.tsx                    # <Canvas> + DOM overlays + Leva mount
├── components/
│   ├── Scene.tsx              # everything inside the canvas; Leva background control
│   ├── CameraRig.tsx          # drei OrbitControls + Leva autoRotate
│   ├── Lights.tsx             # ambient + directional (shadows) + spot
│   ├── Floor.tsx              # shadow plane + gridHelper
│   ├── LogoCubes.tsx          # the pmndrs mark as a cube grid
│   ├── Cube.tsx               # hover/click interaction, useCursor
│   ├── Pyramid.tsx            # useFrame: damped spin-on-hover + idle bob
│   └── overlay/               # Header, Footer, PmndrsMark (DOM, Tailwind)
└── index.css                  # Tailwind v4 (@import 'tailwindcss')
```

## Stack

| Package | Version | Notes |
| --- | --- | --- |
| `@react-three/fiber` | `10.0.0-alpha.4` | pinned — alpha |
| `@react-three/drei` | `11.0.0-alpha.5` | pinned — alpha |
| `three` | `^0.185` | v10 requires ≥ 0.185 |
| `react` | `^19.2` | v10 requires 19.x |
| `leva` | `^0.10` | control panel |
| `vite` / `tailwindcss` | 8 / 4 | via `@tailwindcss/vite` |

## The v10 headline: TSL uniforms with `useUniforms`

[Cube.tsx](src/components/Cube.tsx) is the demo. The pipeline is:

```
useControls (Leva) ──► useUniforms('cubes' scope) ──► TSL node graph ──► meshStandardNodeMaterial
```

- `useUniforms({ uBaseColor, uHoverColor }, 'cubes')` puts shared `UniformNode`s in the R3F store. All six cubes call it with the same scope — the first creates the nodes, the rest get the **same instances** back, and when a Leva value changes it's written onto the existing node. The shader never recompiles.
- Per-cube uniforms (`uniform(0)` from `three/tsl`) drive the hover mix, animated in `useFrame` with `MathUtils.damp` — mutating a uniform never re-renders React.
- The material color is a node graph: `mix(mix(base, accent, clicked), hover, uHover)`.

Two things to know:

1. **You must pass `renderer={{}}` (or any renderer config) to `<Canvas>`** to get the new `WebGPURenderer` (WebGL2 fallback is automatic). Without it the alpha silently creates the legacy `WebGLRenderer` — and node materials crash it with a cryptic `Cannot read properties of undefined (reading 'replace')` inside shader compilation.
2. **`useUniforms` lives on the `@react-three/fiber/webgpu` entry**, not the main one. That's fine: the entries share their React context through `globalThis[Symbol.for('@react-three/fiber.context')]`, so the hook works inside the regular `<Canvas>` next to drei.

## v10 / v11 gotchas we hit

- **`useFrame` state has no `clock` anymore.** The frame scheduler was extracted into `@pmndrs/scheduler`; timing lives directly on the state: `state.elapsed`, `state.delta`, `state.frame`, `state.time`. See [Pyramid.tsx](src/components/Pyramid.tsx).
- **drei v11 alpha ships a trimmed export set.** `CameraControls`, `Grid`, `ContactShadows` and friends haven't landed yet — this starter uses `OrbitControls` (which has `autoRotate` built in) and three's `gridHelper` instead.
- v10 also renames `state.gl` → `state.renderer` (WebGL/WebGPU abstraction) — not used here, but you'll meet it in `useThree`.

## Things to try

- Change the `PATTERN` grid in [LogoCubes.tsx](src/components/LogoCubes.tsx)
- Add a control to the Leva panel (e.g. pyramid spin speed)
- Extend the cube node graph — try `positionNode` for a TSL vertex wobble
- Give the pyramid a node material too, sharing the `'cubes'` scope uniforms
- Add `<StatsGl />` from drei to watch performance
