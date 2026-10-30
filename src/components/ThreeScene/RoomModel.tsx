import React, { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ROOM_THEMES, RoomTheme, applyThemeToScene } from '../../config/roomThemes';

interface RoomModelProps {
  deviceTier: 'desktop' | 'tablet' | 'mobile';
  isDayMode?: boolean;
  themeId?: string;
}

const RoomModel: React.FC<RoomModelProps> = ({
  deviceTier,
  isDayMode = false,
  themeId = 'warm-nordic',
}) => {
  const { scene } = useGLTF('/models/test.glb');

  // Find active room theme or fallback to first
  const currentTheme = useMemo<RoomTheme>(() => {
    return ROOM_THEMES.find((t) => t.id === themeId) || ROOM_THEMES[0];
  }, [themeId]);

  // Clone GLB scene and clone each mesh's material so themes can mutate them in-place
  const { clonedScene, centerOffset, scaleFactor, minY } = useMemo(() => {
    const clone = scene.clone(true);

    // Compute bounding box
    const bbox = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bbox.getSize(size);
    bbox.getCenter(center);

    // Target room span — scale to fit nicely around the living room area
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 14;
    const scale = targetSize / (maxDim > 0 ? maxDim : 1);

    // Ensure every mesh has its own cloned material instance
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = deviceTier !== 'mobile';
        mesh.receiveShadow = true;

        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }
        }
      }
    });

    return {
      clonedScene: clone,
      centerOffset: center,
      scaleFactor: scale,
      minY: bbox.min.y,
    };
  }, [scene, deviceTier]);

  // Apply the selected room theme whenever themeId or clonedScene changes
  useEffect(() => {
    if (!clonedScene) return;
    applyThemeToScene(clonedScene, currentTheme);
  }, [clonedScene, currentTheme]);

  return (
    <group>
      {/* Centered & scaled GLB environment model */}
      <primitive
        object={clonedScene}
        position={[
          -centerOffset.x * scaleFactor,
          -minY * scaleFactor - 1.5,
          -centerOffset.z * scaleFactor,
        ]}
        scale={[scaleFactor, scaleFactor, scaleFactor]}
      />

      {/* ── DESIGNER AREA RUG / MAT UNDER SOFA & COFFEE TABLE ─────────── */}
      <mesh
        position={[-0.2, -1.148, -0.45]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[2.7, 2.5]} />
        <meshStandardMaterial
          color={currentTheme.rug.color}
          roughness={0.96}
          metalness={0.0}
        />
      </mesh>
      {/* Subtle border accent for the rug */}
      <mesh
        position={[-0.2, -1.147, -0.45]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[2.76, 2.56]} />
        <meshStandardMaterial
          color={currentTheme.rug.border}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* ── ROOM INTERIOR LIGHTING RIG ─────────────────────────────────── */}
      {/* Warm ambient ceiling light illuminating central living room */}
      <pointLight
        position={[0.0, 0.65, -0.6]}
        color={currentTheme.lightColor}
        intensity={isDayMode ? 1.1 : 0.75}
        distance={7}
        decay={2}
      />
      {/* Natural daylight fill from the large window on the left */}
      <pointLight
        position={[-1.8, 0.2, -0.5]}
        color="#bae6fd"
        intensity={isDayMode ? 0.9 : 0.45}
        distance={6}
        decay={2}
      />
      {/* Warm accent wash on the bookshelf wall */}
      <pointLight
        position={[1.65, 0.1, -0.7]}
        color="#fed7aa"
        intensity={isDayMode ? 0.65 : 0.35}
        distance={5}
        decay={2}
      />
    </group>
  );
};

// Preload the model
useGLTF.preload('/models/test.glb');

export default RoomModel;
