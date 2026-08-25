import React, { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import DeveloperRoom from './DeveloperRoom';
import Platform from './Platform';
import ClosedBook from './ClosedBook';
import ElectricalEffects from './ElectricalEffects';
import CinematicCamera from './CinematicCamera';
import PageTurnEffects from './PageTurnEffects';
import PostProcessingEffects from './PostProcessingEffects';
import { FocusTarget } from './DeveloperWorkspace';

interface SceneCanvasProps {
  mode: 'cinematic' | 'reading';
  onClickBook: () => void;
  intensifyTrigger: number;
  pageTurnTrigger: number;
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
// // TASK 4: DYNAMIC INTERIOR LIGHTING RIG (Moodier, Dimmer Dark Mode)
// ─────────────────────────────────────────────────────────────────────────────
const InteriorLights: React.FC<{ isDayMode: boolean }> = ({ isDayMode }) => {
  const hemiRef = useRef<THREE.HemisphereLight>(null!);
  const dirRef = useRef<THREE.DirectionalLight>(null!);

  useFrame(() => {
    const targetHemi = isDayMode ? 0.85 : 0.14;
    const targetDir = isDayMode ? 2.2 : 0.42;
    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.lerp(hemiRef.current.intensity, targetHemi, 0.05);
    }
    if (dirRef.current) {
      dirRef.current.intensity = THREE.MathUtils.lerp(dirRef.current.intensity, targetDir, 0.05);
    }
  });

  return (
    <>
      {/* Hemisphere: warm sky, cool ground bounce */}
      <hemisphereLight ref={hemiRef} args={['#e8d5c0', '#1a1820', 0.14]} />

      {/* Primary key light — angled down from ceiling at platform */}
      <directionalLight
        ref={dirRef}
        position={[0, 6, 1]}
        color="#fff4e8"
        intensity={0.42}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.002}
      />

      {/* Right sconce fill */}
      <pointLight position={[6.8, 1.2, -1.5]} color="#ffd4a0" intensity={isDayMode ? 1.2 : 0.45} distance={8} decay={2} />

      {/* Cool back-wall bounce */}
      <directionalLight position={[0, 3, -6]} color="#9db4d8" intensity={isDayMode ? 0.35 : 0.08} castShadow={false} />

      {/* Front fill for book & platform */}
      <pointLight position={[0, 2, 5]} color="#fff0e0" intensity={isDayMode ? 0.55 : 0.12} distance={10} decay={2} />
    </>
  );
};

const SceneCanvas: React.FC<SceneCanvasProps> = ({
  mode,
  onClickBook,
  intensifyTrigger,
  pageTurnTrigger,
}) => {
  const deviceTier = useDeviceTier();

  // Focus Target State System
  const [focusedTarget, setFocusedTarget] = useState<FocusTarget>('none');

  // Day/Night Mode State Toggle
  const [isDayMode, setIsDayMode] = useState<boolean>(false);

  // Listen for Escape key to exit close-up focus view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusedTarget !== 'none') {
        setFocusedTarget('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedTarget]);

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
      {/* ── TASK 3: Minimal Plain Text Exit UI (No Button/Pill Container) ── */}
      {focusedTarget !== 'none' && (
        <div
          style={{
            position: 'fixed',
            top: '22px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.06em',
            pointerEvents: 'none',
            userSelect: 'none',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)',
          }}
        >
          Esc to go back
        </div>
      )}

      <Canvas
        shadows={deviceTier !== 'mobile'}
        camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0.85, 4.8] }}
        gl={{
          antialias: deviceTier !== 'mobile',
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={deviceTier === 'mobile' ? 1 : Math.min(window.devicePixelRatio, 2)}
        style={{ background: isDayMode ? '#282430' : '#1a1520' }}
        onPointerMissed={() => {
          if (focusedTarget !== 'none') {
            setFocusedTarget('none');
          }
        }}
      >
        {/* ── Fog to soften room edges ───────────────────────────────── */}
        <fog attach="fog" args={[isDayMode ? '#282430' : '#1a1520', 14, 38]} />

        {/* ── FIX 12: Lighting rig with Day/Night support ────────────── */}
        <InteriorLights isDayMode={isDayMode} />

        {/* ── Camera with Smooth Focus Transitions ──────────────────── */}
        <CinematicCamera
          mode={mode}
          deviceTier={deviceTier}
          focusedTarget={focusedTarget}
        />

        {/* ── FIX 5, 11, 12: Room with Gray Walls, Sofa & Light Switch ─ */}
        <Suspense fallback={null}>
          <DeveloperRoom
            deviceTier={deviceTier}
            focusedTarget={focusedTarget}
            onFocusTarget={setFocusedTarget}
            isDayMode={isDayMode}
            onToggleDayMode={() => setIsDayMode((prev) => !prev)}
          />
        </Suspense>

        {/* ── Circular platform / stage (Untouched) ─────────────────── */}
        <Platform deviceTier={deviceTier} />

        {/* ── Floating closed book (Untouched) ──────────────────────── */}
        <ClosedBook
          mode={mode}
          onClickBook={onClickBook}
          frontCoverImageUrl="/front_cover.png"
          backCoverImageUrl="/back_cover.png"
        />

        {/* ── FIX 8: Realistic Electric / Energy Effects ────────────── */}
        <ElectricalEffects
          mode={mode}
          deviceTier={deviceTier}
          intensifyTrigger={intensifyTrigger}
        />

        {/* ── Contact shadows under the book ────────────────────────── */}
        {deviceTier !== 'mobile' && (
          <ContactShadows
            position={[0, -1.48, 0]}
            opacity={0.35}
            scale={6}
            blur={2.5}
            far={3}
            color="#000010"
          />
        )}

        {/* ── Page-turn effect (reading mode only) ──────────────────── */}
        {mode === 'reading' && (
          <PageTurnEffects
            pageTurnTrigger={pageTurnTrigger}
            deviceTier={deviceTier}
          />
        )}

        {/* ── Post-processing ───────────────────────────────────────── */}
        <PostProcessingEffects deviceTier={deviceTier} />
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
