import React, { useState, useEffect, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { STUDENT_STATS_DATA, StudentData } from '../../data/studentStats';
import './transparentDisplay.css';

interface TransparentDisplayProps {
  onFocusDisplay?: () => void;
}

const TECH_STACK_ITEMS = [
  'Js', 'Ts', 'Re', 'Ne', 'Ta', 'No',
  'Ex', 'Py', 'Ja', 'Sq', 'Fi', 'Gi',
  'Bl', 'Ai', 'Op', 'Vp', 'Ci', 'Li',
];

const TransparentDisplay: React.FC<TransparentDisplayProps> = () => {
  const studentEntries = useMemo(() => Object.entries(STUDENT_STATS_DATA.students), []);

  // Default to Saravanakumar M (index 9) to match the user's reference screenshot, or index 0
  const defaultIdx = useMemo(() => {
    const idx = studentEntries.findIndex(([id]) => id === 'saravanakumar-m');
    return idx >= 0 ? idx : 0;
  }, [studentEntries]);

  const [currentIndex, setCurrentIndex] = useState<number>(defaultIdx);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  const [studentId, student] = studentEntries[currentIndex] || studentEntries[0];

  // Auto-play cycling if enabled
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % studentEntries.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [autoPlay, studentEntries.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : studentEntries.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < studentEntries.length - 1 ? prev + 1 : 0));
  };

  // Contributions by year parsing
  const yearEntries = useMemo(() => {
    if (!student.githubContributionsByYear) return [];
    return Object.entries(student.githubContributionsByYear).sort(([a], [b]) => Number(a) - Number(b));
  }, [student.githubContributionsByYear]);

  const maxYearContrib = useMemo(() => {
    if (yearEntries.length === 0) return 100;
    const maxVal = Math.max(...yearEntries.map(([_, v]) => v));
    return maxVal > 0 ? maxVal : 100;
  }, [yearEntries]);

  // Active Since year
  const activeSinceYear = yearEntries.length > 0 ? yearEntries[0][0] : '2024';

  // LeetCode calculations
  const leetcodeSolved = student.leetcodeSolved || 0;
  const leetcodeSubmissions = student.leetcodeSubmissions || 0;
  const leetcodeTarget = Math.max(180, leetcodeSolved, leetcodeSubmissions);
  const leetcodePct = Math.min(100, Math.round((leetcodeSolved / leetcodeTarget) * 100));

  // Circumference for 80px diameter circle (r=36)
  const donutRadius = 36;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset = donutCircumference - (donutCircumference * (leetcodePct / 100));

  // Total gauge circumference (r=56)
  const gaugeRadius = 56;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugePct = Math.min(100, Math.max(15, Math.round((student.githubContributions / 500) * 100)));
  const gaugeOffset = gaugeCircumference - (gaugeCircumference * 0.75 * (gaugePct / 100));

  return (
    <>
      {/* ── Positioned on the Empty Wall (Left wall of the TV wall) ────── */}
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
          <div className="hud-screen-container">
            {/* Chamfered cyber corner brackets */}
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />
            <div className="hud-corner-br" />
            <div className="hud-scanline" />

            {/* ── 3-COLUMN MAIN GRID ────────────────────────────────────── */}
            <div className="hud-main-grid">
              {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
              <div className="hud-col">
                {/* 1. Wireframe 3D Topographic Mountain Terrain */}
                <div className="hud-terrain-box">
                  <svg
                    viewBox="0 0 350 140"
                    className="hud-terrain-svg"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="hudTerrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff7a1a" stopOpacity="0.85" />
                        <stop offset="60%" stopColor="#ff9a3c" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0b1329" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    {/* Perspective topographic contour elevation grid */}
                    {[-20, -10, 0, 10, 20, 30, 40, 50, 60].map((yOff, i) => (
                      <path
                        key={i}
                        d={`M 10 ${85 + yOff * 0.7} Q 70 ${40 + yOff * 0.5 - (i % 2 === 0 ? 25 : 10)}, 130 ${75 + yOff * 0.6} T 220 ${35 + yOff * 0.4 - (i === 4 ? 35 : 15)} T 340 ${85 + yOff * 0.7}`}
                        fill="none"
                        stroke="#ff7a1a"
                        strokeWidth="1.2"
                        strokeOpacity={0.4 + (i * 0.06)}
                      />
                    ))}
                    {/* Vertical connecting wireframe lines */}
                    {[25, 55, 85, 115, 145, 175, 205, 235, 265, 295, 325].map((x, idx) => (
                      <path
                        key={idx}
                        d={`M ${x} 125 L ${x - 15 + (idx % 3) * 10} 45`}
                        stroke="#ff9a3c"
                        strokeWidth="0.8"
                        strokeOpacity="0.25"
                        strokeDasharray="2 3"
                      />
                    ))}
                    {/* Glowing peak markers */}
                    <circle cx="70" cy="20" r="3" fill="#ff7a1a" filter="drop-shadow(0 0 4px #ff7a1a)" />
                    <circle cx="220" cy="15" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 5px #00e5ff)" />
                  </svg>
                </div>

                {/* 2. GitHub Contributions by Year Bar Chart */}
                <div className="hud-panel">
                  <div className="hud-panel-title">
                    <span>GITHUB CONTRIBUTIONS</span>
                    <span style={{ color: '#00e5ff', fontSize: '10px' }}>
                      {yearEntries.length > 0 ? `${yearEntries[0][0]}-${yearEntries[yearEntries.length - 1][0]}` : 'ANNUAL'}
                    </span>
                  </div>
                  <div className="hud-chart-container">
                    <div className="hud-chart-gridline" style={{ bottom: '75%' }} />
                    <div className="hud-chart-gridline" style={{ bottom: '50%' }} />
                    <div className="hud-chart-gridline" style={{ bottom: '25%' }} />
                    <div className="hud-chart-bars">
                      {yearEntries.map(([yr, count]) => {
                        const barHeight = Math.max(8, Math.round((count / maxYearContrib) * 90));
                        return (
                          <div key={yr} className="hud-chart-col">
                            <span className="hud-bar-val">{count}</span>
                            <div className="hud-bar-fill" style={{ height: `${barHeight}%` }} />
                            <span className="hud-bar-year">{yr}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Skills Level Progress */}
                <div className="hud-panel">
                  <div className="hud-panel-title">SKILLS LEVEL</div>
                  <div className="hud-progress-list">
                    <div className="hud-progress-item">
                      <div className="hud-progress-info">
                        <span>Web Development</span>
                        <span style={{ color: '#00e5ff' }}>90%</span>
                      </div>
                      <div className="hud-progress-track">
                        <div className="hud-progress-bar" style={{ width: '90%' }} />
                      </div>
                    </div>
                    <div className="hud-progress-item">
                      <div className="hud-progress-info">
                        <span>Problem Solving</span>
                        <span style={{ color: '#00e5ff' }}>85%</span>
                      </div>
                      <div className="hud-progress-track">
                        <div className="hud-progress-bar" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div className="hud-progress-item">
                      <div className="hud-progress-info">
                        <span>AI / ML</span>
                        <span style={{ color: '#00e5ff' }}>75%</span>
                      </div>
                      <div className="hud-progress-track">
                        <div className="hud-progress-bar" style={{ width: '75%' }} />
                      </div>
                    </div>
                    <div className="hud-progress-item">
                      <div className="hud-progress-info">
                        <span>Blockchain</span>
                        <span style={{ color: '#00e5ff' }}>60%</span>
                      </div>
                      <div className="hud-progress-track">
                        <div className="hud-progress-bar" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CENTER COLUMN ────────────────────────────────────────── */}
              <div className="hud-col">
                {/* 1. Identity, Navigation Controls, and Links */}
                <div className="hud-panel hud-identity-box">
                  {/* Navigation bar with Prev, Next & Student Selector */}
                  <div className="hud-nav-bar">
                    <button
                      className="hud-nav-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      title="Previous Student"
                    >
                      &#9664; PREV
                    </button>

                    <div className="hud-student-counter">
                      <span>STUDENT</span>
                      <select
                        className="hud-student-select"
                        value={currentIndex}
                        onChange={(e) => setCurrentIndex(Number(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {studentEntries.map(([id, s], idx) => (
                          <option key={id} value={idx}>
                            {idx + 1}. {s.name}
                          </option>
                        ))}
                      </select>
                      <span>OF {studentEntries.length}</span>
                    </div>

                    <button
                      className="hud-nav-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      title="Next Student"
                    >
                      NEXT &#9654;
                    </button>
                  </div>

                  {/* Student Name & Title */}
                  <h1 className="hud-student-name">{student.name}</h1>
                  <div className="hud-student-role">
                    <span className="hud-role-line" />
                    <span>DEVELOPER &bull; PROBLEM SOLVER &bull; LEARNER</span>
                    <span className="hud-role-line" />
                  </div>

                  {/* Links Grid */}
                  <div className="hud-links-grid">
                    {student.links?.portfolio && (
                      <a
                        href={student.links.portfolio}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hud-link-pill"
                        title={student.links.portfolio}
                      >
                        <span className="hud-link-label">
                          <span>&#127760;</span> Portfolio
                        </span>
                        <span className="hud-link-val">{student.links.portfolio.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                    {student.links?.github && (
                      <a
                        href={student.links.github}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hud-link-pill"
                        title={student.links.github}
                      >
                        <span className="hud-link-label">
                          <span>&#128025;</span> GitHub
                        </span>
                        <span className="hud-link-val">{student.links.github.replace('https://github.com/', '')}</span>
                      </a>
                    )}
                    {student.links?.leetcode && (
                      <a
                        href={student.links.leetcode}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hud-link-pill"
                        title={student.links.leetcode}
                      >
                        <span className="hud-link-label">
                          <span>&#9889;</span> LeetCode
                        </span>
                        <span className="hud-link-val">{student.links.leetcode.replace('https://leetcode.com/u/', '')}</span>
                      </a>
                    )}
                    {student.links?.linkedin && (
                      <a
                        href={student.links.linkedin}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hud-link-pill"
                        title={student.links.linkedin}
                      >
                        <span className="hud-link-label">
                          <span>&#128188;</span> LinkedIn
                        </span>
                        <span className="hud-link-val">Profile</span>
                      </a>
                    )}
                    {student.links?.hackerrank && (
                      <a
                        href={student.links.hackerrank}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hud-link-pill"
                        title={student.links.hackerrank}
                      >
                        <span className="hud-link-label">
                          <span>&#128994;</span> HackerRank
                        </span>
                        <span className="hud-link-val">Profile</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* 2. LeetCode Progress Donut & Metrics */}
                <div className="hud-panel hud-panel-amber">
                  <div className="hud-panel-title amber">LEETCODE PROGRESS</div>
                  <div className="hud-leetcode-box">
                    <div className="hud-donut-wrap">
                      <svg className="hud-donut-svg" viewBox="0 0 95 95">
                        <circle
                          cx="47.5"
                          cy="47.5"
                          r={donutRadius}
                          fill="transparent"
                          stroke="rgba(255, 122, 26, 0.15)"
                          strokeWidth="7"
                        />
                        <circle
                          cx="47.5"
                          cy="47.5"
                          r={donutRadius}
                          fill="transparent"
                          stroke="#ff7a1a"
                          strokeWidth="7"
                          strokeDasharray={donutCircumference}
                          strokeDashoffset={donutOffset}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                        />
                      </svg>
                      <div className="hud-donut-center">
                        <div className="hud-donut-num">{leetcodeSolved}</div>
                        <div className="hud-donut-label">SOLVED</div>
                      </div>
                    </div>
                    <div className="hud-leetcode-stats">
                      <div className="hud-stat-pill">
                        <span className="hud-stat-pill-icon">&#127942;</span>
                        <div>
                          <div className="hud-stat-pill-title">SOLVED PROBLEMS</div>
                          <div className="hud-stat-pill-num">{leetcodeSolved}</div>
                        </div>
                      </div>
                      <div className="hud-stat-pill">
                        <span className="hud-stat-pill-icon">&#128221;</span>
                        <div>
                          <div className="hud-stat-pill-title">TOTAL SUBMISSIONS</div>
                          <div className="hud-stat-pill-num">{leetcodeSubmissions}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Activity & Goals Checklist */}
                <div className="hud-panel">
                  <div className="hud-panel-title">ACTIVITY &amp; GOALS</div>
                  <div className="hud-goals-list">
                    <div className="hud-goal-item">
                      <div className="hud-goal-left">
                        <span className="hud-goal-bullet" />
                        <span>Build Projects</span>
                      </div>
                      <span className="hud-goal-pct">80%</span>
                    </div>
                    <div className="hud-goal-item">
                      <div className="hud-goal-left">
                        <span className="hud-goal-bullet" />
                        <span>Solve DSA</span>
                      </div>
                      <span className="hud-goal-pct">75%</span>
                    </div>
                    <div className="hud-goal-item">
                      <div className="hud-goal-left">
                        <span className="hud-goal-bullet" />
                        <span>Learn New Tech</span>
                      </div>
                      <span className="hud-goal-pct">60%</span>
                    </div>
                    <div className="hud-goal-item">
                      <div className="hud-goal-left">
                        <span className="hud-goal-bullet" />
                        <span>Contribute Open Source</span>
                      </div>
                      <span className="hud-goal-pct">50%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
              <div className="hud-col">
                {/* 1. Total GitHub Contributions Radial Gauge */}
                <div className="hud-panel hud-total-gauge-box">
                  <svg className="hud-gauge-svg" viewBox="0 0 140 140">
                    {/* Outer tick marks */}
                    <circle
                      cx="70"
                      cy="70"
                      r="64"
                      fill="transparent"
                      stroke="rgba(0, 229, 255, 0.25)"
                      strokeWidth="1.5"
                      strokeDasharray="3 4"
                    />
                    {/* Background Arc */}
                    <circle
                      cx="70"
                      cy="70"
                      r={gaugeRadius}
                      fill="transparent"
                      stroke="rgba(0, 229, 255, 0.15)"
                      strokeWidth="8"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={gaugeCircumference * 0.25}
                      transform="rotate(135 70 70)"
                    />
                    {/* Progress Arc */}
                    <circle
                      cx="70"
                      cy="70"
                      r={gaugeRadius}
                      fill="transparent"
                      stroke="#00e5ff"
                      strokeWidth="8"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={gaugeOffset}
                      strokeLinecap="round"
                      transform="rotate(135 70 70)"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  <div className="hud-gauge-center">
                    <span className="hud-gauge-sub">TOTAL</span>
                    <span className="hud-gauge-num">{student.githubContributions}</span>
                    <span className="hud-gauge-desc">GITHUB CONTRIBUTIONS</span>
                  </div>
                </div>

                {/* 2. Tech Stack Badges Grid */}
                <div className="hud-panel">
                  <div className="hud-panel-title">TECH STACK</div>
                  <div className="hud-tech-grid">
                    {TECH_STACK_ITEMS.map((item) => (
                      <div key={item} className="hud-tech-badge">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Quick Stats */}
                <div className="hud-panel hud-panel-amber">
                  <div className="hud-panel-title amber">QUICK STATS</div>
                  <div className="hud-quick-stats-list">
                    <div className="hud-quick-stat-item">
                      <span className="hud-quick-stat-label">
                        <span style={{ color: '#00e5ff' }}>&#9670;</span> GitHub Contributions
                      </span>
                      <span className="hud-quick-stat-val">{student.githubContributions}</span>
                    </div>
                    <div className="hud-quick-stat-item">
                      <span className="hud-quick-stat-label">
                        <span style={{ color: '#00e5ff' }}>&#9670;</span> LeetCode Solved
                      </span>
                      <span className="hud-quick-stat-val">{leetcodeSolved}</span>
                    </div>
                    <div className="hud-quick-stat-item">
                      <span className="hud-quick-stat-label">
                        <span style={{ color: '#00e5ff' }}>&#9670;</span> LeetCode Submissions
                      </span>
                      <span className="hud-quick-stat-val">{leetcodeSubmissions}</span>
                    </div>
                    <div className="hud-quick-stat-item">
                      <span className="hud-quick-stat-label">
                        <span style={{ color: '#00e5ff' }}>&#9670;</span> Active Since
                      </span>
                      <span className="hud-quick-stat-val">{activeSinceYear}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOTTOM SYSTEM TICKER / CONTROLS ───────────────────────── */}
            <div className="hud-bottom-bar">
              <div className="hud-status-live">
                <span className="hud-live-dot" />
                <span>SYS.ONLINE // HOLOGRAPHIC TRANSPARENT DISPLAY</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  className="hud-nav-btn"
                  style={{ padding: '3px 8px', fontSize: '10px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAutoPlay(!autoPlay);
                  }}
                  title={autoPlay ? 'Pause Auto Cycle' : 'Auto Cycle Students'}
                >
                  {autoPlay ? '⏸ PAUSE' : '▶ AUTO CYCLE'}
                </button>
                <button
                  className="hud-nav-btn"
                  style={{ padding: '3px 8px', fontSize: '10px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                  title="Fullscreen Preview"
                >
                  ⛶ EXPAND
                </button>
                <span>STUDENT ID: {studentId}</span>
              </div>
            </div>
          </div>
        </Html>
      </group>

      {/* ── EXPANDED MODAL OVERLAY ────────────────────────────────────── */}
      {isExpanded && (
        <div className="transparent-screen-modal-backdrop" onClick={() => setIsExpanded(false)}>
          <div
            className="transparent-screen-modal-content"
            style={{ width: '95vw', maxWidth: '1420px', height: '90vh', maxHeight: '720px', background: '#060c16', padding: '14px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5ff', fontWeight: 'bold' }}>
                <span className="hud-live-dot" />
                <span>DYNAMIC STUDENT DASHBOARD &mdash; {student.name}</span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsExpanded(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {/* Render identical HUD in expanded modal */}
              <div className="hud-screen-container" style={{ width: '100%', height: '100%', minHeight: '620px' }}>
                {/* Same HUD markup is accessible in fullscreen view */}
                <div className="hud-corner-tl" />
                <div className="hud-corner-tr" />
                <div className="hud-corner-bl" />
                <div className="hud-corner-br" />
                <div className="hud-scanline" />
                {/* Top Nav */}
                <div className="hud-nav-bar" style={{ marginBottom: '10px' }}>
                  <button className="hud-nav-btn" onClick={handlePrev}>&#9664; PREV</button>
                  <div className="hud-student-counter">
                    <span>STUDENT</span>
                    <select
                      className="hud-student-select"
                      value={currentIndex}
                      onChange={(e) => setCurrentIndex(Number(e.target.value))}
                    >
                      {studentEntries.map(([id, s], idx) => (
                        <option key={id} value={idx}>{idx + 1}. {s.name}</option>
                      ))}
                    </select>
                    <span>OF {studentEntries.length}</span>
                  </div>
                  <button className="hud-nav-btn" onClick={handleNext}>NEXT &#9654;</button>
                </div>
                {/* 3 Col layout inside modal */}
                <div className="hud-main-grid" style={{ flex: 1 }}>
                  {/* Left */}
                  <div className="hud-col">
                    <div className="hud-panel">
                      <div className="hud-panel-title">GITHUB CONTRIBUTIONS BREAKDOWN</div>
                      <div className="hud-chart-container" style={{ height: '180px' }}>
                        <div className="hud-chart-bars">
                          {yearEntries.map(([yr, count]) => (
                            <div key={yr} className="hud-chart-col">
                              <span className="hud-bar-val">{count}</span>
                              <div className="hud-bar-fill" style={{ height: `${Math.max(8, Math.round((count / maxYearContrib) * 85))}%` }} />
                              <span className="hud-bar-year">{yr}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="hud-panel">
                      <div className="hud-panel-title">CORE SKILLS</div>
                      <div className="hud-progress-list">
                        <div className="hud-progress-item">
                          <div className="hud-progress-info"><span>Web Development</span><span style={{ color: '#00e5ff' }}>90%</span></div>
                          <div className="hud-progress-track"><div className="hud-progress-bar" style={{ width: '90%' }} /></div>
                        </div>
                        <div className="hud-progress-item">
                          <div className="hud-progress-info"><span>Problem Solving</span><span style={{ color: '#00e5ff' }}>85%</span></div>
                          <div className="hud-progress-track"><div className="hud-progress-bar" style={{ width: '85%' }} /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Center */}
                  <div className="hud-col">
                    <div className="hud-panel hud-identity-box">
                      <h1 className="hud-student-name">{student.name}</h1>
                      <div className="hud-student-role"><span>DEVELOPER &bull; PROBLEM SOLVER</span></div>
                      <div className="hud-links-grid">
                        {student.links?.portfolio && <a href={student.links.portfolio} target="_blank" rel="noreferrer" className="hud-link-pill"><span className="hud-link-label">Portfolio</span></a>}
                        {student.links?.github && <a href={student.links.github} target="_blank" rel="noreferrer" className="hud-link-pill"><span className="hud-link-label">GitHub</span></a>}
                        {student.links?.leetcode && <a href={student.links.leetcode} target="_blank" rel="noreferrer" className="hud-link-pill"><span className="hud-link-label">LeetCode</span></a>}
                        {student.links?.linkedin && <a href={student.links.linkedin} target="_blank" rel="noreferrer" className="hud-link-pill"><span className="hud-link-label">LinkedIn</span></a>}
                      </div>
                    </div>
                    <div className="hud-panel hud-panel-amber">
                      <div className="hud-panel-title amber">LEETCODE PROGRESS</div>
                      <div className="hud-leetcode-box">
                        <div className="hud-donut-wrap">
                          <svg className="hud-donut-svg" viewBox="0 0 95 95">
                            <circle cx="47.5" cy="47.5" r={donutRadius} fill="transparent" stroke="rgba(255, 122, 26, 0.15)" strokeWidth="7" />
                            <circle cx="47.5" cy="47.5" r={donutRadius} fill="transparent" stroke="#ff7a1a" strokeWidth="7" strokeDasharray={donutCircumference} strokeDashoffset={donutOffset} strokeLinecap="round" />
                          </svg>
                          <div className="hud-donut-center"><div className="hud-donut-num">{leetcodeSolved}</div><div className="hud-donut-label">SOLVED</div></div>
                        </div>
                        <div className="hud-leetcode-stats">
                          <div className="hud-stat-pill"><div className="hud-stat-pill-num">{leetcodeSolved} Solved</div></div>
                          <div className="hud-stat-pill"><div className="hud-stat-pill-num">{leetcodeSubmissions} Submissions</div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Right */}
                  <div className="hud-col">
                    <div className="hud-panel hud-total-gauge-box">
                      <div className="hud-gauge-center">
                        <span className="hud-gauge-sub">TOTAL</span>
                        <span className="hud-gauge-num">{student.githubContributions}</span>
                        <span className="hud-gauge-desc">GITHUB CONTRIBUTIONS</span>
                      </div>
                    </div>
                    <div className="hud-panel">
                      <div className="hud-panel-title">TECH STACK</div>
                      <div className="hud-tech-grid">
                        {TECH_STACK_ITEMS.map((item) => (
                          <div key={item} className="hud-tech-badge">{item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransparentDisplay;
