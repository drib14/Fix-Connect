import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Decal } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedLogo = () => {
  const groupRef = useRef();
  const timeRef = useRef(0);

  // Load the logo texture
  const texture = useLoader(THREE.TextureLoader, '/FC-logo.png');

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.rotation.y += delta * 0.5;

      timeRef.current += delta;
      groupRef.current.position.y = Math.sin(timeRef.current * 2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={[1.5, 1.5, 1.5]}>
      {/* Base cylinder representing a 3D coin/badge shape for the logo */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.2, 64]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />

        {/* Front face with the logo */}
        <Decal position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.5, 2.5, 2.5]}>
          <meshStandardMaterial
            map={texture}
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </Decal>

        {/* Back face with the logo (optional, mirroring) */}
        <Decal position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, Math.PI]} scale={[2.5, 2.5, 2.5]}>
          <meshStandardMaterial
            map={texture}
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </Decal>
      </mesh>
    </group>
  );
};

const Mascot3D = () => {
  return (
    <div style={{ height: '400px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} shadows>
        <ambientLight intensity={0.8} />
        <directionalLight castShadow position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <React.Suspense fallback={null}>
          <AnimatedLogo />
        </React.Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
};

export default Mascot3D;
