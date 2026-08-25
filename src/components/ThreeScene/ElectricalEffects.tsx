import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ElectricalEffectsProps {
  mode: 'cinematic' | 'reading';
  deviceTier: 'desktop' | 'tablet' | 'mobile';
  intensifyTrigger: number;
}

// Book world position bounds
const BOOK_WORLD_Y = 0.55;
const BOOK_W = 1.35;
const BOOK_H = 1.85;
const BOOK_D = 0.45;
const ARC_CLEAR = 0.22;

// ─────────────────────────────────────────────────────────────────────────────
// // FIX 8: REALISTIC MULTI-SEGMENT ELECTRIC ARCS WITH BRANCHING & GLOW
// ─────────────────────────────────────────────────────────────────────────────
interface ArcStrand {
  active: boolean;
  timer: number;
  duration: number;
  color: string;
  points: THREE.Vector3[];
  branchPoints?: THREE.Vector3[];
}

const SEGMENTS = 14;

const BookArcField: React.FC<{ bookY: number; deviceTier: string }> = ({ bookY, deviceTier }) => {
  const ARC_COUNT = deviceTier === 'desktop' ? 6 : 4;
  const lineCoreRefs = useRef<THREE.Line[]>([]);
  const lineGlowRefs = useRef<THREE.Line[]>([]);
  const branchRefs = useRef<THREE.Line[]>([]);

  // Generate safe start/end anchor points around book perimeter
  const getPerimeterPoint = (): THREE.Vector3 => {
    const face = Math.floor(Math.random() * 6);
    const hw = BOOK_W / 2 + ARC_CLEAR;
    const hh = BOOK_H / 2 + ARC_CLEAR;
    const hd = BOOK_D / 2 + ARC_CLEAR;

    switch (face) {
      case 0: // Front
        return new THREE.Vector3(
          (Math.random() - 0.5) * (BOOK_W + ARC_CLEAR * 1.5),
          bookY + (Math.random() - 0.5) * (BOOK_H + ARC_CLEAR * 1.5),
          hd + Math.random() * 0.15
        );
      case 1: // Back
        return new THREE.Vector3(
          (Math.random() - 0.5) * (BOOK_W + ARC_CLEAR * 1.5),
          bookY + (Math.random() - 0.5) * (BOOK_H + ARC_CLEAR * 1.5),
          -hd - Math.random() * 0.15
        );
      case 2: // Right
        return new THREE.Vector3(
          hw + Math.random() * 0.15,
          bookY + (Math.random() - 0.5) * (BOOK_H + ARC_CLEAR * 1.5),
          (Math.random() - 0.5) * (BOOK_D + ARC_CLEAR * 1.5)
        );
      case 3: // Left
        return new THREE.Vector3(
          -hw - Math.random() * 0.15,
          bookY + (Math.random() - 0.5) * (BOOK_H + ARC_CLEAR * 1.5),
          (Math.random() - 0.5) * (BOOK_D + ARC_CLEAR * 1.5)
        );
      case 4: // Top
        return new THREE.Vector3(
          (Math.random() - 0.5) * (BOOK_W + ARC_CLEAR * 1.5),
          bookY + hh + Math.random() * 0.15,
          (Math.random() - 0.5) * (BOOK_D + ARC_CLEAR * 1.5)
        );
      default: // Bottom
        return new THREE.Vector3(
          (Math.random() - 0.5) * (BOOK_W + ARC_CLEAR * 1.5),
          bookY - hh - Math.random() * 0.15,
          (Math.random() - 0.5) * (BOOK_D + ARC_CLEAR * 1.5)
        );
    }
  };

  const arcStates = useRef<ArcStrand[]>(
    Array.from({ length: ARC_COUNT }, (_, i) => ({
      active: true,
      timer: Math.random() * 0.3,
      duration: 0.08 + Math.random() * 0.12,
      color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? '#00f0ff' : '#38bdf8',
      points: Array.from({ length: SEGMENTS }, () => new THREE.Vector3()),
      branchPoints: Array.from({ length: 6 }, () => new THREE.Vector3()),
    }))
  );

  // Pre-allocated geometries for maximum performance (// FIX 6: Performance)
  const geometries = useMemo(() => {
    return Array.from({ length: ARC_COUNT }, () => {
      const gCore = new THREE.BufferGeometry();
      gCore.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SEGMENTS * 3), 3));
      const gGlow = new THREE.BufferGeometry();
      gGlow.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SEGMENTS * 3), 3));
      const gBranch = new THREE.BufferGeometry();
      gBranch.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * 3), 3));
      return { gCore, gGlow, gBranch };
    });
  }, [ARC_COUNT]);

  useFrame(() => {
    arcStates.current.forEach((arc, idx) => {
      const coreLine = lineCoreRefs.current[idx];
      const glowLine = lineGlowRefs.current[idx];
      const branchLine = branchRefs.current[idx];
      if (!coreLine || !glowLine) return;

      arc.timer -= 0.016;

      if (arc.timer <= 0) {
        // Regenerate electric arc path
        arc.timer = 0.06 + Math.random() * 0.12;
        arc.duration = 0.08 + Math.random() * 0.1;
        arc.active = true;

        const pStart = getPerimeterPoint();
        const pEnd = getPerimeterPoint();

        const posCore = coreLine.geometry.attributes.position.array as Float32Array;
        const posGlow = glowLine.geometry.attributes.position.array as Float32Array;

        // Midpoint displacement noise
        let prevX = pStart.x;
        let prevY = pStart.y;
        let prevZ = pStart.z;

        for (let i = 0; i < SEGMENTS; i++) {
          const t = i / (SEGMENTS - 1);
          const base = new THREE.Vector3().lerpVectors(pStart, pEnd, t);

          // Electric jagged noise displacement
          const envelope = Math.sin(t * Math.PI);
          const jitter = envelope * (0.08 + Math.random() * 0.09);

          const px = base.x + (Math.random() - 0.5) * jitter;
          const py = base.y + (Math.random() - 0.5) * jitter;
          const pz = base.z + (Math.random() - 0.5) * jitter;

          posCore[i * 3] = px;
          posCore[i * 3 + 1] = py;
          posCore[i * 3 + 2] = pz;

          posGlow[i * 3] = px;
          posGlow[i * 3 + 1] = py;
          posGlow[i * 3 + 2] = pz;

          // Branch arc from middle
          if (i === Math.floor(SEGMENTS / 2) && branchLine) {
            const bPos = branchLine.geometry.attributes.position.array as Float32Array;
            let bx = px;
            let by = py;
            let bz = pz;
            for (let b = 0; b < 6; b++) {
              bPos[b * 3] = bx;
              bPos[b * 3 + 1] = by;
              bPos[b * 3 + 2] = bz;
              bx += (Math.random() - 0.5) * 0.08;
              by += (Math.random() - 0.5) * 0.08;
              bz += (Math.random() - 0.5) * 0.08;
            }
            branchLine.geometry.attributes.position.needsUpdate = true;
          }

          prevX = px;
          prevY = py;
          prevZ = pz;
        }

        coreLine.geometry.attributes.position.needsUpdate = true;
        glowLine.geometry.attributes.position.needsUpdate = true;
      }

      // Dynamic electric flicker
      if (arc.active) {
        arc.duration -= 0.016;
        const opacity = Math.random() > 0.1 ? 0.75 + Math.random() * 0.25 : 0;
        (coreLine.material as THREE.LineBasicMaterial).opacity = opacity;
        (glowLine.material as THREE.LineBasicMaterial).opacity = opacity * 0.5;
        if (branchLine) (branchLine.material as THREE.LineBasicMaterial).opacity = opacity * 0.4;

        if (arc.duration <= 0) {
          (coreLine.material as THREE.LineBasicMaterial).opacity = 0;
          (glowLine.material as THREE.LineBasicMaterial).opacity = 0;
          if (branchLine) (branchLine.material as THREE.LineBasicMaterial).opacity = 0;
          arc.active = false;
        }
      }
    });
  });

  return (
    <group renderOrder={10}>
      {geometries.map((geom, i) => (
        <group key={i}>
          {/* Core high-intensity white/cyan lightning line */}
          <primitive
            object={
              new THREE.Line(
                geom.gCore,
                new THREE.LineBasicMaterial({
                  color: '#ffffff',
                  transparent: true,
                  opacity: 0.85,
                  blending: THREE.AdditiveBlending,
                  depthWrite: false,
                })
              )
            }
            ref={(el: THREE.Line | null) => {
              if (el) lineCoreRefs.current[i] = el;
            }}
          />
          {/* Outer glowing electric sheath */}
          <primitive
            object={
              new THREE.Line(
                geom.gGlow,
                new THREE.LineBasicMaterial({
                  color: '#00e5ff',
                  transparent: true,
                  opacity: 0.45,
                  blending: THREE.AdditiveBlending,
                  depthWrite: false,
                })
              )
            }
            ref={(el: THREE.Line | null) => {
              if (el) lineGlowRefs.current[i] = el;
            }}
          />
          {/* Branching lightning filament */}
          <primitive
            object={
              new THREE.Line(
                geom.gBranch,
                new THREE.LineBasicMaterial({
                  color: '#38bdf8',
                  transparent: true,
                  opacity: 0.35,
                  blending: THREE.AdditiveBlending,
                  depthWrite: false,
                })
              )
            }
            ref={(el: THREE.Line | null) => {
              if (el) branchRefs.current[i] = el;
            }}
          />
        </group>
      ))}
    </group>
  );
};

// ── Energy ring at platform level ────────────────────────────────────────────
const EnergyRing: React.FC = () => {
  const ringRef = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const PLATFORM_Y = -1.5 + 0.22 + 0.06 + 0.35;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.22 + Math.sin(t * 1.6) * 0.08;
      ringRef.current.scale.setScalar(1 + Math.sin(t * 0.9) * 0.03);
    }

    if (ring2Ref.current) {
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + Math.sin(t * 2.0 + 1.5) * 0.05;
      ring2Ref.current.scale.setScalar(1 + Math.sin(t * 1.2 + 0.8) * 0.04);
      ring2Ref.current.rotation.z = t * 0.25;
    }
  });

  return (
    <group position={[0, PLATFORM_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ringRef} renderOrder={5}>
        <ringGeometry args={[1.5, 2.1, 72]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={ring2Ref} renderOrder={5}>
        <ringGeometry args={[0.6, 1.3, 48]} />
        <meshBasicMaterial
          color="#4488ff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// ── Main ElectricalEffects component ─────────────────────────────────────────
const ElectricalEffects: React.FC<ElectricalEffectsProps> = ({
  mode,
  deviceTier,
  intensifyTrigger,
}) => {
  const prevIntensify = useRef(intensifyTrigger);
  const [isIntensifying, setIsIntensifying] = React.useState(false);

  React.useEffect(() => {
    if (intensifyTrigger !== prevIntensify.current) {
      prevIntensify.current = intensifyTrigger;
      setIsIntensifying(true);
      const timer = setTimeout(() => setIsIntensifying(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [intensifyTrigger]);

  const bookY = mode === 'cinematic' ? BOOK_WORLD_Y : -1.5;

  return (
    <group>
      {/* // FIX 8: Realistic animated electric arcs with cyan emissive glow */}
      {mode === 'cinematic' && (
        <BookArcField bookY={bookY} deviceTier={deviceTier} />
      )}

      {/* Platform energy ring */}
      <EnergyRing />

      {/* Energy glow point light */}
      <pointLight
        position={[0, BOOK_WORLD_Y, 0]}
        color="#00ccff"
        intensity={isIntensifying ? 0.9 : 0.4}
        distance={3.5}
        decay={2}
      />
    </group>
  );
};

export default ElectricalEffects;
