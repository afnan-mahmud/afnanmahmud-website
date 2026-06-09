// components/home/hero3d/TechOrbit.tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { ORBIT_TECH } from '@/lib/home-data';

function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });
  return (
    <Icosahedron ref={ref} args={[1.25, 4]}>
      <MeshDistortMaterial
        color="#6366f1"
        emissive="#4338ca"
        emissiveIntensity={0.45}
        roughness={0.35}
        metalness={0.2}
        distort={0.35}
        speed={1.5}
      />
    </Icosahedron>
  );
}

export default function TechOrbit() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25;
  });

  const radius = 2.6;
  return (
    <group>
      <Core />
      <group ref={group}>
        {ORBIT_TECH.map((t, i) => {
          const angle = (i / ORBIT_TECH.length) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = Math.sin(angle * 2) * 0.6;
          return (
            <Float key={t.label} speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
              <Html position={[x, y, z]} center distanceFactor={8} zIndexRange={[10, 0]}>
                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: 100,
                    background: 'rgba(10,10,10,0.7)',
                    border: `1px solid ${t.color}55`,
                    color: t.color,
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    backdropFilter: 'blur(6px)',
                    pointerEvents: 'none',
                  }}
                >
                  {t.label}
                </div>
              </Html>
            </Float>
          );
        })}
      </group>
    </group>
  );
}
