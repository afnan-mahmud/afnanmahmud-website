// components/about/about3d/Globe.tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export default function Globe() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.2;
    // subtle tilt toward the pointer
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.35,
      0.05
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      state.pointer.x * 0.2,
      0.05
    );
  });

  return (
    <group ref={group}>
      {/* Outer wireframe globe */}
      <Icosahedron args={[2.3, 1]}>
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.22} />
      </Icosahedron>

      {/* Mid wireframe shell */}
      <Icosahedron args={[1.85, 2]}>
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.12} />
      </Icosahedron>

      {/* Inner glowing distorted core */}
      <Sphere args={[1.1, 64, 64]}>
        <MeshDistortMaterial
          color="#4338ca"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.2}
          distort={0.4}
          speed={1.8}
        />
      </Sphere>

      <Sparkles count={70} scale={7} size={3} speed={0.4} color="#22d3ee" />
    </group>
  );
}
