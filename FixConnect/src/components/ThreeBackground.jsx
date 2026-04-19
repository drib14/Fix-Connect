import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Stars } from '@react-three/drei';

function EmeraldShapes() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * 0.05;
    groupRef.current.rotation.x += delta * 0.05;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1, 32, 32]} position={[-3, 1, -2]}>
          <meshStandardMaterial color="#10b981" wireframe opacity={0.3} transparent />
        </Sphere>
      </Float>

      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
        <Sphere args={[1.5, 32, 32]} position={[4, -1, -5]}>
          <meshStandardMaterial color="#059669" wireframe opacity={0.2} transparent />
        </Sphere>
      </Float>

      <Float speed={1} rotationIntensity={0.5} floatIntensity={3}>
         <Sphere args={[0.5, 16, 16]} position={[-1, -2, 1]}>
          <meshStandardMaterial color="#34d399" wireframe opacity={0.4} transparent />
        </Sphere>
      </Float>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[2, 5, 2]} intensity={1} color="#34d399" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} color="#6ee7b7" />
        <EmeraldShapes />
      </Canvas>
    </div>
  );
}