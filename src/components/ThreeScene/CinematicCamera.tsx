import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FocusTarget } from './DeveloperWorkspace';

interface CinematicCameraProps {
  mode: 'cinematic' | 'reading';
  deviceTier: 'desktop' | 'tablet' | 'mobile';
  focusedTarget?: FocusTarget;
}

// ─────────────────────────────────────────────────────────────────────────────
// // FIX 2: CAMERA FOCUS SYSTEM (Unobstructed Monitor View Matching Image 3)
// ─────────────────────────────────────────────────────────────────────────────
const CinematicCamera: React.FC<CinematicCameraProps> = ({
  mode,
  deviceTier,
  focusedTarget = 'none',
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null!);

  // Default camera & target positions
  const cinematicPos = useMemo(() => new THREE.Vector3(0, 0.85, 4.8), []);
  const cinematicTarget = useMemo(() => new THREE.Vector3(0, 0.35, 0), []);
  const readingPos = useMemo(() => new THREE.Vector3(0, 1.8, 3.2), []);
  const readingTarget = useMemo(() => new THREE.Vector3(0, -0.3, 0), []);

  // Wall Clock close-up focus vectors
  const clockFocusPos = useMemo(() => new THREE.Vector3(-4.6, 2.2, -0.6), []);
  const clockFocusTarget = useMemo(() => new THREE.Vector3(-6.92, 2.2, -0.6), []);

  // Monitor Focus — Seated in chair perspective
  const monitorFocusPos = useMemo(() => new THREE.Vector3(-3.72, 0.26, -0.4), []);
  const monitorFocusTarget = useMemo(() => new THREE.Vector3(-5.15, 0.12, -0.4), []);

  // Blackboard close-up focus vectors (Wall 4 at Z = +5.94)
  const boardFocusPos = useMemo(() => new THREE.Vector3(-1.2, 0.55, 3.85), []);
  const boardFocusTarget = useMemo(() => new THREE.Vector3(-1.2, 0.55, 5.94), []);

  // // TASK 2: Wall Photos Close-Up Focus Vectors
  const photoFocusConfigs = useMemo<Record<string, { pos: THREE.Vector3; target: THREE.Vector3 }>>(() => ({
    'photo-virat': {
      pos: new THREE.Vector3(-4.85, 1.85, -2.4),
      target: new THREE.Vector3(-6.92, 1.85, -2.4),
    },
    'photo-dhoni': {
      pos: new THREE.Vector3(-4.85, 1.85, 1.4),
      target: new THREE.Vector3(-6.92, 1.85, 1.4),
    },
    'photo-warren': {
      pos: new THREE.Vector3(-4.2, 1.85, -3.85),
      target: new THREE.Vector3(-4.2, 1.85, -5.92),
    },
    'photo-steve': {
      pos: new THREE.Vector3(-1.4, 1.85, -3.85),
      target: new THREE.Vector3(-1.4, 1.85, -5.92),
    },
    'photo-elon': {
      pos: new THREE.Vector3(1.4, 1.85, -3.85),
      target: new THREE.Vector3(1.4, 1.85, -5.92),
    },
  }), []);

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

    if (focusedTarget === 'clock') {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      camera.position.lerp(clockFocusPos, 0.065);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(clockFocusTarget, 0.065);
        camera.lookAt(controlsRef.current.target);
      }
      return;
    }

    if (focusedTarget === 'desk') {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      camera.position.lerp(monitorFocusPos, 0.065);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(monitorFocusTarget, 0.065);
        camera.lookAt(controlsRef.current.target);
      }
      return;
    }

    // Blackboard close-up focus
    if (focusedTarget === 'board') {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      camera.position.lerp(boardFocusPos, 0.065);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(boardFocusTarget, 0.065);
        camera.lookAt(controlsRef.current.target);
      }
      return;
    }

    // // TASK 2: Handle Wall Photo Focus States
    if (focusedTarget && photoFocusConfigs[focusedTarget]) {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      const cfg = photoFocusConfigs[focusedTarget];
      camera.position.lerp(cfg.pos, 0.065);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(cfg.target, 0.065);
        camera.lookAt(controlsRef.current.target);
      }
      return;
    }

    if (focusedTarget === 'none') {
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
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={[cinematicTarget.x, cinematicTarget.y, cinematicTarget.z]}
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI * 0.2}
      maxPolarAngle={Math.PI * 0.44}
      minDistance={3.0}
      maxDistance={6.0}
      rotateSpeed={deviceTier === 'mobile' ? 0.5 : 0.65}
      dampingFactor={0.08}
      enableDamping
    />
  );
};

export default CinematicCamera;
