import React, { useState, useEffect, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { STUDENT_STATS_DATA } from '../../data/studentStats';
import { StudentHUDLayout } from './StudentHUDLayout';
import './transparentDisplay.css';

interface TransparentDisplayProps {
  onExpand?: (index: number) => void;
}

const TransparentDisplay: React.FC<TransparentDisplayProps> = ({ onExpand }) => {
  // 1. Sort students alphabetically by name
  const studentEntries = useMemo(() => {
    return Object.entries(STUDENT_STATS_DATA.students).sort(([, a], [, b]) => {
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, []);

  // 2. Starts at index 0 (first student in alphabetical order)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // 3. Auto cycle enabled by default
  const [autoPlay, setAutoPlay] = useState<boolean>(true);

  const [studentId, student] = studentEntries[currentIndex] || studentEntries[0];

  // Auto-play cycling if enabled
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % studentEntries.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay, studentEntries.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : studentEntries.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < studentEntries.length - 1 ? prev + 1 : 0));
  };

  const handleExpandClick = () => {
    if (onExpand) {
      onExpand(currentIndex);
    } else {
      window.dispatchEvent(
        new CustomEvent('open-student-hud-modal', { detail: { index: currentIndex } })
      );
    }
  };

  return (
    <group position={[-2.15, 0.15, -0.80]} rotation={[0, Math.PI / 2, 0]}>
      {/* ── 3D PHYSICAL GLASS DISPLAY (Exact 2.2m x 1.0m from Blender script) ── */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.0, 0.02]} />
        <meshPhysicalMaterial
          color="#091824"
          transmission={0.88}
          opacity={0.32}
          transparent
          roughness={0.04}
          ior={1.52}
          thickness={0.02}
          reflectivity={0.9}
        />
      </mesh>

      {/* 4 Corner Sci-Fi Mounting Clamps onto the Wall */}
      {[-1.09, 1.09].map((cx) =>
        [-0.49, 0.49].map((cy) => (
          <mesh key={`${cx}-${cy}`} position={[cx, cy, -0.016]} castShadow>
            <boxGeometry args={[0.045, 0.045, 0.03]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
          </mesh>
        ))
      )}

      {/* Outer Glowing Cyber Edge Strip */}
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[2.18, 0.98]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.12} />
      </mesh>

      {/* ── INTERACTIVE DYNAMIC HOLOGRAPHIC HUD OVERLAY ────────────────── */}
      <Html
        transform
        distanceFactor={0.6285}
        position={[0, 0, 0.014]}
        zIndexRange={[50, 100]}
        style={{ pointerEvents: 'auto' }}
      >
        <StudentHUDLayout
          student={student}
          studentId={studentId}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          studentEntries={studentEntries}
          handlePrev={handlePrev}
          handleNext={handleNext}
          autoPlay={autoPlay}
          setAutoPlay={setAutoPlay}
          isModal={false}
          onExpand={handleExpandClick}
        />
      </Html>
    </group>
  );
};

export default TransparentDisplay;
