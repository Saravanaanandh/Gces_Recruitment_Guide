import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CinematicCameraProps {
  mode: 'cinematic' | 'reading';
  deviceTier: 'desktop' | 'tablet' | 'mobile';
}

// Room interior boundaries (derived from GLB room mesh dimensions)
// Living room walls: Left window -2.2, Right shelves +2.1, TV wall -2.25, Front couch wall +1.6
// Floor -1.15, Ceiling +0.95
const ROOM_BOUNDS = {
  minX: -2.05,
  maxX: 1.95,
  minY: -1.05,
  maxY: 0.82,
  minZ: -2.15,
  maxZ: 1.45,
};

const CinematicCamera: React.FC<CinematicCameraProps> = ({
  mode,
  deviceTier,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null!);

  // Initial camera position gives an elevated, open room overview looking across at the TV wall, coffee table, and sofa
  // Camera is positioned at Y=0.30 (well above sofa back at -0.51) so the entire TV wall is completely visible!
  const cinematicPos = useMemo(() => new THREE.Vector3(0.85, 0.30, 1.15), []);
  const cinematicTarget = useMemo(() => new THREE.Vector3(-0.10, -0.30, -0.85), []);

  const readingPos = useMemo(() => new THREE.Vector3(-0.3702, -0.15, 0.70), []);
  const readingTarget = useMemo(() => new THREE.Vector3(-0.3702, -0.85, -0.7452), []);

  useEffect(() => {
    camera.position.copy(cinematicPos);
    camera.lookAt(cinematicTarget);
    if (controlsRef.current) {
      controlsRef.current.target.copy(cinematicTarget);
      controlsRef.current.update();
    }
  }, [camera, cinematicPos, cinematicTarget]);

  useFrame(() => {
    if (mode === 'reading') {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      camera.position.lerp(readingPos, 0.05);
      camera.lookAt(readingTarget);
      return;
    }

    // Cinematic mode: OrbitControls enabled for free exploration from all angles
    if (controlsRef.current) {
      if (!controlsRef.current.enabled) {
        camera.position.lerp(cinematicPos, 0.06);
        controlsRef.current.target.lerp(cinematicTarget, 0.06);
        camera.lookAt(controlsRef.current.target);

        if (camera.position.distanceTo(cinematicPos) < 0.15) {
          controlsRef.current.enabled = true;
        }
      }
    }

    // Strict boundary enforcement: NEVER let the camera clip or move outside of the room walls
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, ROOM_BOUNDS.minX, ROOM_BOUNDS.maxX);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, ROOM_BOUNDS.minY, ROOM_BOUNDS.maxY);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, ROOM_BOUNDS.minZ, ROOM_BOUNDS.maxZ);

    // Keep panning target inside the living room
    if (controlsRef.current?.target) {
      controlsRef.current.target.x = THREE.MathUtils.clamp(controlsRef.current.target.x, -1.8, 1.8);
      controlsRef.current.target.y = THREE.MathUtils.clamp(controlsRef.current.target.y, -1.0, 0.6);
      controlsRef.current.target.z = THREE.MathUtils.clamp(controlsRef.current.target.z, -2.0, 1.2);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={[cinematicTarget.x, cinematicTarget.y, cinematicTarget.z]}
      enablePan={true}
      panSpeed={deviceTier === 'mobile' ? 0.7 : 0.85}
      enableZoom={true}
      minPolarAngle={Math.PI * 0.04}
      maxPolarAngle={Math.PI * 0.52}
      minDistance={0.2}
      maxDistance={3.8}
      rotateSpeed={deviceTier === 'mobile' ? 0.5 : 0.65}
      dampingFactor={0.08}
      enableDamping
    />
  );
};

export default CinematicCamera;
