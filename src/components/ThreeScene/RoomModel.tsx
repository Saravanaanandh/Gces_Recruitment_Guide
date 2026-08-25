import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface RoomModelProps {
  deviceTier: 'desktop' | 'tablet' | 'mobile';
}

const RoomModel: React.FC<RoomModelProps> = ({ deviceTier }) => {
  const { scene } = useGLTF('/models/room_model.glb');

  const { clonedScene, centerOffset, scaleFactor, minY } = useMemo(() => {
    const clone = scene.clone(true);

    // Compute bounding box
    const bbox = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bbox.getSize(size);
    bbox.getCenter(center);

    // Target room span
    const maxDim = Math.max(size.x, size.z);
    const targetSize = 13.5;
    const scale = targetSize / (maxDim > 0 ? maxDim : 1);

    // Traverse and configure materials
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = deviceTier !== 'mobile';
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            mat.side = THREE.DoubleSide;
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.roughness = Math.max(0.2, Math.min(0.9, mat.roughness));
              mat.envMapIntensity = 0.8;
            }
          });
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

  return (
    <group>
      {/* Centered & scaled room model */}
      <primitive
        object={clonedScene}
        position={[
          -centerOffset.x * scaleFactor,
          -minY * scaleFactor - 1.5,
          -centerOffset.z * scaleFactor,
        ]}
        scale={[scaleFactor, scaleFactor, scaleFactor]}
      />

      {/* Dynamic ambient & interior accent lighting for the room */}
      {/* Warm desk & workspace glow */}
      <pointLight
        position={[0, 2.5, -0.5]}
        color="#ffeacc"
        intensity={0.8}
        distance={12}
        decay={2}
      />
      {/* Cool blue monitor fill light */}
      <pointLight
        position={[-1.5, 1.8, -2.5]}
        color="#38bdf8"
        intensity={0.6}
        distance={8}
        decay={2}
      />
      {/* Warm ambient corner accent */}
      <pointLight
        position={[3.5, 2.2, 2]}
        color="#fb923c"
        intensity={0.4}
        distance={9}
        decay={2}
      />
      {/* Soft upward bounce light */}
      <pointLight
        position={[0, -0.8, 0]}
        color="#60a5fa"
        intensity={0.3}
        distance={6}
        decay={2}
      />
    </group>
  );
};

// Preload the model
useGLTF.preload('/models/room_model.glb');

export default RoomModel;
