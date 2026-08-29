import { Canvas } from "@react-three/fiber"
import { useControls } from "leva";
import { Stage } from "./stage/Stage";
import { Content } from "./content/Content";

  export default function Experience() {

    const { background } = useControls({
        background: '#0a0a0a',
      })

    return ( 
        <Canvas shadows renderer background={background} camera={{ position: [7, 5, 9], fov: 42 }} dpr={[1, 2]}>
              {/* `attach` writes these onto the parent (the scene) declaratively */}
        <fog attach="fog" args={[background, 18, 45]} />
        <Stage />
        <Content />
      </Canvas>)
  }
