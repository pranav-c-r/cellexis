import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import { Group } from 'three'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const modelRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (modelRef.current) {
      // Floating animation - small up and down movement
      modelRef.current.position.y = -5 + Math.sin(state.clock.elapsedTime) * 0.2
    }
  })
  
  return (
    <group ref={modelRef} position={[-2, 0, -4]}>
      <primitive object={scene} scale={5} rotation={[0, 0, 0]} />
    </group>
  )
}

function ModelViewer() {
  return (
    <div className='w-full h-screen'>
      <Canvas className='' camera={{ position: [5, 0, 0], fov: 75}}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />``
        <Suspense fallback={null}>
          <Model url="/models/astronaut.glb" />
        </Suspense>
        {/* <OrbitControls enableZoom={false} /> */}
      </Canvas>
    </div>
  )
}

export default ModelViewer