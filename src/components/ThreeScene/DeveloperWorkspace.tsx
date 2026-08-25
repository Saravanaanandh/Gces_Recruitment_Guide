import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Import motivational wall pictures from assets
import dhoniImg from '../../assets/dhoni_wall1.jpg';
import elonImg from '../../assets/elon_wall2.jpg';
import steveImg from '../../assets/steve_wall2.jpg';
import viratImg from '../../assets/virat_wall1.jpg';
import warrenImg from '../../assets/warren_wall2.jpg';

export type FocusTarget =
  | 'none'
  | 'clock'
  | 'desk'
  | 'photo-virat'
  | 'photo-dhoni'
  | 'photo-warren'
  | 'photo-steve'
  | 'photo-elon'
  | 'board';

interface DeveloperWorkspaceProps {
  deviceTier: 'desktop' | 'tablet' | 'mobile';
  focusedTarget: FocusTarget;
  onFocusTarget: (target: FocusTarget) => void;
  isDayMode?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Generate Code Editor Canvas Texture (Full-Screen Live IDE Display)
// ─────────────────────────────────────────────────────────────────────────────
function createCodeCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

const CODE_LINES = [
  { text: 'import { createWorkspace, Engine } from "@future/tech";', type: 'import' },
  { text: 'import { Innovation, AI, Quantum } from "@brain/core";', type: 'import' },
  { text: '', type: 'empty' },
  { text: 'interface Developer {', type: 'type' },
  { text: '  name: string;', type: 'prop' },
  { text: '  focus: "FullStack" | "Cloud" | "AI" | "WebGL";', type: 'prop' },
  { text: '  stamina: number;', type: 'prop' },
  { text: '  passion: "Infinite";', type: 'prop' },
  { text: '}', type: 'type' },
  { text: '', type: 'empty' },
  { text: 'export async function buildNextGenApp(dev: Developer): Promise<Impact> {', type: 'func' },
  { text: '  const vision = await Engine.initialize({ turbo: true, shaders: "HighPrecision" });', type: 'code' },
  { text: '  console.log(`[🚀 BUILD] Architecting solutions with ${dev.name}...`);', type: 'log' },
  { text: '  ', type: 'empty' },
  { text: '  // Continuous improvement & relentless execution', type: 'comment' },
  { text: '  const pipeline = new Innovation.Pipeline([', type: 'code' },
  { text: '    AI.SynthesizeKnowledge({ precision: 0.999 }),', type: 'code' },
  { text: '    Quantum.OptimizePerformance({ latency: "0ms" }),', type: 'code' },
  { text: '  ]);', type: 'code' },
  { text: '', type: 'empty' },
  { text: '  const result = await pipeline.deploy({ environment: "Production" });', type: 'code' },
  { text: '  return { status: "SUCCESS", metric: "100x Growth", result };', type: 'return' },
  { text: '}', type: 'func' },
  { text: '', type: 'empty' },
  { text: 'const devProfile: Developer = {', type: 'const' },
  { text: '  name: "Saravana",', type: 'prop' },
  { text: '  focus: "FullStack",', type: 'prop' },
  { text: '  stamina: 100,', type: 'prop' },
  { text: '  passion: "Infinite",', type: 'prop' },
  { text: '};', type: 'const' },
  { text: 'await buildNextGenApp(devProfile);', type: 'call' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Generate Book Cover Canvas Textures
// ─────────────────────────────────────────────────────────────────────────────
function createBookTexture(
  title: string,
  author: string,
  subtitle: string,
  bgTheme: {
    bg: string;
    accent: string;
    spineColor: string;
    badge?: string;
    pattern?: 'circle' | 'lines' | 'gold' | 'dots' | 'leaf';
  }
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 720);
  grad.addColorStop(0, bgTheme.bg);
  grad.addColorStop(1, bgTheme.spineColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 720);

  const spineGrad = ctx.createLinearGradient(0, 0, 40, 0);
  spineGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
  spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(0, 0, 40, 720);

  ctx.strokeStyle = bgTheme.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 452, 660);
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, 440, 648);

  if (bgTheme.pattern === 'gold') {
    ctx.strokeStyle = bgTheme.accent;
    ctx.lineWidth = 3;
    ctx.save();
    ctx.translate(256, 360);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-60, -60, 120, 120);
    ctx.restore();
  } else if (bgTheme.pattern === 'dots') {
    ctx.fillStyle = bgTheme.accent;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 9; c++) {
        const rad = ((r * 9 + c) % 5) + 2;
        ctx.beginPath();
        ctx.arc(140 + c * 28, 300 + r * 24, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (bgTheme.pattern === 'lines') {
    ctx.fillStyle = bgTheme.accent;
    ctx.fillRect(80, 340, 352, 6);
  }

  if (bgTheme.badge) {
    ctx.fillStyle = bgTheme.accent;
    ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bgTheme.badge.toUpperCase(), 256, 80);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Inter", "Cinzel", serif';
  ctx.textAlign = 'center';

  const words = title.split(' ');
  let line = '';
  let y = 170;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 400 && n > 0) {
      ctx.fillText(line.trim(), 256, y);
      line = words[n] + ' ';
      y += 44;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), 256, y);

  if (subtitle) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = 'italic 16px "Inter", sans-serif';
    ctx.fillText(subtitle, 256, y + 42);
  }

  ctx.strokeStyle = bgTheme.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(180, 560);
  ctx.lineTo(332, 560);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 22px "Inter", sans-serif';
  ctx.fillText(author.toUpperCase(), 256, 620);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Desk Setup with Connected Lamp and Clean Full-Screen Display
// ─────────────────────────────────────────────────────────────────────────────
interface DeskSetupProps {
  deviceTier: 'desktop' | 'tablet' | 'mobile';
  isFocused: boolean;
}

const DeskSetup: React.FC<DeskSetupProps> = ({ deviceTier }) => {
  const { canvas, ctx } = useMemo(() => createCodeCanvas(), []);
  const codeTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }, [canvas]);

  const typingState = useRef({
    charIndex: 0,
    lineIndex: 0,
    cursorBlink: 0,
    lastUpdate: 0,
  });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const s = typingState.current;

    if (t - s.lastUpdate > 0.05) {
      s.lastUpdate = t;
      s.charIndex += 1;

      const currentLine = CODE_LINES[s.lineIndex]?.text || '';
      if (s.charIndex > currentLine.length + 10) {
        s.charIndex = 0;
        s.lineIndex = (s.lineIndex + 1) % CODE_LINES.length;
      }
      s.cursorBlink = Math.floor(t * 3) % 2;

      // Dark VS Code IDE Background filling full 1536x640 canvas
      ctx.fillStyle = '#14121d';
      ctx.fillRect(0, 0, 1536, 640);

      // Titlebar
      ctx.fillStyle = '#0d0c13';
      ctx.fillRect(0, 0, 1536, 48);

      // Window controls
      ctx.fillStyle = '#ff5f56';
      ctx.beginPath();
      ctx.arc(28, 24, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffbd2e';
      ctx.beginPath();
      ctx.arc(52, 24, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#27c93f';
      ctx.beginPath();
      ctx.arc(76, 24, 7, 0, Math.PI * 2);
      ctx.fill();

      // Active Editor Tab
      ctx.fillStyle = '#1e1b2b';
      ctx.fillRect(116, 8, 260, 40);
      ctx.fillStyle = '#61afef';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('⚡ DeveloperEngine.tsx', 136, 33);

      // Secondary Tab
      ctx.fillStyle = '#14121e';
      ctx.fillRect(382, 8, 220, 40);
      ctx.fillStyle = '#6c7086';
      ctx.font = '14px monospace';
      ctx.fillText('📁 Architecture.ts', 400, 33);

      // Breadcrumb Path Bar
      ctx.fillStyle = '#181622';
      ctx.fillRect(0, 48, 1536, 32);
      ctx.fillStyle = '#7c818c';
      ctx.font = '13.5px monospace';
      ctx.fillText('src  ›  components  ›  workspace  ›  DeveloperEngine.tsx', 24, 69);

      // Line number sidebar
      ctx.fillStyle = '#110f18';
      ctx.fillRect(0, 80, 68, 524);

      const startLine = Math.max(0, s.lineIndex - 12);
      let lineY = 115;

      for (let i = startLine; i <= Math.min(CODE_LINES.length - 1, startLine + 15); i++) {
        const item = CODE_LINES[i];

        // Line Numbers
        ctx.fillStyle = i === s.lineIndex ? '#abb2bf' : '#4b5263';
        ctx.font = '15px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${i + 1}`, 52, lineY);

        // Highlight Active Line
        if (i === s.lineIndex) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.fillRect(68, lineY - 20, 1468, 30);
        }

        ctx.textAlign = 'left';
        let textToDraw = item.text;
        if (i === s.lineIndex) {
          textToDraw = item.text.substring(0, Math.min(item.text.length, s.charIndex));
        }

        ctx.font = '16px "Fira Code", monospace';
        if (item.type === 'import') ctx.fillStyle = '#e06c75';
        else if (item.type === 'func') ctx.fillStyle = '#61afef';
        else if (item.type === 'comment') ctx.fillStyle = '#5c6370';
        else if (item.type === 'prop') ctx.fillStyle = '#98c379';
        else if (item.type === 'type') ctx.fillStyle = '#e5c07b';
        else if (item.type === 'log') ctx.fillStyle = '#d19a66';
        else if (item.type === 'return') ctx.fillStyle = '#c678dd';
        else ctx.fillStyle = '#abb2bf';

        ctx.fillText(textToDraw, 86, lineY);

        // Blinking Cursor
        if (i === s.lineIndex && s.cursorBlink === 1) {
          const charWidth = ctx.measureText(textToDraw).width;
          ctx.fillStyle = '#528bff';
          ctx.fillRect(86 + charWidth + 2, lineY - 18, 9, 22);
        }

        lineY += 31;
      }

      // Bottom Status Bar
      ctx.fillStyle = '#007acc';
      ctx.fillRect(0, 604, 1536, 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13.5px sans-serif';
      ctx.fillText('  MAIN*   UTF-8   TypeScript React (TSX)   Ln 18, Col 42   Prettier: Active   Workspace: Live', 16, 626);

      codeTexture.needsUpdate = true;
    }
  });

  const { screenGeom, bezelGeom } = useMemo(() => {
    const w = 1.35;
    const h = 0.58;
    const segments = 32;
    const curveDepth = 0.07;

    const sGeom = new THREE.PlaneGeometry(w, h, segments, 1);
    const pos = sGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const normX = x / (w / 2);
      pos.setZ(i, normX * normX * curveDepth);
    }
    sGeom.computeVertexNormals();

    const bGeom = new THREE.PlaneGeometry(w + 0.04, h + 0.04, segments, 1);
    const bPos = bGeom.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const x = bPos.getX(i);
      const normX = x / ((w + 0.04) / 2);
      bPos.setZ(i, normX * normX * curveDepth - 0.008);
    }
    bGeom.computeVertexNormals();

    return { screenGeom: sGeom, bezelGeom: bGeom };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Table Top */}
      <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.05, 0.95]} />
        <meshStandardMaterial color="#2a2732" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Desk edge accent */}
      <mesh position={[0, 0.785, 0.47]}>
        <boxGeometry args={[2.18, 0.01, 0.01]} />
        <meshStandardMaterial color="#ff9e3b" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Desk Legs */}
      <mesh position={[-0.98, 0.38, 0]} castShadow>
        <boxGeometry args={[0.06, 0.76, 0.8]} />
        <meshStandardMaterial color="#181620" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[-0.98, 0.02, 0]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.88]} />
        <meshStandardMaterial color="#100e16" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0.98, 0.38, 0]} castShadow>
        <boxGeometry args={[0.06, 0.76, 0.8]} />
        <meshStandardMaterial color="#181620" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0.98, 0.02, 0]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.88]} />
        <meshStandardMaterial color="#100e16" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Crossbar */}
      <mesh position={[0, 0.62, -0.2]}>
        <boxGeometry args={[1.9, 0.06, 0.15]} />
        <meshStandardMaterial color="#16141d" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Desk Mat */}
      <mesh position={[0, 0.788, 0.08]} receiveShadow>
        <boxGeometry args={[1.5, 0.005, 0.6]} />
        <meshStandardMaterial color="#17151e" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* ── Curved Ultrawide Monitor (Single Unified Screen - No Clipping) ─── */}
      <group position={[0, 1.16, -0.16]}>
        <mesh geometry={screenGeom} position={[0, 0, 0.006]}>
          <meshBasicMaterial map={codeTexture} toneMapped={false} />
        </mesh>

        <mesh geometry={bezelGeom} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0e0d14" roughness={0.6} metalness={0.8} />
        </mesh>
        <pointLight position={[0, 0, -0.3]} color="#61afef" intensity={0.4} distance={2.2} decay={2} />

        {/* Stand - Positioned strictly behind the monitor bezel with no screen clipping */}
        <mesh position={[0, -0.37, 0]} castShadow>
          <boxGeometry args={[0.34, 0.015, 0.22]} />
          <meshStandardMaterial color="#2b2834" roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[0, -0.16, -0.10]} castShadow>
          <boxGeometry args={[0.07, 0.42, 0.05]} />
          <meshStandardMaterial color="#201e28" roughness={0.35} metalness={0.8} />
        </mesh>
      </group>

      {/* Keyboard */}
      <group position={[-0.15, 0.792, 0.16]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.44, 0.02, 0.16]} />
          <meshStandardMaterial color="#1a1722" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.014, 0]}>
          <boxGeometry args={[0.42, 0.012, 0.14]} />
          <meshStandardMaterial color="#2d2a38" roughness={0.7} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.022, 0.045]}>
          <boxGeometry args={[0.12, 0.008, 0.022]} />
          <meshStandardMaterial color="#ff7b72" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* Mouse */}
      <group position={[0.32, 0.792, 0.16]}>
        <mesh position={[0, 0.015, 0]} castShadow>
          <boxGeometry args={[0.07, 0.028, 0.12]} />
          <meshStandardMaterial color="#1a1822" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.03, -0.02]}>
          <boxGeometry args={[0.008, 0.008, 0.03]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
      </group>

      {/* Connected Desk Lamp - Positioned clear of the monitor with ample spacing */}
      <group position={[-0.96, 0.785, -0.05]}>
        <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.085, 0.024, 24]} />
          <meshStandardMaterial color="#22202c" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.01, 0.155, 0]} rotation={[0, 0, -0.1]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.25, 12]} />
          <meshStandardMaterial color="#181622" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.02, 0.28, 0]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.08, 0.33, 0.08]} rotation={[0.45, 0, -0.45]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.22, 12]} />
          <meshStandardMaterial color="#181622" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.13, 0.38, 0.15]} rotation={[Math.PI * 0.8, -0.2, 0.3]}>
          <coneGeometry args={[0.07, 0.12, 20, 1, true]} />
          <meshStandardMaterial color="#2d2838" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.13, 0.37, 0.15]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshBasicMaterial color="#fff3db" />
        </mesh>
        <spotLight
          position={[0.13, 0.37, 0.15]}
          target-position={[0.2, 0.0, 0.2]}
          color="#ffe4b8"
          intensity={deviceTier === 'mobile' ? 1.5 : 2.4}
          distance={3.5}
          angle={Math.PI / 4}
          penumbra={0.6}
          decay={2}
          castShadow={deviceTier !== 'mobile'}
        />
      </group>

      {/* Coffee Mug */}
      <group position={[-0.55, 0.788, 0.26]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.035, 0.09, 18]} />
          <meshStandardMaterial color="#eae5dd" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <circleGeometry args={[0.036, 16]} />
          <meshStandardMaterial color="#3d2314" roughness={0.1} />
        </mesh>
        <mesh position={[-0.045, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.024, 0.007, 8, 16]} />
          <meshStandardMaterial color="#eae5dd" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Gaming Chair Model
// ─────────────────────────────────────────────────────────────────────────────
interface GamingChairProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  visible?: boolean;
}

const GamingChair: React.FC<GamingChairProps> = ({
  position,
  rotation = [0, 0, 0],
  visible = true,
}) => {
  return (
    <group position={position} rotation={rotation} visible={visible}>
      <group position={[0, 0.08, 0]}>
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const x = Math.cos(angle) * 0.3;
          const z = Math.sin(angle) * 0.3;
          return (
            <group key={i}>
              <mesh position={[x / 2, 0, z / 2]} rotation={[0, -angle, 0]} castShadow>
                <boxGeometry args={[0.3, 0.038, 0.045]} />
                <meshStandardMaterial color="#16141c" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[x * 0.82, 0.015, z * 0.82]} rotation={[0, -angle, 0]}>
                <boxGeometry args={[0.08, 0.015, 0.035]} />
                <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.2} />
              </mesh>
              <mesh position={[x, -0.04, z]} castShadow>
                <sphereGeometry args={[0.034, 12, 12]} />
                <meshStandardMaterial color="#0a090e" roughness={0.5} metalness={0.6} />
              </mesh>
            </group>
          );
        })}
      </group>

      <mesh position={[0, 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.04, 0.34, 18]} />
        <meshStandardMaterial color="#121018" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.12, 18]} />
        <meshStandardMaterial color="#888899" metalness={0.95} roughness={0.1} />
      </mesh>

      <mesh position={[0, 0.47, 0]} castShadow>
        <boxGeometry args={[0.24, 0.06, 0.24]} />
        <meshStandardMaterial color="#16141e" metalness={0.7} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.54, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.1, 0.52]} />
        <meshStandardMaterial color="#1b1822" roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.592, 0.02]}>
        <boxGeometry args={[0.12, 0.005, 0.48]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>
      <mesh position={[-0.25, 0.6, 0.02]} rotation={[0, 0, -0.32]}>
        <boxGeometry args={[0.11, 0.09, 0.5]} />
        <meshStandardMaterial color="#181520" roughness={0.6} />
      </mesh>
      <mesh position={[-0.28, 0.64, 0.02]} rotation={[0, 0, -0.32]}>
        <boxGeometry args={[0.025, 0.02, 0.48]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} />
      </mesh>
      <mesh position={[0.25, 0.6, 0.02]} rotation={[0, 0, 0.32]}>
        <boxGeometry args={[0.11, 0.09, 0.5]} />
        <meshStandardMaterial color="#181520" roughness={0.6} />
      </mesh>
      <mesh position={[0.28, 0.64, 0.02]} rotation={[0, 0, 0.32]}>
        <boxGeometry args={[0.025, 0.02, 0.48]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} />
      </mesh>

      <group position={[-0.31, 0.62, 0.02]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.035, 0.2, 0.05]} />
          <meshStandardMaterial color="#14121a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.19, 0]} castShadow>
          <boxGeometry args={[0.08, 0.032, 0.26]} />
          <meshStandardMaterial color="#1e1a26" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>
      <group position={[0.31, 0.62, 0.02]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.035, 0.2, 0.05]} />
          <meshStandardMaterial color="#14121a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.19, 0]} castShadow>
          <boxGeometry args={[0.08, 0.032, 0.26]} />
          <meshStandardMaterial color="#1e1a26" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>

      <group position={[0, 0.98, -0.22]} rotation={[-0.1, 0, 0]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[0.42, 0.78, 0.07]} />
          <meshStandardMaterial color="#1b1822" roughness={0.65} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.04, 0.038]}>
          <boxGeometry args={[0.11, 0.74, 0.005]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        <mesh position={[-0.24, 0.14, 0.03]} rotation={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.12, 0.54, 0.06]} />
          <meshStandardMaterial color="#181520" roughness={0.6} />
        </mesh>
        <mesh position={[0.24, 0.14, 0.03]} rotation={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.12, 0.54, 0.06]} />
          <meshStandardMaterial color="#181520" roughness={0.6} />
        </mesh>
        <mesh position={[-0.1, 0.26, 0]}>
          <boxGeometry args={[0.085, 0.055, 0.08]} />
          <meshStandardMaterial color="#0c0b10" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.1, 0.26, 0]}>
          <boxGeometry args={[0.085, 0.055, 0.08]} />
          <meshStandardMaterial color="#0c0b10" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.16, 0.055]} castShadow>
          <boxGeometry args={[0.34, 0.16, 0.06]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} metalness={0.1} />
        </mesh>
        <group position={[0, 0.44, 0.045]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.15, 0.065]} />
            <meshStandardMaterial color="#181520" roughness={0.6} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[0.14, 0.045, 0.005]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Books on Desk
// ─────────────────────────────────────────────────────────────────────────────
const BooksCollection: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({
  position,
  rotation = [0, 0, 0],
}) => {
  const texPsychology = useMemo(
    () =>
      createBookTexture(
        'The Psychology of Money',
        'Morgan Housel',
        'Timeless Lessons on Wealth, Greed & Happiness',
        { bg: '#0f382c', accent: '#d4af37', spineColor: '#071f18', badge: 'Bestseller', pattern: 'gold' }
      ),
    []
  );

  const texRichDad = useMemo(
    () =>
      createBookTexture('Rich Dad Poor Dad', 'Robert T. Kiyosaki', 'What The Rich Teach Their Kids About Money', {
        bg: '#541270',
        accent: '#f26522',
        spineColor: '#2b073b',
        badge: '#1 Finance Book',
        pattern: 'lines',
      }),
    []
  );

  const texAtomic = useMemo(
    () =>
      createBookTexture('Atomic Habits', 'James Clear', 'An Easy & Proven Way to Build Good Habits', {
        bg: '#202028',
        accent: '#f59e0b',
        spineColor: '#121218',
        badge: '15 Million Copies',
        pattern: 'dots',
      }),
    []
  );

  const renderBook = (
    texture: THREE.CanvasTexture,
    pos: [number, number, number],
    rot: [number, number, number],
    size: [number, number, number] = [0.24, 0.038, 0.32]
  ) => {
    const [w, h, d] = size;
    return (
      <group position={pos} rotation={rot}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial attach="material-0" color="#e8e4d8" roughness={0.8} />
          <meshStandardMaterial attach="material-1" color="#1a1820" roughness={0.4} />
          <meshStandardMaterial attach="material-2" map={texture} roughness={0.35} />
          <meshStandardMaterial attach="material-3" color="#1a1820" roughness={0.4} />
          <meshStandardMaterial attach="material-4" color="#e8e4d8" roughness={0.8} />
          <meshStandardMaterial attach="material-5" color="#e8e4d8" roughness={0.8} />
        </mesh>
      </group>
    );
  };

  return (
    <group position={position} rotation={rotation}>
      {renderBook(texPsychology, [0, 0.019, 0], [0, 0.08, 0], [0.25, 0.04, 0.33])}
      {renderBook(texRichDad, [0.01, 0.058, -0.01], [0, -0.05, 0], [0.24, 0.038, 0.32])}
      {renderBook(texAtomic, [-0.005, 0.096, 0.01], [0, 0.12, 0], [0.245, 0.038, 0.325])}
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// // TASK 2: GALLERY WALL PICTURES WITH CLICK-TO-FOCUS INTERACTION
// ─────────────────────────────────────────────────────────────────────────────
interface FramedPictureProps {
  imageSrc: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onClick?: (e: any) => void;
}

const FRAME_WIDTH = 1.25;
const FRAME_HEIGHT = 1.65;
const BORDER_THICK = 0.045;
const FRAME_DEPTH = 0.04;
const INNER_WIDTH = FRAME_WIDTH - BORDER_THICK * 2;
const INNER_HEIGHT = FRAME_HEIGHT - BORDER_THICK * 2;

const FramedPicture: React.FC<FramedPictureProps> = ({
  imageSrc,
  position,
  rotation,
  onClick,
}) => {
  const rawTexture = useLoader(THREE.TextureLoader, imageSrc);

  const coverTexture = useMemo(() => {
    if (!rawTexture || !rawTexture.image) return rawTexture;

    const tex = rawTexture.clone();
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    const imgW = tex.image.width || 1;
    const imgH = tex.image.height || 1;
    const imgAspect = imgW / imgH;
    const frameAspect = INNER_WIDTH / INNER_HEIGHT;

    if (imgAspect > frameAspect) {
      const scaleX = frameAspect / imgAspect;
      tex.repeat.set(scaleX, 1);
      tex.offset.set((1 - scaleX) / 2, 0);
    } else {
      const scaleY = imgAspect / frameAspect;
      tex.repeat.set(1, scaleY);
      tex.offset.set(0, 1 - scaleY);
    }

    tex.needsUpdate = true;
    return tex;
  }, [rawTexture]);

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[FRAME_WIDTH, FRAME_HEIGHT, 0.015]} />
        <meshStandardMaterial color="#1a1820" roughness={0.8} />
      </mesh>

      <mesh position={[0, 0, 0.01]} receiveShadow>
        <planeGeometry args={[INNER_WIDTH, INNER_HEIGHT]} />
        <meshStandardMaterial
          map={coverTexture}
          roughness={0.65}
          metalness={0.02}
          toneMapped={true}
        />
      </mesh>

      <mesh position={[0, FRAME_HEIGHT / 2 - BORDER_THICK / 2, 0.018]}>
        <boxGeometry args={[FRAME_WIDTH, BORDER_THICK, FRAME_DEPTH]} />
        <meshStandardMaterial color="#1c1a24" roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[0, -FRAME_HEIGHT / 2 + BORDER_THICK / 2, 0.018]}>
        <boxGeometry args={[FRAME_WIDTH, BORDER_THICK, FRAME_DEPTH]} />
        <meshStandardMaterial color="#1c1a24" roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[-FRAME_WIDTH / 2 + BORDER_THICK / 2, 0, 0.018]}>
        <boxGeometry args={[BORDER_THICK, FRAME_HEIGHT - BORDER_THICK * 2, FRAME_DEPTH]} />
        <meshStandardMaterial color="#1c1a24" roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[FRAME_WIDTH / 2 - BORDER_THICK / 2, 0, 0.018]}>
        <boxGeometry args={[BORDER_THICK, FRAME_HEIGHT - BORDER_THICK * 2, FRAME_DEPTH]} />
        <meshStandardMaterial color="#1c1a24" roughness={0.35} metalness={0.6} />
      </mesh>
    </group>
  );
};

const WallDecorGallery: React.FC<{
  onFocusTarget: (target: FocusTarget) => void;
  focusedTarget: FocusTarget;
}> = ({ onFocusTarget, focusedTarget }) => {
  const handleClick = (target: FocusTarget) => (e: any) => {
    e.stopPropagation();
    if (focusedTarget === 'none') {
      onFocusTarget(target);
    }
  };

  return (
    <group>
      {/* Wall 1 (Left Wall at X = -6.92) */}
      <FramedPicture
        imageSrc={viratImg}
        position={[-6.92, 1.85, -2.4]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={handleClick('photo-virat')}
      />
      <FramedPicture
        imageSrc={dhoniImg}
        position={[-6.92, 1.85, 1.4]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={handleClick('photo-dhoni')}
      />

      {/* Wall 2 (Back Wall at Z = -5.92) */}
      <FramedPicture
        imageSrc={warrenImg}
        position={[-4.2, 1.85, -5.92]}
        rotation={[0, 0, 0]}
        onClick={handleClick('photo-warren')}
      />
      <FramedPicture
        imageSrc={steveImg}
        position={[-1.4, 1.85, -5.92]}
        rotation={[0, 0, 0]}
        onClick={handleClick('photo-steve')}
      />
      <FramedPicture
        imageSrc={elonImg}
        position={[1.4, 1.85, -5.92]}
        rotation={[0, 0, 0]}
        onClick={handleClick('photo-elon')}
      />
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Analog Wall Clock
// ─────────────────────────────────────────────────────────────────────────────
interface LiveWallClockProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  onClick?: (e: any) => void;
}

const LiveWallClock: React.FC<LiveWallClockProps> = ({
  position,
  rotation = [0, 0, 0],
  onClick,
}) => {
  const hourHandRef = useRef<THREE.Group>(null!);
  const minuteHandRef = useRef<THREE.Group>(null!);
  const secondHandRef = useRef<THREE.Group>(null!);

  const clockFaceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const bgGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 250);
    bgGrad.addColorStop(0, '#f5f2eb');
    bgGrad.addColorStop(1, '#e5e0d4');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2b2834';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(256, 256, 245, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const isHour = i % 5 === 0;

      const innerR = isHour ? 195 : 220;
      const outerR = 236;

      const x1 = 256 + Math.cos(angle) * innerR;
      const y1 = 256 + Math.sin(angle) * innerR;
      const x2 = 256 + Math.cos(angle) * outerR;
      const y2 = 256 + Math.sin(angle) * outerR;

      ctx.strokeStyle = isHour ? '#1a1822' : '#888490';
      ctx.lineWidth = isHour ? 6 : 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (isHour) {
        const num = i === 0 ? 12 : i / 5;
        const numAngle = angle - Math.PI / 2;
        const numR = 160;
        const nx = 256 + Math.cos(numAngle) * numR;
        const ny = 256 + Math.sin(numAngle) * numR;

        ctx.fillStyle = '#1a1822';
        ctx.font = 'bold 30px "Inter", "Helvetica Neue", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${num}`, nx, ny);
      }
    }

    ctx.fillStyle = '#6b6577';
    ctx.font = '600 13px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRECISION TIME', 256, 315);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  }, []);

  useFrame(() => {
    const now = new Date();
    const ms = now.getMilliseconds();
    const sec = now.getSeconds() + ms / 1000;
    const min = now.getMinutes() + sec / 60;
    const hour = (now.getHours() % 12) + min / 60;

    if (secondHandRef.current) {
      secondHandRef.current.rotation.z = -(now.getSeconds() / 60) * Math.PI * 2;
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = -(min / 60) * Math.PI * 2;
    }
    if (hourHandRef.current) {
      hourHandRef.current.rotation.z = -(hour / 12) * Math.PI * 2;
    }
  });

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
      onClick={onClick}
    >
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.44, 0.45, 0.04, 48]} />
        <meshStandardMaterial color="#1a1820" metalness={0.8} roughness={0.35} />
      </mesh>

      <mesh position={[0, 0, 0.022]} receiveShadow>
        <circleGeometry args={[0.42, 48]} />
        <meshStandardMaterial
          map={clockFaceTexture}
          roughness={0.55}
          metalness={0.05}
          toneMapped={true}
        />
      </mesh>

      <group ref={hourHandRef} position={[0, 0, 0.026]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.024, 0.2, 0.005]} />
          <meshStandardMaterial color="#110f17" roughness={0.3} />
        </mesh>
      </group>

      <group ref={minuteHandRef} position={[0, 0, 0.031]}>
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[0.016, 0.28, 0.004]} />
          <meshStandardMaterial color="#110f17" roughness={0.3} />
        </mesh>
      </group>

      <group ref={secondHandRef} position={[0, 0, 0.036]}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.006, 0.32, 0.003]} />
          <meshStandardMaterial color="#dc2626" roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <boxGeometry args={[0.012, 0.1, 0.003]} />
          <meshStandardMaterial color="#dc2626" roughness={0.2} />
        </mesh>
      </group>

      <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.01, 16]} />
        <meshStandardMaterial color="#ff9e3b" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DEVELOPER WORKSPACE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const DeveloperWorkspace: React.FC<DeveloperWorkspaceProps> = ({
  deviceTier,
  focusedTarget,
  onFocusTarget,
}) => {
  return (
    <group>
      <group
        position={[-5.1, -1.5, -0.4]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[1.45, 1.45, 1.45]}
        onPointerOver={(e) => {
          if (focusedTarget === 'none') {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (focusedTarget === 'none') {
            onFocusTarget('desk');
          }
        }}
      >
        <DeskSetup
          deviceTier={deviceTier}
          isFocused={focusedTarget === 'desk'}
        />

        {/* Gaming Chair */}
        <GamingChair
          position={[0, 0, 0.72]}
          rotation={[0, Math.PI + 0.12, 0]}
          visible={focusedTarget !== 'desk'}
        />

        <BooksCollection
          position={[0.88, 0.79, 0.05]}
          rotation={[0, -0.08, 0]}
        />
      </group>

      <WallDecorGallery
        onFocusTarget={onFocusTarget}
        focusedTarget={focusedTarget}
      />

      <LiveWallClock
        position={[-6.92, 2.2, -0.6]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (focusedTarget === 'none') {
            onFocusTarget('clock');
          }
        }}
      />
    </group>
  );
};

export default DeveloperWorkspace;
