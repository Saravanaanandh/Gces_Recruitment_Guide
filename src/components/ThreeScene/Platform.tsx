import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlatformProps {
  deviceTier: 'desktop' | 'tablet' | 'mobile';
}

const Platform: React.FC<PlatformProps> = ({ deviceTier }) => {
  const outerRingRef = useRef<THREE.Mesh>(null!);
  const innerRingRef = useRef<THREE.Mesh>(null!);
  const midRingRef = useRef<THREE.Mesh>(null!);
  const markingsRef = useRef<THREE.Group>(null!);
  const glowRingRef = useRef<THREE.Mesh>(null!);

  const isSimple = deviceTier === 'mobile';

  // ── Ring geometries ───────────────────────────────────────────────────────
  const outerRingGeom = useMemo(() => new THREE.RingGeometry(2.18, 2.25, 72), []);
  const midRingGeom = useMemo(() => new THREE.RingGeometry(1.72, 1.75, 72), []);
  const innerRingGeom = useMemo(() => new THREE.RingGeometry(1.2, 1.23, 72), []);

  // ── Platform disc materials ───────────────────────────────────────────────
  const platformTopMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#100e18',
        metalness: 0.95,
        roughness: 0.12,
        envMapIntensity: 1.0,
      }),
    []
  );

  const platformSideMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0d0b14',
        metalness: 0.88,
        roughness: 0.22,
      }),
    []
  );

  const pedestalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0e0c16',
        metalness: 0.9,
        roughness: 0.2,
      }),
    []
  );

  // FIX 3: Removed particlePositions and floating particle simulation from platform

  // ── Per-frame animations ──────────────────────────────────────────────────
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Outer ring pulse (bright cyan)
    if (outerRingRef.current) {
      const mat = outerRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 1.8) * 0.15;
    }

    // Middle ring counter-pulse
    if (midRingRef.current) {
      const mat = midRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t * 1.4 + 1.2) * 0.08;
    }

    // Inner ring pulse
    if (innerRingRef.current) {
      const mat = innerRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(t * 2.2 + 2.4) * 0.1;
    }

    // Glow ring under book — faint bloom area
    if (glowRingRef.current) {
      const mat = glowRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.06 + Math.sin(t * 1.1) * 0.03;
      glowRingRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.03);
    }

    // Rotate the markings group slowly
    if (markingsRef.current) {
      markingsRef.current.rotation.y = t * 0.12;
    }
  });

  const pedestalH = 0.22;
  const discThick = 0.12;
  const groupY = -1.5 + pedestalH; // -1.28

  return (
    <group position={[0, groupY, 0]}>
      {/* ── Pedestal base (cylinder raising the platform) ─────────────── */}
      <mesh position={[0, -pedestalH / 2 - discThick / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.05, 2.3, pedestalH, 64]} />
        <primitive object={pedestalMat} attach="material" />
      </mesh>

      {/* ── Main platform disc (top) ───────────────────────────────────── */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.2, discThick, 72]} />
        <primitive object={platformTopMat} attach="material" />
      </mesh>

      {/* ── Inner smaller raised disc (second tier) ────────────────────── */}
      {!isSimple && (
        <mesh position={[0, discThick / 2 + 0.025, 0]} receiveShadow>
          <cylinderGeometry args={[1.35, 1.42, 0.05, 64]} />
          <primitive object={platformSideMat} attach="material" />
        </mesh>
      )}

      {/* ── Ring overlays (flat, rotated horizontally) ─────────────────── */}
      {/* Outer ring */}
      <mesh
        ref={outerRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, discThick / 2 + 0.008, 0]}
      >
        <primitive object={outerRingGeom} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Mid ring */}
      {!isSimple && (
        <mesh
          ref={midRingRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, discThick / 2 + 0.006, 0]}
        >
          <primitive object={midRingGeom} />
          <meshBasicMaterial
            color="#00ccee"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Inner ring */}
      <mesh
        ref={innerRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, discThick / 2 + 0.005, 0]}
      >
        <primitive object={innerRingGeom} />
        <meshBasicMaterial
          color="#70d6ff"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Hovering energy disc (large, low opacity bloom target) ──────── */}
      <mesh
        ref={glowRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, discThick / 2 + 0.35, 0]}
      >
        <ringGeometry args={[0.3, 2.0, 64]} />
        <meshBasicMaterial
          color="#00ccff"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Rotating technical tick-marks ──────────────────────────────── */}
      {!isSimple && (
        <group
          ref={markingsRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, discThick / 2 + 0.01, 0]}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const isLong = i % 6 === 0;
            const innerR = isLong ? 1.92 : 1.97;
            const outerR = 2.12;
            const cx = Math.cos(angle) * ((innerR + outerR) / 2);
            const cy = Math.sin(angle) * ((innerR + outerR) / 2);
            const len = outerR - innerR;
            return (
              <mesh key={i} position={[cx, cy, 0]} rotation={[0, 0, angle - Math.PI / 2]}>
                <boxGeometry args={[isLong ? 0.012 : 0.006, len, 0.001]} />
                <meshBasicMaterial
                  color={isLong ? '#00e5ff' : '#0088aa'}
                  transparent
                  opacity={isLong ? 0.6 : 0.25}
                  depthWrite={false}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* ── Platform edge rim glow ─────────────────────────────────────── */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.21, 2.3, discThick, 72, 1, true]} />
        <meshBasicMaterial
          color="#00ccee"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* FIX 3: Removed platform particle dots */}

      {/* ── Platform lighting ──────────────────────────────────────────── */}
      <pointLight
        position={[0, discThick / 2 + 0.2, 0]}
        color="#00ccee"
        intensity={0.6}
        distance={4.5}
        decay={2}
      />
    </group>
  );
};

export default Platform;
