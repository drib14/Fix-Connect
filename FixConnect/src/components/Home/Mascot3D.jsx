import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Cylinder, Box } from '@react-three/drei';

const AnimatedHammer = () => {
  const groupRef = useRef();

  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.5;
      groupRef.current.rotation.y += delta * 0.8;

      timeRef.current += delta;
      // Make it slightly bob up and down
      groupRef.current.position.y = Math.sin(timeRef.current * 2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={[1.2, 1.2, 1.2]}>
      {/* Handle of the hammer */}
      <Cylinder args={[0.2, 0.2, 3, 32]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.8} />
      </Cylinder>
      {/* Head of the hammer */}
      <Box args={[2, 0.8, 0.8]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#A9A9A9" metalness={0.9} roughness={0.1} />
      </Box>
    </group>
  );
};

const Mascot3D = () => {
  return (
    <div style={{ height: '400px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <AnimatedHammer />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default Mascot3D;
