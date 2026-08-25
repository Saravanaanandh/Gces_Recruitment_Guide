import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import {
  loadPdfDocument,
  renderAllA3SpreadsAsA4,
  getA4AspectRatioFromA3,
} from '../lib/pdf/pdfRenderer';
import { playNextPageSound, playPrevPageSound } from '../lib/sound/paperSound';

export type FlipbookStatus = 'idle' | 'loading' | 'rendering' | 'ready' | 'error';

export interface FlipbookState {
  status: FlipbookStatus;
  pageImages: string[];
  totalPages: number;
  currentPage: number;
  renderedCount: number;
  errorMessage: string | null;
  aspectRatio: number;
  zoom: number;
  isFullscreen: boolean;
  toastMessage: string | null;
  soundEnabled: boolean;
  autoPlay: boolean;
  thumbnailsOpen: boolean;
  searchQuery: string;
  isMobile: boolean;
}

export interface FlipbookActions {
  flipNext: () => void;
  flipPrev: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToPage: (page: number) => void;
  handlePageChange: (newPage: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (zoom: number) => void;
  toggleFullscreen: () => void;
  toggleSound: () => void;
  toggleAutoPlay: () => void;
  toggleThumbnails: () => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  showToast: (msg: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flipbookRef: RefObject<any>;
}

const PDF_URL = '/brochure.pdf';
const FRONT_COVER_URL = '/front_cover.png';
const BACK_COVER_URL = '/back_cover.png';
const COVER_PAGE_URL = '/cover_page.png';
const ZOOM_LEVELS = [0.8, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
const DEFAULT_ZOOM_INDEX = 1;

/**
 * Load an image URL and return it as a JPEG data URL, fitting A4 proportions.
 */
async function loadImageAsDataUrl(
  url: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        reject(new Error(`Could not get 2D context for image: ${url}`));
        return;
      }
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Scale to fill while maintaining aspect ratio (cover fit)
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = targetWidth / targetHeight;

      let drawW: number, drawH: number, drawX: number, drawY: number;

      if (imgAspect > canvasAspect) {
        // Image is wider → fit by height, center horizontally
        drawH = targetHeight;
        drawW = targetHeight * imgAspect;
        drawX = (targetWidth - drawW) / 2;
        drawY = 0;
      } else {
        // Image is taller → fit by width, center vertically
        drawW = targetWidth;
        drawH = targetWidth / imgAspect;
        drawX = 0;
        drawY = (targetHeight - drawH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Create a pure blank white A4 page as a data URL.
 */
function createBlankPageDataUrl(
  targetWidth: number,
  targetHeight: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return '';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Create a clean A4 page with only centered "Thank You" in bold italic typography.
 */
function createThankYouPageDataUrl(
  targetWidth: number,
  targetHeight: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return '';

  // Clean white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Centered bold italic Thank You
  const fontSize = Math.round(targetWidth * 0.085);
  ctx.font = `italic bold ${fontSize}px "Playfair Display", "Cinzel", "Georgia", "Inter", sans-serif`;
  ctx.fillStyle = '#1e293b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Thank You', targetWidth / 2, targetHeight / 2);

  return canvas.toDataURL('image/jpeg', 0.95);
}

export function useFlipbook(): [FlipbookState, FlipbookActions] {
  const [status, setStatus] = useState<FlipbookStatus>('idle');
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [renderedCount, setRenderedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState(0.707); // A4 default
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipbookRef = useRef<any>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const prevPageRef = useRef(0);
  const allPagesRef = useRef<{ desktop: string[]; mobile: string[] } | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  }, []);

  // ── Responsive Page Layout Switcher ───────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const isMob = window.innerWidth < 640;
      setIsMobile(isMob);
      if (allPagesRef.current) {
        const targetPages = isMob ? allPagesRef.current.mobile : allPagesRef.current.desktop;
        setPageImages((prev) => {
          if (prev.length !== targetPages.length) {
            setTotalPages(targetPages.length);
            setCurrentPage((curr) => Math.min(curr, targetPages.length - 1));
            return targetPages;
          }
          return prev;
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── PDF Loading, A3→A4 Splitting, & Cover Insertion ────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus('loading');

        const pdf = await loadPdfDocument(PDF_URL);
        if (cancelled) return;

        // Get A4 aspect ratio from the A3 page dimensions
        const ratio = await getA4AspectRatioFromA3(pdf);
        if (cancelled) return;
        setAspectRatio(ratio);

        setStatus('rendering');

        // ── Step 1: Render all A3 spreads as individual A4 pages ──
        // Each A3 spread → LEFT half, then RIGHT half
        // Result: [spread1Left, spread1Right, spread2Left, spread2Right, ...]
        const a4Images = await renderAllA3SpreadsAsA4(pdf, 1.5, (rendered, totalA4) => {
          if (cancelled) return;
          setRenderedCount(rendered);
        });

        if (cancelled) return;

        // ── Step 2: Determine pixel dimensions matching rendered A4 pages ──
        const page1 = await pdf.getPage(1);
        const vp = page1.getViewport({ scale: 1.5 });
        page1.cleanup();

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const a4PixelWidth = Math.floor((vp.width / 2) * dpr);
        const a4PixelHeight = Math.floor(vp.height * dpr);

        // ── Step 3: Load & generate cover and special pages ──
        const frontCoverDataUrl = await loadImageAsDataUrl(FRONT_COVER_URL, a4PixelWidth, a4PixelHeight);
        if (cancelled) return;

        const blankPageDataUrl = createBlankPageDataUrl(a4PixelWidth, a4PixelHeight);
        const coverPageDataUrl = await loadImageAsDataUrl(COVER_PAGE_URL, a4PixelWidth, a4PixelHeight);
        if (cancelled) return;

        const thankYouDataUrl = createThankYouPageDataUrl(a4PixelWidth, a4PixelHeight);
        const backCoverDataUrl = await loadImageAsDataUrl(BACK_COVER_URL, a4PixelWidth, a4PixelHeight);
        if (cancelled) return;

        // ── Step 4: Assemble separate Desktop vs Mobile page orders ──
        //
        // Desktop (2-page spread book):
        // 1. Outside Front Cover
        // 2. Inside Front Cover back (Blank)
        // 3. Cover page (cover_page.png)
        // 4. ... Interior PDF Pages
        // 5. Last interior spread: Thank You
        // 6. Inside Back Cover (Blank)
        // 7. Outside Back Cover
        //
        const desktopPages: string[] = [
          frontCoverDataUrl,
          blankPageDataUrl,
          coverPageDataUrl,
          ...a4Images,
          thankYouDataUrl,
          blankPageDataUrl,
          backCoverDataUrl,
        ];

        // Mobile (Single page mode - NO filler blank pages):
        // 1. Outside Front Cover
        // 2. Cover page (cover_page.png directly after Front Cover)
        // 3. ... Interior PDF Pages
        // 4. Thank You
        // 5. Outside Back Cover (directly after Thank You)
        //
        const mobilePages: string[] = [
          frontCoverDataUrl,
          coverPageDataUrl,
          ...a4Images,
          thankYouDataUrl,
          backCoverDataUrl,
        ];

        allPagesRef.current = { desktop: desktopPages, mobile: mobilePages };

        if (cancelled) return;

        const isMob = window.innerWidth < 640;
        setIsMobile(isMob);
        const initialPages = isMob ? mobilePages : desktopPages;

        setPageImages(initialPages);
        setTotalPages(initialPages.length);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        console.error('PDF load error:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load PDF');
        setStatus('error');
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fullscreen API ─────────────────────────────────────────────────────────

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  // ── Navigation (Sounds are centralized in handlePageChange) ────────────────

  const flipNext = useCallback(() => {
    if (currentPage >= totalPages - 1) {
      showToast('This is the last page.');
      return;
    }
    flipbookRef.current?.pageFlip()?.flipNext();
  }, [currentPage, totalPages, showToast]);

  const flipPrev = useCallback(() => {
    if (currentPage <= 0) {
      showToast('This is the first page.');
      return;
    }
    flipbookRef.current?.pageFlip()?.flipPrev();
  }, [currentPage, showToast]);

  const goToFirstPage = useCallback(() => {
    if (currentPage === 0) {
      showToast('This is the first page.');
      return;
    }
    flipbookRef.current?.pageFlip()?.flip(0);
  }, [currentPage, showToast]);

  const goToLastPage = useCallback(() => {
    const last = Math.max(0, totalPages - 1);
    if (currentPage >= last) {
      showToast('This is the last page.');
      return;
    }
    flipbookRef.current?.pageFlip()?.flip(last);
  }, [currentPage, totalPages, showToast]);

  const goToPage = useCallback((page: number) => {
    const target = Math.max(0, Math.min(page, totalPages - 1));
    flipbookRef.current?.pageFlip()?.flip(target);
  }, [totalPages]);

  // Centralized single source of truth for page change & audio playback
  const handlePageChange = useCallback((newPage: number) => {
    const oldPage = prevPageRef.current;
    if (soundEnabled && newPage !== oldPage) {
      if (newPage > oldPage) {
        playNextPageSound();
      } else if (newPage < oldPage) {
        playPrevPageSound();
      }
    }
    prevPageRef.current = newPage;
    setCurrentPage(newPage);
  }, [soundEnabled]);

  // ── Auto-play ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!autoPlay || status !== 'ready') return;

    const timer = window.setInterval(() => {
      if (currentPage >= totalPages - 1) {
        setAutoPlay(false);
        showToast('Reached the end of the brochure.');
      } else {
        flipbookRef.current?.pageFlip()?.flipNext();
      }
    }, 3500);

    return () => window.clearInterval(timer);
  }, [autoPlay, currentPage, totalPages, status, showToast]);

  // ── Keyboard Navigation ───────────────────────────────────────────────────

  useEffect(() => {
    if (status !== 'ready') return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          flipNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          flipPrev();
          break;
        case 'Home':
          e.preventDefault();
          goToFirstPage();
          break;
        case 'End':
          e.preventDefault();
          goToLastPage();
          break;
        case 'Escape':
          if (thumbnailsOpen) {
            setThumbnailsOpen(false);
          } else if (document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, flipNext, flipPrev, goToFirstPage, goToLastPage, thumbnailsOpen]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const zoomIn = useCallback(() => {
    setZoomIndex((prev) => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
  }, []);

  const setZoom = useCallback((targetZoom: number) => {
    // Find closest zoom level index
    let closestIdx = 0;
    let minDiff = Infinity;
    ZOOM_LEVELS.forEach((lvl, idx) => {
      const diff = Math.abs(lvl - targetZoom);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setZoomIndex(closestIdx);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => !prev);
  }, []);

  const toggleThumbnails = useCallback(() => {
    setThumbnailsOpen((prev) => !prev);
  }, []);

  const state: FlipbookState = {
    status,
    pageImages,
    totalPages,
    currentPage,
    renderedCount,
    errorMessage,
    aspectRatio,
    zoom: ZOOM_LEVELS[zoomIndex],
    isFullscreen,
    toastMessage,
    soundEnabled,
    autoPlay,
    thumbnailsOpen,
    searchQuery,
    isMobile,
  };

  const actions: FlipbookActions = {
    flipNext,
    flipPrev,
    goToFirstPage,
    goToLastPage,
    goToPage,
    handlePageChange,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    toggleFullscreen,
    toggleSound,
    toggleAutoPlay,
    toggleThumbnails,
    setSearchQuery,
    setCurrentPage,
    showToast,
    flipbookRef,
  };

  return [state, actions];
}
