import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PageTurnEffectsProps {
  pageTurnTrigger: number; // increments on every page turn
  deviceTier: 'desktop' | 'tablet' | 'mobile';
}

const PageTurnEffects: React.FC<PageTurnEffectsProps> = ({ pageTurnTrigger, deviceTier }) => {
  const burstRef = useRef<THREE.Points>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const prevTrigger = useRef(pageTurnTrigger);
  const burstState = useRef({
    active: false,
    timer: 0,
    velocities: new Float32Array(0),
  });

  const particleCount = deviceTier === 'desktop' ? 30 : deviceTier === 'tablet' ? 20 : 10;

  // Burst particle positions
  const burstPositions = useMemo(() => new Float32Array(particleCount * 3), [particleCount]);

  // Detect page turn
  useEffect(() => {
    if (pageTurnTrigger !== prevTrigger.current) {
      prevTrigger.current = pageTurnTrigger;
      const state = burstState.current;
      state.active = true;
      state.timer = 0.8; // burst lasts 0.8 seconds

      // Initialize burst velocities
      state.velocities = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.02 + Math.random() * 0.04;
        state.velocities[i * 3] = Math.cos(angle) * speed;
        state.velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03;
        state.velocities[i * 3 + 2] = Math.sin(angle) * speed;

        // Start at center (spine area)
        burstPositions[i * 3] = (Math.random() - 0.5) * 0.3;
        burstPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
        burstPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      }

      if (burstRef.current) {
        burstRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  }, [pageTurnTrigger, particleCount, burstPositions]);

  useFrame(() => {
    const state = burstState.current;

    if (state.active) {
      state.timer -= 0.016;

      if (burstRef.current) {
        const pos = burstRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          pos[i * 3] += state.velocities[i * 3];
          pos[i * 3 + 1] += state.velocities[i * 3 + 1];
          pos[i * 3 + 2] += state.velocities[i * 3 + 2];

          // Slow down
          state.velocities[i * 3] *= 0.96;
          state.velocities[i * 3 + 1] *= 0.95;
          state.velocities[i * 3 + 2] *= 0.96;
        }
        burstRef.current.geometry.attributes.position.needsUpdate = true;

        // Fade out
        const mat = burstRef.current.material as THREE.PointsMaterial;
        mat.opacity = Math.max(0, state.timer / 0.8);
      }

      // Glow pulse
      if (glowRef.current) {
        const mat = glowRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, state.timer / 0.8) * 0.15;
      }

      if (state.timer <= 0) {
        state.active = false;
        if (burstRef.current) {
          (burstRef.current.material as THREE.PointsMaterial).opacity = 0;
        }
        if (glowRef.current) {
          (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      }
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Burst particles */}
      <points ref={burstRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[burstPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#44ddff"
          size={0.05}
          transparent
          opacity={0}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Glow pulse ring */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.5, 32]} />
        <meshBasicMaterial
          color="#00ccff"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default PageTurnEffects;
