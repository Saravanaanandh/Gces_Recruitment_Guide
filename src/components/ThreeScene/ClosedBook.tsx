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
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // Exact coordinates of coffee table in test.glb
  const TABLE_X = -0.3702;
  const TABLE_Z = -0.7452;
  const TABLE_TOP_Y = -0.9219;

  // Reduced, realistic brochure dimensions to comfortably fit on the coffee table (0.7x0.7m)
  const bookW = 0.34;
  const bookH = 0.46;
  const bookD = 0.038;

  // Resting height on table surface
  const restY = TABLE_TOP_Y + bookD / 2; // -0.9029
  const hoverY = restY + 0.025; // Subtle 2.5cm interactive elevation on hover
  const readingY = -1.4;

  const animState = useRef({
    y: restY,
    rotX: -Math.PI / 2 + 0.04,
    scale: 1,
  });

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
      frontCoverMat, // +Z  front cover (faces up toward camera when rotated)
      backCoverMat,  // -Z  back cover (rests on table)
    ];
  }, [frontCoverTexture, backCoverTexture]);

  // Apply material array to mesh imperatively
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material = matArray;
    }
  }, [matArray]);

  // ── Geometry ──────────────────────────────────────────────────────────────
  const boxGeo = useMemo(() => new THREE.BoxGeometry(bookW, bookH, bookD), []);

  // ── Animation loop ────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const st = animState.current;

    if (mode === 'cinematic') {
      const targetY = hovered ? hoverY : restY;
      const targetTilt = hovered ? -Math.PI / 2 + 0.14 : -Math.PI / 2 + 0.04;
      const targetScale = hovered ? 1.03 : 1.0;

      // Smooth interactive damping
      st.y = THREE.MathUtils.damp(st.y, targetY, 6, delta);
      st.rotX = THREE.MathUtils.damp(st.rotX, targetTilt, 6, delta);
      st.scale = THREE.MathUtils.damp(st.scale, targetScale, 6, delta);

      groupRef.current.position.set(TABLE_X, st.y, TABLE_Z);
      groupRef.current.rotation.set(st.rotX, 0, -0.05);
      groupRef.current.scale.setScalar(st.scale);
      groupRef.current.visible = true;
    } else {
      st.y = THREE.MathUtils.damp(st.y, readingY, 5, delta);
      st.scale = THREE.MathUtils.damp(st.scale, 0.01, 5, delta);

      groupRef.current.position.set(TABLE_X, st.y, TABLE_Z);
      groupRef.current.scale.setScalar(Math.max(st.scale, 0.001));
      groupRef.current.visible = st.scale > 0.02;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[TABLE_X, restY, TABLE_Z]}
      rotation={[-Math.PI / 2 + 0.04, 0, -0.05]}
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
      <mesh ref={meshRef} geometry={boxGeo} castShadow receiveShadow>
        <meshStandardMaterial />
      </mesh>

      {/* ── Soft warm illumination directly focused on the brochure on the table ── */}
      <pointLight
        position={[0, 0, bookD + 0.35]}
        color={hovered ? '#93c5fd' : '#fff4e0'}
        intensity={hovered ? 0.7 : 0.4}
        distance={1.6}
        decay={2}
      />
    </group>
  );
};

export default ClosedBook;
