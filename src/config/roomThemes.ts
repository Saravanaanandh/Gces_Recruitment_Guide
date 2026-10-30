import * as THREE from 'three';

export interface MaterialStyle {
  color?: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
}

export interface RoomTheme {
  id: string;
  name: string;
  description: string;
  swatch: string[]; // 3 colors for preview dots: [wall, sofa, accent]
  rug: {
    color: string;
    border: string;
  };
  lightColor: string;
  palette: Record<string, MaterialStyle>;
  bookCover: MaterialStyle;
  bookCovers?: string[];
  bookPages: MaterialStyle;
  plants: MaterialStyle;
}

export const DEFAULT_BOOK_COLORS = [
  '#9E6A32', // Warm Leather Ochre
  '#2C4A6F', // Deep Navy
  '#8B2635', // Crimson Burgundy
  '#2E6F40', // Forest Emerald
  '#D48C46', // Amber Gold
  '#4A3B6B', // Royal Plum
  '#1B6B6D', // Deep Teal
  '#A64B2A', // Terracotta Rust
  '#3C5A3E', // Sage Pine
  '#8C3B52', // Dusty Rose Wine
  '#2B3E50', // Steel Blue
  '#C47B37', // Warm Cinnamon
  '#543D68', // Velvet Violet
  '#345D38', // Dark Olive
  '#A8422B', // Burnt Sienna
  '#1F5470', // Ocean Slate
  '#7A583A', // Rich Chestnut
  '#466952', // Muted Moss
  '#8F3333', // Deep Cardinal
  '#425766', // Charcoal Denim
];

export const FIXED_TV_STYLE: MaterialStyle = { color: '#0A0A0A', roughness: 0.3 };

export const ROOM_THEMES: RoomTheme[] = [
  // ── 1. USER'S EXACT PALETTE: Warm Nordic ───────────────────────────────────
  {
    id: 'warm-nordic',
    name: 'Warm Nordic',
    description: 'Soft alabaster walls with slate heather sofa and teal accents',
    swatch: ['#F2EEE8', '#8F8C89', '#2F6F73'],
    rug: {
      color: '#E8E3DA',
      border: '#2F6F73',
    },
    lightColor: '#FFF8F0',
    palette: {
      'White paint': { color: '#F2EEE8', roughness: 0.9 },
      'Statuario': { color: '#ECE9E4', roughness: 0.15 },
      'Nero': { color: '#F2EEE8', roughness: 0.9 },
      'white fabric': { color: '#8F8C89', roughness: 0.95 },
      'teal fabric': { color: '#2F6F73', roughness: 0.95 },
      'wood': { color: '#6E5645', roughness: 0.5 },
      'curtain': { color: '#A8A3A6', roughness: 1 },
      'glass clear': { color: '#D5E8EC', roughness: 0.05, opacity: 0.15 },
      'grass': { color: '#5D7F3A', roughness: 1 },
      'steel': { color: '#1C1C1C', roughness: 0.35, metalness: 1 },
      'bronze': { color: '#8C6A3F', roughness: 0.25, metalness: 1 },
      'Material #30': { color: '#000000', emissive: '#FFF9B2', emissiveIntensity: 2 },
      'fire': { color: '#0A0A0A', roughness: 0.3 },
      'eclate': { color: '#FFF3DC', emissive: '#FFF3DC', emissiveIntensity: 0.6 },
      'tv': { color: '#0A0A0A', roughness: 0.3 },
      'netflux': { color: '#000000', emissive: '#1B2A41', emissiveIntensity: 1 },
    },
    bookCover: { color: '#9E6A32', roughness: 0.7 },
    bookCovers: [
      '#9E6A32', '#2F6F73', '#8B2E3E', '#2E6838', '#D48C46',
      '#3D5A80', '#A64B2A', '#4A6B5B', '#7A4328', '#5E3A68',
      '#1B6B6D', '#B87A3E', '#2B4A6F', '#8C3B52', '#3C6641',
      '#C47B37', '#425766', '#9B3D3D', '#546A7B', '#A8422B',
    ],
    bookPages: { color: '#EDE6D6', roughness: 1 },
    plants: { color: '#2F682F', roughness: 0.8 },
  },

  // ── 2. Midnight Luxury (Dark Penthouse) ────────────────────────────────────
  // {
  //   id: 'midnight-luxury',
  //   name: 'Midnight Luxury',
  //   description: 'Deep graphite walls, midnight navy upholstery, and warm cognac accents',
  //   swatch: ['#1F2228', '#252F3F', '#C87D32'],
  //   rug: {
  //     color: '#1E232B',
  //     border: '#C87D32',
  //   },
  //   lightColor: '#FFE0B8',
  //   palette: {
  //     'White paint':   { color: '#22252C', roughness: 0.9 },
  //     'Statuario':     { color: '#181A20', roughness: 0.2 },
  //     'Nero':          { color: '#22252C', roughness: 0.9 },
  //     'white fabric':  { color: '#222B38', roughness: 0.95 },
  //     'teal fabric':   { color: '#C87D32', roughness: 0.9 },
  //     'wood':          { color: '#443224', roughness: 0.5 },
  //     'curtain':       { color: '#323742', roughness: 1 },
  //     'glass clear':   { color: '#7E9BB0', roughness: 0.05, opacity: 0.2 },
  //     'grass':         { color: '#3A5A35', roughness: 1 },
  //     'steel':         { color: '#111215', roughness: 0.35, metalness: 1 },
  //     'bronze':        { color: '#D4AF37', roughness: 0.25, metalness: 1 },
  //     'Material #30':  { color: '#000000', emissive: '#FFD777', emissiveIntensity: 2.2 },
  //     'fire':          { color: '#0A0A0A', roughness: 0.3 },
  //     'eclate':        { color: '#FFD9A3', emissive: '#FFD9A3', emissiveIntensity: 0.8 },
  //     'tv':            { color: '#0A0A0A', roughness: 0.3 },
  //     'netflux':       { color: '#000000', emissive: '#0E274D', emissiveIntensity: 1.2 },
  //   },
  //   bookCover: { color: '#8A422B', roughness: 0.7 },
  //   bookPages: { color: '#E0D8CB', roughness: 1 },
  //   plants:    { color: '#235228', roughness: 0.8 },
  // },

  // ── 3. Japandi Sage (Serene Botanical) ─────────────────────────────────────
  {
    id: 'japandi-sage',
    name: 'Japandi Sage',
    description: 'Earthy chalk walls, natural linen, blonde ash wood, and muted sage',
    swatch: ['#EAE6DC', '#D3CDC0', '#4A6B50'],
    rug: {
      color: '#E2DCD0',
      border: '#4A6B50',
    },
    lightColor: '#FFFDF5',
    palette: {
      'White paint': { color: '#EAE6DC', roughness: 0.95 },
      'Statuario': { color: '#E0DCD2', roughness: 0.18 },
      'Nero': { color: '#EAE6DC', roughness: 0.95 },
      'white fabric': { color: '#D3CDC0', roughness: 0.95 },
      'teal fabric': { color: '#4A6B50', roughness: 0.92 },
      'wood': { color: '#8A7255', roughness: 0.55 },
      'curtain': { color: '#CCC6B8', roughness: 1 },
      'glass clear': { color: '#D4E2DC', roughness: 0.05, opacity: 0.15 },
      'grass': { color: '#5B7E41', roughness: 1 },
      'steel': { color: '#20241F', roughness: 0.4, metalness: 0.8 },
      'bronze': { color: '#A08552', roughness: 0.3, metalness: 0.9 },
      'Material #30': { color: '#000000', emissive: '#FFF5C2', emissiveIntensity: 1.8 },
      'fire': { color: '#0A0A0A', roughness: 0.3 },
      'eclate': { color: '#FFF8E6', emissive: '#FFF8E6', emissiveIntensity: 0.5 },
      'tv': { color: '#0A0A0A', roughness: 0.3 },
      'netflux': { color: '#000000', emissive: '#163326', emissiveIntensity: 0.9 },
    },
    bookCover: { color: '#526649', roughness: 0.7 },
    bookPages: { color: '#F0EBE0', roughness: 1 },
    plants: { color: '#38733A', roughness: 0.8 },
  },

  // ── 4. Sunset Terracotta (Mediterranean Warmth) ────────────────────────────
  {
    id: 'sunset-terracotta',
    name: 'Sunset Terracotta',
    description: 'Warm stucco, rich burnt terracotta upholstery, and golden amber accents',
    swatch: ['#F6EFE6', '#B85E3E', '#D9984E'],
    rug: {
      color: '#EFE5D8',
      border: '#B85E3E',
    },
    lightColor: '#FFF2E0',
    palette: {
      'White paint': { color: '#F6EFE6', roughness: 0.9 },
      'Statuario': { color: '#EBE2D7', roughness: 0.2 },
      'Nero': { color: '#F6EFE6', roughness: 0.9 },
      'white fabric': { color: '#B85E3E', roughness: 0.95 },
      'teal fabric': { color: '#D9984E', roughness: 0.95 },
      'wood': { color: '#73442C', roughness: 0.5 },
      'curtain': { color: '#D8C6B6', roughness: 1 },
      'glass clear': { color: '#EAE0D8', roughness: 0.05, opacity: 0.15 },
      'grass': { color: '#5B7239', roughness: 1 },
      'steel': { color: '#201816', roughness: 0.35, metalness: 0.85 },
      'bronze': { color: '#B57C3A', roughness: 0.25, metalness: 1 },
      'Material #30': { color: '#000000', emissive: '#FFE2B8', emissiveIntensity: 2 },
      'fire': { color: '#0A0A0A', roughness: 0.3 },
      'eclate': { color: '#FFE6CC', emissive: '#FFE6CC', emissiveIntensity: 0.7 },
      'tv': { color: '#0A0A0A', roughness: 0.3 },
      'netflux': { color: '#000000', emissive: '#3D1D16', emissiveIntensity: 1 },
    },
    bookCover: { color: '#9B4125', roughness: 0.7 },
    bookPages: { color: '#ECE1D2', roughness: 1 },
    plants: { color: '#2B5A2C', roughness: 0.8 },
  },

  // ── 5. Monochrome Studio (Contemporary Minimalist) ────────────────────────
  {
    id: 'monochrome-minimalist',
    name: 'Monochrome Studio',
    description: 'Crisp gallery white, pure charcoal architecture, and platinum accents',
    swatch: ['#F7F7F8', '#2D3036', '#E2E4E8'],
    rug: {
      color: '#EDEDEE',
      border: '#1E2024',
    },
    lightColor: '#FFFFFF',
    palette: {
      'White paint': { color: '#F7F7F8', roughness: 0.9 },
      'Statuario': { color: '#EDECEE', roughness: 0.12 },
      'Nero': { color: '#F7F7F8', roughness: 0.9 },
      'white fabric': { color: '#2D3036', roughness: 0.95 },
      'teal fabric': { color: '#E2E4E8', roughness: 0.9 },
      'wood': { color: '#33363D', roughness: 0.45 },
      'curtain': { color: '#C8CBD0', roughness: 1 },
      'glass clear': { color: '#DCE0E6', roughness: 0.02, opacity: 0.14 },
      'grass': { color: '#445C3B', roughness: 1 },
      'steel': { color: '#0A0A0C', roughness: 0.25, metalness: 1 },
      'bronze': { color: '#9095A0', roughness: 0.28, metalness: 0.95 },
      'Material #30': { color: '#000000', emissive: '#FFFFFF', emissiveIntensity: 2 },
      'fire': { color: '#0A0A0A', roughness: 0.3 },
      'eclate': { color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: 0.5 },
      'tv': { color: '#0A0A0A', roughness: 0.3 },
      'netflux': { color: '#000000', emissive: '#161920', emissiveIntensity: 0.85 },
    },
    bookCover: { color: '#2A2D33', roughness: 0.7 },
    bookPages: { color: '#FFFFFF', roughness: 1 },
    plants: { color: '#264828', roughness: 0.8 },
  },
  // {
  //   id: 'noir-gold',
  //   name: 'Noir Gold',
  //   description: 'Charcoal walls, black marble and polished brass for a dark luxury lounge',
  //   swatch: ['#2B2B2E', '#C9A24A', '#0B0B0B'],
  //   rug: {
  //     color: '#2A2A2E',
  //     border: '#C9A24A',
  //   },
  //   lightColor: '#FFD9A0',
  //   palette: {
  //     'White paint': { color: '#2B2B2E', roughness: 0.9 },
  //     'Statuario': { color: '#1C1C1F', roughness: 0.1 },
  //     'Nero': { color: '#2B2B2E', roughness: 0.9 },
  //     'white fabric': { color: '#3A3A40', roughness: 0.95 },
  //     'teal fabric': { color: '#C9A24A', roughness: 0.9 },
  //     'wood': { color: '#3B2A1E', roughness: 0.45 },
  //     'curtain': { color: '#4A4448', roughness: 1 },
  //     'glass clear': { color: '#CFC3AE', roughness: 0.02, opacity: 0.14 },
  //     'grass': { color: '#3F5636', roughness: 1 },
  //     'steel': { color: '#C9A24A', roughness: 0.3, metalness: 1 },
  //     'bronze': { color: '#B8893C', roughness: 0.25, metalness: 0.95 },
  //     'Material #30': { color: '#000000', emissive: '#FFD27A', emissiveIntensity: 2 },
  //     'fire': { color: '#0A0A0A', roughness: 0.3 },
  //     'eclate': { color: '#FFD27A', emissive: '#FFD27A', emissiveIntensity: 0.5 },
  //     'tv': { color: '#0A0A0A', roughness: 0.3 },
  //     'netflux': { color: '#000000', emissive: '#1A1710', emissiveIntensity: 0.85 },
  //   },
  //   bookCover: { color: '#3B2A1E', roughness: 0.7 },
  //   bookPages: { color: '#EDE3CC', roughness: 1 },
  //   plants: { color: '#2F4A2B', roughness: 0.8 },
  // },
  {
    id: 'scandi-soft',
    name: 'Scandi Soft',
    description: 'Pale oak, warm off-white and sage green for a calm, airy living space',
    swatch: ['#F7F4EE', '#8FB5A6', '#D2B48C'],
    rug: {
      color: '#E9E2D6',
      border: '#8FB5A6',
    },
    lightColor: '#FFF1D6',
    palette: {
      'White paint': { color: '#F7F4EE', roughness: 0.9 },
      'Statuario': { color: '#E9E2D6', roughness: 0.15 },
      'Nero': { color: '#F7F4EE', roughness: 0.9 },
      'white fabric': { color: '#D8D2C8', roughness: 0.95 },
      'teal fabric': { color: '#8FB5A6', roughness: 0.9 },
      'wood': { color: '#D2B48C', roughness: 0.5 },
      'curtain': { color: '#EFE9DF', roughness: 1 },
      'glass clear': { color: '#E3EEF0', roughness: 0.02, opacity: 0.12 },
      'grass': { color: '#6C8F4A', roughness: 1 },
      'steel': { color: '#3A3A3A', roughness: 0.3, metalness: 1 },
      'bronze': { color: '#C98F5A', roughness: 0.28, metalness: 0.9 },
      'Material #30': { color: '#000000', emissive: '#FFF1D6', emissiveIntensity: 2 },
      'fire': { color: '#0A0A0A', roughness: 0.3 },
      'eclate': { color: '#FFF6E5', emissive: '#FFF6E5', emissiveIntensity: 0.5 },
      'tv': { color: '#0A0A0A', roughness: 0.3 },
      'netflux': { color: '#000000', emissive: '#1B2A41', emissiveIntensity: 0.85 },
    },
    bookCover: { color: '#C98F5A', roughness: 0.7 },
    bookPages: { color: '#FFFFFF', roughness: 1 },
    plants: { color: '#4F7A44', roughness: 0.8 },
  },
  {
    id: 'terracotta-warm',
    name: 'Terracotta Warm',
    description: 'Clay sofa, cream walls and deep green accents with a cosy boho feel',
    swatch: ['#F3E6D5', '#B5754D', '#3F6B5E'],
    rug: {
      color: '#E4CDB0',
      border: '#B5754D',
    },
    lightColor: '#FFE2B8',
    palette: {
      'White paint': { color: '#F3E6D5', roughness: 0.9 },
      'Statuario': { color: '#E8DCC8', roughness: 0.15 },
      'Nero': { color: '#F3E6D5', roughness: 0.9 },
      'white fabric': { color: '#B5754D', roughness: 0.95 },
      'teal fabric': { color: '#3F6B5E', roughness: 0.9 },
      'wood': { color: '#8A5A3C', roughness: 0.5 },
      'curtain': { color: '#E4CDB0', roughness: 1 },
      'glass clear': { color: '#EADFCB', roughness: 0.02, opacity: 0.13 },
      'grass': { color: '#6B7F3A', roughness: 1 },
      'steel': { color: '#2B2B2B', roughness: 0.3, metalness: 1 },
      'bronze': { color: '#B8733C', roughness: 0.28, metalness: 0.9 },
      'Material #30': { color: '#000000', emissive: '#FFE2B8', emissiveIntensity: 2 },
      'fire': { color: '#0A0A0A', roughness: 0.3 },
      'eclate': { color: '#FFE9C8', emissive: '#FFE9C8', emissiveIntensity: 0.5 },
      'tv': { color: '#0A0A0A', roughness: 0.3 },
      'netflux': { color: '#000000', emissive: '#2A1C17', emissiveIntensity: 0.85 },
    },
    bookCover: { color: '#7A3E2B', roughness: 0.7 },
    bookPages: { color: '#F6EBD8', roughness: 1 },
    plants: { color: '#3F6B3A', roughness: 0.8 },
  },
  {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    description: 'Bright walls with a deep navy feature wall, steel-blue sofa and gold accents',
    swatch: ['#E9ECF1', '#14213D', '#D4A94F'],
    rug: {
      color: '#C9D1E0',
      border: '#D4A94F',
    },
    lightColor: '#FFF4DA',
    palette: {
      'White paint': { color: '#E9ECF1', roughness: 0.9 },
      'Statuario': { color: '#F1F1F3', roughness: 0.12 },
      'Nero': { color: '#E9ECF1', roughness: 0.9 },
      'white fabric': { color: '#2F4468', roughness: 0.95 },
      'teal fabric': { color: '#D4A94F', roughness: 0.9 },
      'wood': { color: '#5A4636', roughness: 0.45 },
      'curtain': { color: '#8C9BB5', roughness: 1 },
      'glass clear': { color: '#D6E2F0', roughness: 0.02, opacity: 0.14 },
      'grass': { color: '#4F6F46', roughness: 1 },
      'steel': { color: '#CBB26A', roughness: 0.28, metalness: 1 },
      'bronze': { color: '#D4A94F', roughness: 0.25, metalness: 0.95 },
      'Material #30': { color: '#000000', emissive: '#FFF4DA', emissiveIntensity: 2 },
      'fire': { color: '#0A0A0A', roughness: 0.3 },
      'eclate': { color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: 0.5 },
      'tv': { color: '#0A0A0A', roughness: 0.3 },
      'netflux': { color: '#000000', emissive: '#101C33', emissiveIntensity: 0.85 },
    },
    bookCover: { color: '#14213D', roughness: 0.7 },
    bookPages: { color: '#FFFFFF', roughness: 1 },
    plants: { color: '#2A4A3A', roughness: 0.8 },
  },
  {
    id: 'emerald-deco',
    name: 'Emerald Deco',
    description: 'Deep green feature wall, emerald sofa and gold metal for a bold art-deco look',
    swatch: ['#EDE8DC', '#0F2A24', '#D4AF37'],
    rug: {
      color: '#DCD3BE',
      border: '#1F5E4B',
    },
    lightColor: '#FFEFC2',
    palette: {
      'White paint': { color: '#EDE8DC', roughness: 0.9 },
      'Statuario': { color: '#F2EFE8', roughness: 0.12 },
      'Nero': { color: '#EDE8DC', roughness: 0.9 },
      'white fabric': { color: '#1F5E4B', roughness: 0.95 },
      'teal fabric': { color: '#D9B45F', roughness: 0.9 },
      'wood': { color: '#4A3224', roughness: 0.45 },
      'curtain': { color: '#B9C7B0', roughness: 1 },
      'glass clear': { color: '#D3E4DC', roughness: 0.02, opacity: 0.14 },
      'grass': { color: '#3F6B3A', roughness: 1 },
      'steel': { color: '#D4AF37', roughness: 0.25, metalness: 1 },
      'bronze': { color: '#C79A2E', roughness: 0.25, metalness: 0.95 },
      'Material #30': { color: '#000000', emissive: '#FFEFC2', emissiveIntensity: 2 },
      'fire': { color: '#0A0A0A', roughness: 0.3 },
      'eclate': { color: '#FFF1CC', emissive: '#FFF1CC', emissiveIntensity: 0.5 },
      'tv': { color: '#0A0A0A', roughness: 0.3 },
      'netflux': { color: '#000000', emissive: '#12261F', emissiveIntensity: 0.85 },
    },
    bookCover: { color: '#1F5E4B', roughness: 0.7 },
    bookPages: { color: '#F3EBD6', roughness: 1 },
    plants: { color: '#1F5E3A', roughness: 0.8 },
  },
];

/**
 * Traverses an Object3D and applies a RoomTheme's palette to all meshes,
 * following the exact logic requested by the user.
 */
export function applyThemeToScene(scene: THREE.Object3D, theme: RoomTheme): void {
  const palette = theme.palette;
  const wallPaintStyle = palette['White paint'] || { color: '#F2EEE8', roughness: 0.9 };

  scene.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    const mesh = o as THREE.Mesh;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    mats.forEach((m) => {
      if (!m) return;
      const matName = m.name || '';

      let p = palette[matName];

      // TV frame style: always fixed to '#0A0A0A', roughness 0.3
      if (matName === 'tv') {
        p = FIXED_TV_STYLE;
      }

      // TV screen material: skip netflux because video texture is mounted here!
      if (matName === 'netflux') {
        return;
      }

      // TV background pillar (Nero meshes: Box001, Box002, Box004, Box005) matches wall theme
      if (matName === 'Nero') {
        p = palette['Nero'] || wallPaintStyle;
      }

      // Below TV fireplace slot (Box008: material 'fire') matches the TV color with no emissive
      if (matName === 'fire') {
        p = palette['fire'] || FIXED_TV_STYLE;
      }

      if (!p && /^книга/.test(matName)) {
        // Extract book index: 'книга' -> 0, 'книга.001' -> 1, etc. to give books in the shelf distinct colors
        const numMatch = matName.match(/\.(\d+)/);
        const bookIdx = numMatch ? parseInt(numMatch[1], 10) : 0;
        const colors = theme.bookCovers && theme.bookCovers.length > 0
          ? theme.bookCovers
          : DEFAULT_BOOK_COLORS;
        const bookColor = colors[bookIdx % colors.length];
        p = { color: bookColor, roughness: theme.bookCover?.roughness ?? 0.7 };
      }
      if (!p && /^страницы/.test(matName)) p = theme.bookPages;
      if (!p && /^(leaf|pink|3$)/.test(matName)) p = theme.plants;
      if (!p) return;

      // Color
      if (p.color && (m as any).color) {
        (m as any).color.set(p.color);
      }

      // Roughness
      if (p.roughness !== undefined && (m as any).roughness !== undefined) {
        (m as any).roughness = p.roughness;
      }

      // Metalness
      if (p.metalness !== undefined && (m as any).metalness !== undefined) {
        (m as any).metalness = p.metalness;
      }

      // Emissive - if style defines emissive, apply it; otherwise reset to black & 0 intensity
      if ((m as any).emissive) {
        if (p.emissive) {
          (m as any).emissive.set(p.emissive);
          (m as any).emissiveIntensity = p.emissiveIntensity ?? 1;
        } else {
          (m as any).emissive.set('#000000');
          (m as any).emissiveIntensity = 0;
        }
      }

      // Opacity / Transparency
      if (p.opacity !== undefined) {
        m.transparent = true;
        m.opacity = p.opacity;
        m.depthWrite = false;
      }

      m.needsUpdate = true;
    });
  });
}
