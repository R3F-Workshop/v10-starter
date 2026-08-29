import { useControls } from 'leva'
import { CameraRig } from './CameraRig'
import { Lights } from './Lights'
import { Floor } from './Floor'
import { LogoCubes } from './LogoCubes'
import { Pyramid } from './Pyramid'

/**
 * Everything inside <Canvas> lives here. Note that hooks like useControls /
 * useFrame / useThree only work in components rendered inside the Canvas.
 */
export function Scene() {
  const { background } = useControls({ background: '#0a0a0a' })

  return (
    <>
      {/* `attach` writes these onto the parent (the scene) declaratively */}
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[background, 18, 45]} />

      <CameraRig />
      <Lights />
      <Floor />
      <LogoCubes />
      <Pyramid position={[0, 2.6, 0]} />
    </>
  )
}
