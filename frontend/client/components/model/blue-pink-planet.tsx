import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import Loading from './../ui/Loading'
import { Group } from 'three'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const modelRef = useRef<Group>(null)
  
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.3
    }
  })
  
  return (
    <group ref={modelRef} position={[0, -0.6, 0]}>
      <primitive object={scene} scale={0.65} rotation={[0, 0, 0]} />
    </group>
  )
}

function ModelViewer() {
  return (
    <div className='w-full'>
      <Canvas className='' style={{ background: 'transparent'}} camera={{ position: [1, 0, 0], fov: 75}}>
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 15, 10]} />
        <Suspense fallback={<Loading />}>
          <Model url="/models/blue-pink-plt.glb" />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}

export default ModelViewer