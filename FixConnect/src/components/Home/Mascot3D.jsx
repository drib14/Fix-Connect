import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, TorusKnot } from '@react-three/drei';

const AnimatedTool = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <TorusKnot ref={meshRef} args={[1, 0.3, 128, 32]}>
      <meshStandardMaterial color="#4CAF50" wireframe={false} metalness={0.8} roughness={0.2} />
    </TorusKnot>
  );
};

const Mascot3D = () => {
  return (
    <div style={{ height: '400px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedTool />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default Mascot3D;
