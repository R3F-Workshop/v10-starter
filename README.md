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
├── App.tsx                    # DOM overlays + Leva mount, wraps <Experience>
├── components/
│   ├── Experience.tsx         # the <Canvas>, fog, Leva background control
│   ├── stage/
│   │   ├── Stage.tsx          # camera + lighting + floor
│   │   ├── CameraRig.tsx      # drei OrbitControls + Leva autoRotate
│   │   ├── Lights.tsx         # ambient + directional (shadows) + spot
│   │   └── Floor.tsx          # shadow plane + gridHelper
│   ├── content/
│   │   ├── Content.tsx        # what's actually in the scene
│   │   ├── LogoCubes.tsx      # the pmndrs mark as a cube grid
│   │   ├── Cube.tsx           # hover/click, useCursor, useUniforms + useLocalNodes
│   │   ├── Pyramid.tsx        # useFrame: damped spin-on-hover + idle bob
│   │   └── Suzi.tsx           # loaded model, material overrides via useUniforms
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

## The v10 headline: TSL uniforms with `useUniforms` + `useLocalNodes`

[Cube.tsx](src/components/content/Cube.tsx) is the demo. The pipeline is:

```
useControls (Leva) ──► useUniforms('cubes' scope) ──► useLocalNodes ──► meshStandardNodeMaterial
```

- `useUniforms({ uBaseColor, uHoverColor }, 'cubes')` puts shared `UniformNode`s in the R3F store. All six cubes call it with the same scope — the first creates the nodes, the rest get the **same instances** back, and when a Leva value changes it's written onto the existing node. The shader never recompiles.
- Per-cube uniforms (`uniform(0)` from `three/tsl`) drive the hover mix, animated in `useFrame` with `MathUtils.damp` — mutating a uniform never re-renders React. They stay in a plain `useMemo(…, [])` because they hold mutable state that must survive a graph rebuild.
- `useLocalNodes(creator)` builds the material's node graph — `mix(mix(base, accent, clicked), hover, uHover)` — from the store's uniforms. It's a `useMemo` whose deps are the store's uniforms/nodes/textures **plus the HMR version**, so editing the TSL hot-reloads the material instead of leaving it stale until a remount. Unlike `useNodes`, what it returns is local to the component and never registered globally.
- The creator reads shared uniforms by scope (`uniforms.scope('cubes')`), so the `useUniforms` call above is there for its side effect — creating the scope — and its return value is unused.

Two things to know:

1. **You must pass `renderer` to `<Canvas>`** (the bare flag, or a config object like `renderer={{}}`) to get the new `WebGPURenderer` (WebGL2 fallback is automatic). Without it the alpha silently creates the legacy `WebGLRenderer` — and node materials crash it with a cryptic `Cannot read properties of undefined (reading 'replace')` inside shader compilation.
2. **The TSL hooks live on the `@react-three/fiber/webgpu` entry**, not the main one. That's fine: the entries share their React context through `globalThis[Symbol.for('@react-three/fiber.context')]`, so the hook works inside the regular `<Canvas>` next to drei.

## v10 / v11 gotchas we hit

- **`useFrame` state has no `clock` anymore.** The frame scheduler was extracted into `@pmndrs/scheduler`; timing lives directly on the state: `state.elapsed`, `state.delta`, `state.frame`, `state.time`. See [Pyramid.tsx](src/components/content/Pyramid.tsx).
- **drei v11 alpha ships a trimmed export set.** `CameraControls`, `Grid`, `ContactShadows` and friends haven't landed yet — this starter uses `OrbitControls` (which has `autoRotate` built in) and three's `gridHelper` instead.
- v10 also renames `state.gl` → `state.renderer` (WebGL/WebGPU abstraction) — not used here, but you'll meet it in `useThree`.
- **`useLocalNodes` has the creator function in its dep array.** An inline arrow is a new identity every render, so the graph would rebuild on every render — and since the material is keyed by `colorNode.uuid`, it would remount on every hover. Wrap the creator in `useCallback` (or hoist it out of the component).
- **Uniforms read back out of the store are typed `UniformNode<unknown>`**, which three's TSL operators reject. Both `useUniforms` and `uniforms.scope(…)` need a cast to a typed node — see `ColorUniform` in [Cube.tsx](src/components/content/Cube.tsx).

## Things to try

- Change the `PATTERN` grid in [LogoCubes.tsx](src/components/content/LogoCubes.tsx)
- Add a control to the Leva panel (e.g. pyramid spin speed)
- Extend the cube node graph — try `positionNode` for a TSL vertex wobble
- Give the pyramid a node material too, sharing the `'cubes'` scope uniforms
- Add `<StatsGl />` from drei to watch performance
