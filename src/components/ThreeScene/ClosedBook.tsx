import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ClosedBookProps {
  mode: 'cinematic' | 'reading';
  onClickBook: () => void;
  frontCoverImageUrl?: string;
  backCoverImageUrl?: string;
}

// ── Main ClosedBook Component ───────────────────────────────────────────────
// Uses a single BoxGeometry with a material array for crisp per-face texturing.
// Electric arcs are NOT children of this group — they live in ElectricalEffects.tsx
// anchored to world space to avoid geometry corruption.
const ClosedBook: React.FC<ClosedBookProps> = ({
  mode,
  onClickBook,
  frontCoverImageUrl = '/front_cover.png',
  backCoverImageUrl = '/back_cover.png',
}) => {
  const groupRef    = useRef<THREE.Group>(null!);
  const meshRef     = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // Book dimensions
  const bookW = 1.3;
  const bookH = 1.8;
  const bookD = 0.42;

  // Y positions
  const cinematicY = 0.55;
  const readingY   = -1.5;

  const animState = useRef({ y: cinematicY, rotY: 0, scale: 1 });

  // ── Cover textures ────────────────────────────────────────────────────────
  const [frontCoverTexture, setFrontCoverTexture] = useState<THREE.Texture | null>(null);
  const [backCoverTexture, setBackCoverTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(frontCoverImageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      setFrontCoverTexture(tex);
    });
  }, [frontCoverImageUrl]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(backCoverImageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      setBackCoverTexture(tex);
    });
  }, [backCoverImageUrl]);

  // ── Cursor ────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.cursor = hovered && mode === 'cinematic' ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered, mode]);

  // ── Material array (imperatively created for BoxGeometry face assignment) ─
  // Three.js BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
  const matArray = useMemo<THREE.Material[]>(() => {
    const pageEdgeMat = new THREE.MeshStandardMaterial({
      color: '#f0ead8',
      roughness: 0.88,
      metalness: 0.0,
    });

    const spineMat = new THREE.MeshStandardMaterial({
      color: '#1a1820',
      roughness: 0.65,
      metalness: 0.06,
    });

    const backCoverMat = backCoverTexture
      ? new THREE.MeshStandardMaterial({
          map: backCoverTexture,
          roughness: 0.4,
          metalness: 0.1,
        })
      : new THREE.MeshStandardMaterial({
          color: '#1a1820',
          roughness: 0.5,
          metalness: 0.1,
        });

    const frontCoverMat = frontCoverTexture
      ? new THREE.MeshStandardMaterial({
          map: frontCoverTexture,
          roughness: 0.4,
          metalness: 0.1,
        })
      : new THREE.MeshStandardMaterial({
          color: '#1a1820',
          roughness: 0.45,
          metalness: 0.1,
        });

    return [
      pageEdgeMat,   // +X  pages (right side)
      spineMat,      // -X  spine (left side)
      pageEdgeMat,   // +Y  top edge
      pageEdgeMat,   // -Y  bottom edge
      frontCoverMat, // +Z  front cover (faces camera on startup)
      backCoverMat,  // -Z  back cover
    ];
  }, [frontCoverTexture, backCoverTexture]);

  // Apply material array to mesh imperatively (avoids R3F JSX multi-material issues)
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material = matArray;
    }
  }, [matArray]);

  // ── Geometry ──────────────────────────────────────────────────────────────
  const boxGeo = useMemo(() => new THREE.BoxGeometry(bookW, bookH, bookD), []);

  // ── Animation loop ────────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t  = clock.getElapsedTime();
    const st = animState.current;

    if (mode === 'cinematic') {
      const floatY = cinematicY + Math.sin(t * 0.55) * 0.09;
      st.y = THREE.MathUtils.lerp(st.y, floatY, 0.06);
      st.rotY += 0.0042; // ~1 full rotation per 25s
      st.scale = THREE.MathUtils.lerp(st.scale, 1.0, 0.05);
    } else {
      st.y     = THREE.MathUtils.lerp(st.y, readingY, 0.045);
      st.scale = THREE.MathUtils.lerp(st.scale, 0.01, 0.03);
    }

    groupRef.current.position.y = st.y;
    groupRef.current.rotation.y = st.rotY;
    groupRef.current.scale.setScalar(Math.max(st.scale, 0.001));
    groupRef.current.visible = st.scale > 0.01;
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        if (mode === 'cinematic') {
          e.stopPropagation();
          onClickBook();
        }
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* ── Book mesh: single BoxGeometry, material array set imperatively ─ */}
      <mesh ref={meshRef} geometry={boxGeo} castShadow>
        {/* Dummy placeholder material — overridden by useEffect above */}
        <meshStandardMaterial />
      </mesh>

      {/* ── Subtle book glow point lights ─────────────────────────────── */}
      <pointLight
        position={[0, 0, bookD + 0.4]}
        color="#00e5ff"
        intensity={0.4}
        distance={2.8}
        decay={2}
      />
      <pointLight
        position={[0, 0, -(bookD + 0.4)]}
        color="#00aaff"
        intensity={0.3}
        distance={2.2}
        decay={2}
      />
    </group>
  );
};

export default ClosedBook;
