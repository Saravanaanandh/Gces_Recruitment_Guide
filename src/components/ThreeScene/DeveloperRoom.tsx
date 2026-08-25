import React, { useMemo, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import DeveloperWorkspace, { FocusTarget } from './DeveloperWorkspace';

interface DeveloperRoomProps {
  deviceTier: 'desktop' | 'tablet' | 'mobile';
  isDayMode?: boolean;
  onToggleDayMode?: () => void;
  focusedTarget?: FocusTarget;
  onFocusTarget?: (target: FocusTarget) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Wall Sconce Fixture
// ─────────────────────────────────────────────────────────────────────────────
const WallSconce: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  lightColor?: string;
  isDayMode?: boolean;
}> = ({
  position,
  rotation = [0, 0, 0],
  lightColor = '#ffd4a0',
  isDayMode = false,
}) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[0.08, 0.16, 0.04]} />
        <meshStandardMaterial color="#1a1820" metalness={0.8} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 12]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, -0.04, 0.14]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.14, 16, 1, true]} />
        <meshStandardMaterial
          color="#e8d5a0"
          metalness={0.1}
          roughness={0.6}
          side={THREE.DoubleSide}
          emissive="#c8a050"
          emissiveIntensity={isDayMode ? 0.4 : 0.25}
        />
      </mesh>

      <mesh position={[0, -0.02, 0.14]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#fffde0" />
      </mesh>

      <pointLight
        position={[0, -0.1, 0.18]}
        color={lightColor}
        intensity={isDayMode ? 1.5 : 0.9}
        distance={6}
        decay={2}
      />
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Modern 3-Seater Sofa
// ─────────────────────────────────────────────────────────────────────────────
const ModernSofa: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({
  position,
  rotation = [0, 0, 0],
}) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.08, 0.96]} />
        <meshStandardMaterial color="#221e1a" roughness={0.7} metalness={0.1} />
      </mesh>
      {[
        [-1.18, 0.07, 0.38],
        [1.18, 0.07, 0.38],
        [-1.18, 0.07, -0.38],
        [1.18, 0.07, -0.38],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.022, 0.016, 0.14, 12]} />
          <meshStandardMaterial color="#111116" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {[-0.78, 0, 0.78].map((x, i) => (
        <mesh key={i} position={[x, 0.28, 0.04]} castShadow receiveShadow>
          <boxGeometry args={[0.74, 0.2, 0.78]} />
          <meshStandardMaterial color="#28221c" roughness={0.75} metalness={0.05} />
        </mesh>
      ))}

      {[-0.78, 0, 0.78].map((x, i) => (
        <mesh key={i} position={[x, 0.6, -0.34]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.74, 0.48, 0.2]} />
          <meshStandardMaterial color="#28221c" roughness={0.75} metalness={0.05} />
        </mesh>
      ))}

      <mesh position={[-1.24, 0.44, 0.04]} castShadow>
        <boxGeometry args={[0.18, 0.52, 0.88]} />
        <meshStandardMaterial color="#1f1b16" roughness={0.8} />
      </mesh>
      <mesh position={[1.24, 0.44, 0.04]} castShadow>
        <boxGeometry args={[0.18, 0.52, 0.88]} />
        <meshStandardMaterial color="#1f1b16" roughness={0.8} />
      </mesh>

      <mesh position={[-0.82, 0.46, -0.16]} rotation={[0.15, 0.25, -0.2]} castShadow>
        <boxGeometry args={[0.34, 0.34, 0.1]} />
        <meshStandardMaterial color="#d4a373" roughness={0.65} />
      </mesh>
      <mesh position={[0.82, 0.46, -0.16]} rotation={[0.15, -0.25, 0.2]} castShadow>
        <boxGeometry args={[0.34, 0.34, 0.1]} />
        <meshStandardMaterial color="#c07d52" roughness={0.65} />
      </mesh>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// // TASK 1: POPULATED BOOKSHELF WITH DETAILED ARRANGED BOOKS (Hollow Planks)
// ─────────────────────────────────────────────────────────────────────────────
const SHELF_BOOK_PALETTE = [
  { color: '#1e3a8a', spine: '#172554', title: 'Clean Code', author: 'Martin', gold: true },
  { color: '#b91c1c', spine: '#7f1d1d', title: 'Design Patterns', author: 'GoF', gold: true },
  { color: '#047857', spine: '#064e3b', title: 'Algorithms', author: 'Cormen', gold: false },
  { color: '#d97706', spine: '#78350f', title: 'Pragmatic Dev', author: 'Hunt', gold: true },
  { color: '#4338ca', spine: '#312e81', title: 'Deep Learning', author: 'Goodfellow', gold: true },
  { color: '#701a75', spine: '#4a044e', title: 'System Design', author: 'Alex Xu', gold: true },
  { color: '#0f766e', spine: '#134e4a', title: 'Refactoring', author: 'Fowler', gold: false },
  { color: '#991b1b', spine: '#450a0a', title: 'Cloud Architecture', author: 'AWS', gold: true },
  { color: '#15803d', spine: '#14532d', title: 'AI Foundations', author: 'Russell', gold: false },
  { color: '#6b21a8', spine: '#3b0764', title: 'Quantum Computing', author: 'Nielsen', gold: true },
  { color: '#0369a1', spine: '#0c4a6e', title: 'TypeScript Pro', author: 'Cherny', gold: true },
  { color: '#c2410c', spine: '#7c2d12', title: 'Rust In Action', author: 'McNamara', gold: false },
];

const WallBookshelf: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({
  position,
  rotation = [0, 0, 0],
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Outer wooden structure (Open front, hollow interior so books are 100% visible) */}
      {/* Left side panel */}
      <mesh position={[-0.83, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 2.4, 0.38]} />
        <meshStandardMaterial color="#352e25" roughness={0.65} metalness={0.1} />
      </mesh>
      {/* Right side panel */}
      <mesh position={[0.83, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 2.4, 0.38]} />
        <meshStandardMaterial color="#352e25" roughness={0.65} metalness={0.1} />
      </mesh>
      {/* Top panel */}
      <mesh position={[0, 2.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.05, 0.4]} />
        <meshStandardMaterial color="#352e25" roughness={0.65} metalness={0.1} />
      </mesh>
      {/* Bottom base panel */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.06, 0.4]} />
        <meshStandardMaterial color="#2d261e" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 1.2, -0.18]}>
        <boxGeometry args={[1.66, 2.34, 0.02]} />
        <meshStandardMaterial color="#241e17" roughness={0.8} />
      </mesh>

      {/* 3 Horizontal Shelves */}
      {[0.6, 1.2, 1.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.62, 0.035, 0.36]} />
          <meshStandardMaterial color="#3e362c" roughness={0.6} metalness={0.12} />
        </mesh>
      ))}

      {/* ── Shelf 1 (Bottom): Heavy hardcovers & manuals in upright row ─── */}
      <group position={[0, 0.06, 0.02]}>
        {SHELF_BOOK_PALETTE.slice(0, 8).map((b, i) => (
          <group key={i} position={[-0.72 + i * 0.15, 0.22, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.045, 0.38, 0.26]} />
              <meshStandardMaterial color={b.color} roughness={0.4} metalness={0.1} />
            </mesh>
            {/* Golden spine band */}
            {b.gold && (
              <mesh position={[0, 0.08, 0.132]}>
                <boxGeometry args={[0.042, 0.02, 0.002]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
              </mesh>
            )}
          </group>
        ))}
        {/* Bookend on right */}
        <mesh position={[0.55, 0.12, 0]} castShadow>
          <boxGeometry args={[0.04, 0.22, 0.22]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ── Shelf 2: Mixed upright volumes & stacked books ──────────────── */}
      <group position={[0, 0.635, 0.02]}>
        {/* Upright row */}
        {SHELF_BOOK_PALETTE.slice(4, 9).map((b, i) => (
          <group key={i} position={[-0.72 + i * 0.16, 0.2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.048, 0.34, 0.24]} />
              <meshStandardMaterial color={b.color} roughness={0.45} />
            </mesh>
          </group>
        ))}
        {/* Angled leaning book */}
        <mesh position={[0.15, 0.17, 0]} rotation={[0, 0, -0.26]} castShadow>
          <boxGeometry args={[0.046, 0.32, 0.23]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.4} />
        </mesh>
        {/* Horizontal Stacked Volumes */}
        <mesh position={[0.48, 0.035, 0]} castShadow>
          <boxGeometry args={[0.28, 0.05, 0.22]} />
          <meshStandardMaterial color="#0f766e" roughness={0.5} />
        </mesh>
        <mesh position={[0.48, 0.085, 0]} castShadow>
          <boxGeometry args={[0.26, 0.045, 0.21]} />
          <meshStandardMaterial color="#d97706" roughness={0.5} />
        </mesh>
        <mesh position={[0.48, 0.13, 0]} castShadow>
          <boxGeometry args={[0.24, 0.04, 0.2]} />
          <meshStandardMaterial color="#4338ca" roughness={0.5} />
        </mesh>
      </group>

      {/* ── Shelf 3: Tech Volumes & Reference Guides ────────────────────── */}
      <group position={[0, 1.235, 0.02]}>
        {SHELF_BOOK_PALETTE.slice(2, 10).map((b, i) => (
          <group key={i} position={[-0.68 + i * 0.14, 0.18, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.042, 0.3, 0.23]} />
              <meshStandardMaterial color={b.color} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.06, 0.117]}>
              <boxGeometry args={[0.038, 0.015, 0.002]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Shelf 4 (Top): Books with Decorative Potted Succulent ───────── */}
      <group position={[0, 1.835, 0.02]}>
        {/* Potted plant on left */}
        <mesh position={[-0.52, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.05, 0.13, 16]} />
          <meshStandardMaterial color="#eae5dd" roughness={0.3} />
        </mesh>
        <mesh position={[-0.52, 0.16, 0]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.7} />
        </mesh>
        {/* Upright books */}
        {SHELF_BOOK_PALETTE.slice(0, 5).map((b, i) => (
          <group key={i} position={[-0.1 + i * 0.15, 0.16, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.04, 0.26, 0.2]} />
              <meshStandardMaterial color={b.color} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// // TASK 6: INTERACTIVE WRITABLE BLACKBOARD (Click to Focus & Write)
// ─────────────────────────────────────────────────────────────────────────────
interface WritableBlackboardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isFocused?: boolean;
  onFocus?: () => void;
}

const WritableBlackboard: React.FC<WritableBlackboardProps> = ({
  position,
  rotation = [0, 0, 0],
  isFocused = false,
  onFocus,
}) => {
  const { canvas, ctx } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1536;
    c.height = 768;
    const g = c.getContext('2d')!;

    // Dark slate chalkboard tone
    g.fillStyle = '#161c18';
    g.fillRect(0, 0, 1536, 768);

    // Subtle radial slate texture
    const grad = g.createRadialGradient(768, 384, 100, 768, 384, 850);
    grad.addColorStop(0, 'rgba(255,255,255,0.03)');
    grad.addColorStop(1, 'rgba(0,0,0,0.3)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1536, 768);

    // Welcome title & chalk instructions
    g.fillStyle = 'rgba(255, 255, 255, 0.9)';
    g.font = 'bold 38px "Segoe UI", sans-serif';
    g.textAlign = 'center';
    g.fillText('✏️ Developer Innovation Board', 768, 65);

    g.fillStyle = 'rgba(255, 255, 255, 0.5)';
    g.font = '20px "Segoe UI", sans-serif';
    g.fillText('[ Click & drag to write/draw in chalk | Esc to go back ]', 768, 105);

    g.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(380, 128);
    g.lineTo(1156, 128);
    g.stroke();

    return { canvas: c, ctx: g };
  }, []);

  const boardTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  }, [canvas]);

  const isDrawing = useRef(false);
  const lastCoord = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    // If not yet focused, clicking focuses the blackboard view
    if (!isFocused) {
      onFocus?.();
    }

    isDrawing.current = true;
    if (e.uv) {
      const x = e.uv.x * 1536;
      const y = (1 - e.uv.y) * 768;
      lastCoord.current = { x, y };

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      boardTexture.needsUpdate = true;
    }
  };

  const handlePointerMove = (e: any) => {
    if (isDrawing.current && (e.buttons === 1 || e.buttons === 2 || e.nativeEvent.buttons > 0)) {
      e.stopPropagation();
      if (e.uv && lastCoord.current) {
        const x = e.uv.x * 1536;
        const y = (1 - e.uv.y) * 768;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 3;

        ctx.beginPath();
        ctx.moveTo(lastCoord.current.x, lastCoord.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastCoord.current = { x, y };
        boardTexture.needsUpdate = true;
      }
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    isDrawing.current = false;
    lastCoord.current = null;
  };

  const handleClear = (e: any) => {
    e.stopPropagation();
    ctx.fillStyle = '#161c18';
    ctx.fillRect(0, 0, 1536, 768);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 38px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✏️ Developer Innovation Board', 768, 65);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '20px "Segoe UI", sans-serif';
    ctx.fillText('[ Click & drag to write/draw in chalk | Esc to go back ]', 768, 105);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(380, 128);
    ctx.lineTo(1156, 128);
    ctx.stroke();

    boardTexture.needsUpdate = true;
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Wooden Frame */}
      <mesh
        position={[0, 0, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (!isFocused) onFocus?.();
        }}
        onPointerOver={(e) => {
          if (!isFocused) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[2.84, 1.44, 0.05]} />
        <meshStandardMaterial color="#4a3525" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Blackboard Writable Surface */}
      <mesh
        position={[0, 0, 0.028]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = isFocused ? 'crosshair' : 'pointer';
        }}
        onPointerOut={() => {
          isDrawing.current = false;
          lastCoord.current = null;
          document.body.style.cursor = 'auto';
        }}
        onContextMenu={(e) => {
          e.nativeEvent.preventDefault();
          e.stopPropagation();
        }}
      >
        <planeGeometry args={[2.72, 1.32]} />
        <meshStandardMaterial map={boardTexture} roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Bottom Chalk Tray */}
      <mesh position={[0, -0.73, 0.08]} castShadow>
        <boxGeometry args={[2.76, 0.03, 0.12]} />
        <meshStandardMaterial color="#3d2a1d" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* White Chalk Sticks & Eraser on Tray */}
      <mesh position={[-0.4, -0.705, 0.08]} rotation={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.07, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[-0.45, -0.705, 0.09]} rotation={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.06, 8]} />
        <meshStandardMaterial color="#fef08a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.6, -0.7, 0.08]}>
        <boxGeometry args={[0.12, 0.03, 0.06]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>

      {/* Interactive "Clear" Badge */}
      <group
        position={[1.18, -0.58, 0.035]}
        onClick={handleClear}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh>
          <boxGeometry args={[0.22, 0.07, 0.01]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Decorative Flower Pot Near Entrance Door
// ─────────────────────────────────────────────────────────────────────────────
const EntrancePottedPlant: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.18, 0.64, 24]} />
        <meshStandardMaterial color="#e5ded6" roughness={0.35} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
        <meshStandardMaterial color="#3a2518" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.65} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.24, 14, 14]} />
        <meshStandardMaterial color="#40916c" roughness={0.65} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.48, 0]} castShadow>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#52b788" roughness={0.6} metalness={0.05} />
      </mesh>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Elliptical Door Mat in Front of Door
// ─────────────────────────────────────────────────────────────────────────────
const EllipticalDoorMat: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.3, 0.75]} />
        <meshStandardMaterial color="#64574a" roughness={0.95} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.18, 0.63]} />
        <meshStandardMaterial color="#7a6c5d" roughness={0.9} metalness={0.02} />
      </mesh>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Interactive Wall Light Switch near the Door
// ─────────────────────────────────────────────────────────────────────────────
const WallLightSwitch: React.FC<{
  position: [number, number, number];
  isDayMode?: boolean;
  onToggle?: () => void;
}> = ({
  position,
  isDayMode = false,
  onToggle,
}) => {
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.24, 0.02]} />
        <meshStandardMaterial color="#e8e2d8" roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh
        position={[0, 0, 0.015]}
        rotation={[isDayMode ? 0.35 : -0.35, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.04, 0.08, 0.02]} />
        <meshStandardMaterial
          color={isDayMode ? '#22c55e' : '#f59e0b'}
          roughness={0.2}
          emissive={isDayMode ? '#22c55e' : '#f59e0b'}
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DEVELOPER ROOM COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const DeveloperRoom: React.FC<DeveloperRoomProps> = ({
  deviceTier,
  isDayMode = false,
  onToggleDayMode,
  focusedTarget = 'none',
  onFocusTarget = () => {},
}) => {
  const roomW = 14;
  const roomD = 12;
  const roomH = 5;
  const halfW = roomW / 2;
  const halfD = roomD / 2;
  const floorY = -1.5;
  const ceilingY = 3.5;

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#6e7380',
        roughness: 0.88,
        metalness: 0.05,
      }),
    []
  );

  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1820',
        roughness: 0.3,
        metalness: 0.45,
      }),
    []
  );

  const ceilingTrimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#464a54',
        roughness: 0.8,
        metalness: 0.1,
      }),
    []
  );

  return (
    <group>
      {/* ── Floor ───────────────────────────────────────────────────────── */}
      <mesh
        position={[0, floorY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={floorMat}
        receiveShadow
      >
        <planeGeometry args={[roomW, roomD]} />
      </mesh>

      {/* ── Ceiling ─────────────────────────────────────────────────────── */}
      <mesh
        position={[0, ceilingY, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={wallMat}
      >
        <planeGeometry args={[roomW, roomD]} />
      </mesh>

      {/* ── Wall 1: Left Wall (X = -7) ──────────────────────────────────── */}
      <mesh
        position={[-halfW, (ceilingY + floorY) / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[roomD, roomH]} />
      </mesh>

      {/* ── Wall 2: Back Wall (Z = -6) ──────────────────────────────────── */}
      <mesh
        position={[0, (ceilingY + floorY) / 2, -halfD]}
        rotation={[0, 0, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[roomW, roomH]} />
      </mesh>

      {/* ── Wall 3: Right Wall (X = +7) ─────────────────────────────────── */}
      <mesh
        position={[halfW, (ceilingY + floorY) / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[roomD, roomH]} />
      </mesh>

      {/* ── Wall 4: Front Wall (Z = +6, Behind Book from Back View) ─────── */}
      <mesh
        position={[0, (ceilingY + floorY) / 2, halfD]}
        rotation={[0, Math.PI, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[roomW, roomH]} />
      </mesh>

      {/* Gentle illumination for Wall 4 */}
      <pointLight
        position={[0, 3.5, 3.2]}
        color="#fff2e2"
        intensity={isDayMode ? 1.0 : 0.35}
        distance={10}
        decay={2}
      />

      {/* ── Ceiling border trims ────────────────────────────────────────── */}
      <mesh position={[0, ceilingY - 0.04, -halfD + 0.04]} material={ceilingTrimMat}>
        <boxGeometry args={[roomW, 0.08, 0.08]} />
      </mesh>
      <mesh position={[0, ceilingY - 0.04, halfD - 0.04]} material={ceilingTrimMat}>
        <boxGeometry args={[roomW, 0.08, 0.08]} />
      </mesh>
      <mesh position={[-halfW + 0.04, ceilingY - 0.04, 0]} material={ceilingTrimMat}>
        <boxGeometry args={[0.08, 0.08, roomD]} />
      </mesh>
      <mesh position={[halfW - 0.04, ceilingY - 0.04, 0]} material={ceilingTrimMat}>
        <boxGeometry args={[0.08, 0.08, roomD]} />
      </mesh>

      {/* ── Baseboard trims ─────────────────────────────────────────────── */}
      <mesh position={[0, floorY + 0.08, -halfD + 0.04]}>
        <boxGeometry args={[roomW, 0.16, 0.06]} />
        <meshStandardMaterial color="#464a54" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, floorY + 0.08, halfD - 0.04]}>
        <boxGeometry args={[roomW, 0.16, 0.06]} />
        <meshStandardMaterial color="#464a54" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[-halfW + 0.04, floorY + 0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, roomD]} />
        <meshStandardMaterial color="#464a54" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[halfW - 0.04, floorY + 0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, roomD]} />
        <meshStandardMaterial color="#464a54" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* ── Entrance Door on back wall ──────────────────────────────────── */}
      <group position={[4.5, floorY, -halfD + 0.05]}>
        <mesh position={[0, 0.5, 0.01]}>
          <boxGeometry args={[1.0, 2.4, 0.06]} />
          <meshStandardMaterial color="#383b44" roughness={0.8} metalness={0.05} />
        </mesh>
        <mesh position={[-0.56, 0.5, 0.02]}>
          <boxGeometry args={[0.1, 2.5, 0.08]} />
          <meshStandardMaterial color="#4a4e58" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0.56, 0.5, 0.02]}>
          <boxGeometry args={[0.1, 2.5, 0.08]} />
          <meshStandardMaterial color="#4a4e58" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0, 1.77, 0.02]}>
          <boxGeometry args={[1.22, 0.12, 0.08]} />
          <meshStandardMaterial color="#4a4e58" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0.38, 0.45, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ── Elliptical Door Mat ─────────────────────────────────────────── */}
      <EllipticalDoorMat position={[4.5, floorY + 0.005, -halfD + 0.85]} />

      {/* ── Decorative Flower Pot near door ─────────────────────────────── */}
      <EntrancePottedPlant position={[3.5, floorY, -halfD + 0.75]} />

      {/* ── TASK 1: Populated Wall Bookshelf with Arranged Books ────────── */}
      <WallBookshelf
        position={[3.8, floorY, halfD - 0.2]}
        rotation={[0, Math.PI, 0]}
      />

      {/* ── TASK 5: Repositioned Light Source HIGHER on Wall ─────────────── */}
      <WallSconce
        position={[-1.2, 2.55, halfD - 0.08]}
        rotation={[0, Math.PI, 0]}
        lightColor="#ffd4a0"
        isDayMode={isDayMode}
      />

      {/* ── TASK 6: Interactive Writable Blackboard Mounted on Wall ─────── */}
      <WritableBlackboard
        position={[-1.2, 0.55, halfD - 0.06]}
        rotation={[0, Math.PI, 0]}
        isFocused={focusedTarget === 'board'}
        onFocus={() => onFocusTarget?.('board')}
      />

      {/* ── Interactive Wall Light Switch near Door ─────────────────────── */}
      <WallLightSwitch
        position={[3.7, 0.15, -halfD + 0.06]}
        isDayMode={isDayMode}
        onToggle={onToggleDayMode}
      />

      {/* ── Modern 3-Seater Sofa ────────────────────────────────────────── */}
      <ModernSofa
        position={[1.8, floorY, -4.4]}
        rotation={[0, 0, 0]}
      />

      {/* ── Wall Sconce on Right Wall ───────────────────────────────────── */}
      <WallSconce
        position={[halfW - 0.08, 1.2, -1.5]}
        rotation={[0, -Math.PI / 2, 0]}
        lightColor="#ffd4a0"
        isDayMode={isDayMode}
      />

      {/* ── Floor reflection plane ──────────────────────────────────────── */}
      {deviceTier === 'desktop' && (
        <mesh position={[0, floorY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[roomW, roomD]} />
          <meshStandardMaterial
            color="#1a1820"
            roughness={0.2}
            metalness={0.6}
            transparent
            opacity={0.55}
            envMapIntensity={1.2}
          />
        </mesh>
      )}

      {/* ── DEVELOPER WORKSPACE SET DRESSING ────────────────────────────── */}
      <DeveloperWorkspace
        deviceTier={deviceTier}
        focusedTarget={focusedTarget}
        onFocusTarget={onFocusTarget}
        isDayMode={isDayMode}
      />
    </group>
  );
};

export default DeveloperRoom;
