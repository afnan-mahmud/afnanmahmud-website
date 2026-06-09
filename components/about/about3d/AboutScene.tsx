// components/about/about3d/AboutScene.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Globe from './Globe';

export default function AboutScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 6.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={120} color="#6366f1" />
      <pointLight position={[-5, -3, 2]} intensity={80} color="#22d3ee" />
      <pointLight position={[0, 2, 4]} intensity={40} color="#a78bfa" />
      <Suspense fallback={null}>
        <Globe />
      </Suspense>
    </Canvas>
  );
}
