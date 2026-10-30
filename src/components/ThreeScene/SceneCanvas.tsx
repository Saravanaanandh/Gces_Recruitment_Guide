import React, { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import RoomModel from './RoomModel';
import ClosedBook from './ClosedBook';
import CinematicCamera from './CinematicCamera';
import PageTurnEffects from './PageTurnEffects';
import PostProcessingEffects from './PostProcessingEffects';
import TransparentDisplay from './TransparentDisplay';
import TVDisplay from './TVDisplay';
import BelowTVClock from './BelowTVClock';

interface SceneCanvasProps {
  mode: 'cinematic' | 'reading';
  onClickBook: () => void;
  intensifyTrigger: number;
  pageTurnTrigger: number;
  themeId?: string;
}

function useDeviceTier(): 'desktop' | 'tablet' | 'mobile' {
  return useMemo(() => {
    const w = window.innerWidth;
    if (w < 640) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC INTERIOR LIGHTING RIG (Scaled for room interior)
// ─────────────────────────────────────────────────────────────────────────────
const InteriorLights: React.FC<{ isDayMode: boolean }> = ({ isDayMode }) => {
  const hemiRef = useRef<THREE.HemisphereLight>(null!);
  const dirRef = useRef<THREE.DirectionalLight>(null!);

  useFrame(() => {
    const targetHemi = isDayMode ? 0.9 : 0.45;
    const targetDir = isDayMode ? 1.8 : 0.85;
    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.lerp(hemiRef.current.intensity, targetHemi, 0.05);
    }
    if (dirRef.current) {
      dirRef.current.intensity = THREE.MathUtils.lerp(dirRef.current.intensity, targetDir, 0.05);
    }
  });

  return (
    <>
      {/* Hemisphere: warm ceiling bounce, subtle floor ground fill */}
      <hemisphereLight ref={hemiRef} args={['#fff2e2', '#221e28', 0.45]} />

      {/* Primary key light — angled down from ceiling toward the coffee table */}
      <directionalLight
        ref={dirRef}
        position={[-0.37, 0.85, 0.1]}
        color="#fff6ec"
        intensity={0.85}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={6}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-bias={-0.001}
      />

      {/* Soft fill light illuminating the living room and brochure from seated eye position */}
      <pointLight
        position={[-0.37, 0.15, 0.55]}
        color="#ffe8d0"
        intensity={isDayMode ? 0.7 : 0.35}
        distance={4.5}
        decay={2}
      />
    </>
  );
};

const SceneCanvas: React.FC<SceneCanvasProps> = ({
  mode,
  onClickBook,
  intensifyTrigger,
  pageTurnTrigger,
  themeId = 'warm-nordic',
}) => {
  const deviceTier = useDeviceTier();

  // Day/Night Mode State Toggle
  const [isDayMode, setIsDayMode] = useState<boolean>(false);

  return (
    <div
      className="scene-canvas-container"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
      }}
    >
      <Canvas
        shadows={deviceTier !== 'mobile'}
        camera={{ fov: 50, near: 0.1, far: 50, position: [0.85, 0.30, 1.15] }}
        gl={{
          antialias: deviceTier !== 'mobile',
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={deviceTier === 'mobile' ? 1 : Math.min(window.devicePixelRatio, 2)}
        style={{ background: isDayMode ? '#282430' : '#141218' }}
      >
        {/* ── Fog to soften room distant edges ─────────────────────────── */}
        <fog attach="fog" args={[isDayMode ? '#282430' : '#141218', 10, 30]} />

        {/* ── Lighting rig with Day/Night support ────────────────────── */}
        <InteriorLights isDayMode={isDayMode} />

        {/* ── Camera (Constrained inside the room looking at the table) ─ */}
        <CinematicCamera
          mode={mode}
          deviceTier={deviceTier}
        />

        {/* ── test.glb Environment Model with dynamic theme ──────────── */}
        <Suspense fallback={null}>
          <RoomModel
            deviceTier={deviceTier}
            isDayMode={isDayMode}
            themeId={themeId}
          />
        </Suspense>

        {/* ── Dynamic Holographic Transparent Display on the Empty Wall ── */}
        {mode === 'cinematic' && (
          <Suspense fallback={null}>
            <TransparentDisplay />
          </Suspense>
        )}

        {/* ── TV Screen Video Playback & OSD Controls ─────────────────── */}
        {mode === 'cinematic' && (
          <Suspense fallback={null}>
            <TVDisplay videoSrc="/TV_content.mp4" />
          </Suspense>
        )}

        {/* ── Digital Smart Clock Display below the TV (Date & Time) ─── */}
        {mode === 'cinematic' && (
          <Suspense fallback={null}>
            <BelowTVClock />
          </Suspense>
        )}

        {/* ── Brochure book placed on the coffee table ───────────────── */}
        <ClosedBook
          mode={mode}
          onClickBook={onClickBook}
          frontCoverImageUrl="/front_cover.png"
          backCoverImageUrl="/back_cover.png"
        />

        {/* ── Contact shadows under the book on the table surface ──────── */}
        {deviceTier !== 'mobile' && (
          <ContactShadows
            position={[-0.3702, -0.920, -0.7452]}
            opacity={0.45}
            scale={0.8}
            blur={1.5}
            far={0.5}
            color="#050510"
          />
        )}

        {/* ── Page-turn effect (reading mode only) ───────────────────── */}
        {mode === 'reading' && (
          <PageTurnEffects
            pageTurnTrigger={pageTurnTrigger}
            deviceTier={deviceTier}
          />
        )}

        {/* ── Post-processing ────────────────────────────────────────── */}
        <PostProcessingEffects deviceTier={deviceTier} />
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
