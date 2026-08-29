import { Leva } from 'leva'
import Experience from './components/Experience'
import { Header } from './components/overlay/Header'
import { Footer } from './components/overlay/Footer'

export default function App() {
  return (
    <div className="relative h-full w-full">
          <Experience />

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
