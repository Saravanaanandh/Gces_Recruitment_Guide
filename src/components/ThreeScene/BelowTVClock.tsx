import React, { useState, useEffect, useMemo } from 'react';
import { Html } from '@react-three/drei';

const BelowTVClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time components
  const hoursRaw = time.getHours();
  const hours = is24Hour
    ? (hoursRaw < 10 ? `0${hoursRaw}` : `${hoursRaw}`)
    : (hoursRaw % 12 || 12 < 10 ? `0${hoursRaw % 12 || 12}` : `${hoursRaw % 12 || 12}`);
  const minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : `${time.getMinutes()}`;
  const seconds = time.getSeconds() < 10 ? `0${time.getSeconds()}` : `${time.getSeconds()}`;
  const ampm = hoursRaw >= 12 ? 'PM' : 'AM';

  // Date components
  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const monthName = time.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const dateNum = time.getDate();
  const year = time.getFullYear();

  return (
    <group position={[-0.0306, -0.6547, -2.258]}>
      {/* ── 3D PHYSICAL AMBIENT CLOCK BACKING FIXTURE ────────────────── */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[1.002, 0.209, 0.012]} />
        <meshPhysicalMaterial
          color="#060911"
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Subtle glowing ambient LED border */}
      <mesh position={[0, 0, 0.007]}>
        <planeGeometry args={[0.995, 0.202]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.12} />
      </mesh>

      {/* ── LIVE DIGITAL SMART CLOCK DISPLAY (HTML / CSS) ───────────── */}
      <Html
        transform
        distanceFactor={0.668}
        position={[0, 0, 0.009]}
        zIndexRange={[25, 50]}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          className="below-tv-clock-display"
          onClick={() => setIs24Hour((prev) => !prev)}
          title="Click to toggle 12h / 24h format"
        >
          {/* Top Status Header */}
          <div className="clock-header-row">
            <div className="clock-status-live">
              <span className="clock-dot-cyan" />
              <span>SMART AMBIENT DISPLAY</span>
            </div>
            <div className="clock-sensors">
              <span>22°C</span>
              <span className="clock-sep">&bull;</span>
              <span>48% RH</span>
            </div>
          </div>

          {/* Center Digital Clock Time */}
          <div className="clock-digits-row">
            <span className="clock-digit">{hours}</span>
            <span className="clock-colon">:</span>
            <span className="clock-digit">{minutes}</span>
            <span className="clock-colon">:</span>
            <span className="clock-digit clock-sec">{seconds}</span>
            {!is24Hour && <span className="clock-ampm">{ampm}</span>}
          </div>

          {/* Bottom Live Date */}
          <div className="clock-date-row">
            <span className="clock-weekday">{dayName}</span>
            <span className="clock-date-divider">&bull;</span>
            <span className="clock-full-date">{monthName} {dateNum}, {year}</span>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default BelowTVClock;
