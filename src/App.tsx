import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { Scene } from './components/Scene'
import { Header } from './components/overlay/Header'
import { Footer } from './components/overlay/Footer'

export default function App() {
  return (
    <div className="relative h-full w-full">
      {/* The `renderer` prop opts into the new WebGPURenderer (with automatic
          WebGL2 fallback) — without it the alpha silently creates the legacy
          WebGLRenderer, and TSL node materials won't compile there */}
      <Canvas shadows renderer={{}} camera={{ position: [7, 5, 9], fov: 42 }}>
        <Scene />
      </Canvas>

      {/* DOM overlays sit on top of the canvas */}
      <Header />
      <Footer />

      {/* Leva renders into this container (via `fill`) so it clears the header */}
      <div className="absolute top-20 right-4 z-20 w-72">
        <Leva fill />
      </div>
    </div>
  )
}
