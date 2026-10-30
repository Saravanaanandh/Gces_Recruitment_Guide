import React, { useState, useCallback } from 'react';
import FlipbookLoader from './components/Flipbook/FlipbookLoader';
import FlipbookViewer from './components/Flipbook/FlipbookViewer';
import FlipbookControls from './components/Flipbook/FlipbookControls';
import FlipbookThumbnails from './components/Flipbook/FlipbookThumbnails';
import SceneCanvas from './components/ThreeScene/SceneCanvas';
import ThemeSwitcher from './components/ThemeSwitcher/ThemeSwitcher';
import { useFlipbook } from './hooks/useFlipbook';

type ViewMode = 'cinematic' | 'reading';

const App: React.FC = () => {
  const [state, actions] = useFlipbook();
  const [viewMode, setViewMode] = useState<ViewMode>('cinematic');
  const [intensifyTrigger, setIntensifyTrigger] = useState(0);
  const [pageTurnTrigger, setPageTurnTrigger] = useState(0);

  // Room Theme state (defaults to 'warm-nordic')
  const [roomTheme, setRoomTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('brochure_room_theme') || 'warm-nordic';
    } catch {
      return 'warm-nordic';
    }
  });

  const handleSelectTheme = useCallback((themeId: string) => {
    setRoomTheme(themeId);
    try {
      localStorage.setItem('brochure_room_theme', themeId);
    } catch {
      // ignore
    }
  }, []);

  const {
    status,
    pageImages,
    totalPages,
    currentPage,
    renderedCount,
    errorMessage,
    aspectRatio,
    zoom,
    isFullscreen,
    toastMessage,
    soundEnabled,
    autoPlay,
    thumbnailsOpen,
    isMobile,
  } = state;

  const {
    flipNext,
    flipPrev,
    goToFirstPage,
    goToLastPage,
    goToPage,
    handlePageChange: originalHandlePageChange,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    toggleFullscreen,
    toggleSound,
    toggleAutoPlay,
    toggleThumbnails,
    showToast,
    flipbookRef,
  } = actions;

  // Wrap handlePageChange to also trigger page-turn effects
  const handlePageChange = useCallback(
    (page: number) => {
      originalHandlePageChange(page);
      setPageTurnTrigger((prev) => prev + 1);
    },
    [originalHandlePageChange]
  );

  // Handle clicking the 3D book → transition to reading mode
  const handleClickBook = useCallback(() => {
    setIntensifyTrigger((prev) => prev + 1);
    // Delay the mode switch slightly so the camera animation starts first
    setTimeout(() => {
      setViewMode('reading');
    }, 300);
  }, []);

  // Handle returning to cinematic mode
  const handleBackTo3D = useCallback(() => {
    setViewMode('cinematic');
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    } else {
      showToast('Brochure ready to share');
    }
  };

  // ── Error state ───────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#18191c]">
        <div className="text-center space-y-4 p-8 max-w-md bg-[#22242a] rounded-xl border border-white/10 shadow-2xl">
          <div className="text-5xl mb-4">📄</div>
          <h1 className="text-xl font-semibold text-white">Failed to load brochure</h1>
          <p className="text-sm text-gray-400">
            {errorMessage || 'An unexpected error occurred.'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Make sure <code className="text-indigo-400">public/brochure.pdf</code> exists.
          </p>
          <button
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors shadow-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (status === 'loading' || status === 'rendering' || status === 'idle') {
    return (
      <FlipbookLoader
        renderedCount={renderedCount}
        totalPages={totalPages}
        status={status}
      />
    );
  }

  // ── Ready state ───────────────────────────────────────────────────────────
  return (
    <div className="app-layout three-mode">
      {/* 3D Scene Canvas (always rendered as background) */}
      <SceneCanvas
        mode={viewMode}
        onClickBook={handleClickBook}
        intensifyTrigger={intensifyTrigger}
        pageTurnTrigger={pageTurnTrigger}
        themeId={roomTheme}
      />

      {/* ── Top Left Title Bar / Brand Logo ──────────────────────── */}
      <div className="webpage-title-bar">
        <img src="/logo.jfif" alt="Logo" className="title-bar-logo" />
        <div className="title-bar-text">
          <span className="title-bar-name">GCES - CSE</span>
          <span className="title-bar-tagline">Recruitment Guide</span>
        </div>
      </div>

      {/* Room Color Theme Switcher Option */}
      <ThemeSwitcher
        currentThemeId={roomTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Toast notification banner */}
      {toastMessage && (
        <div className="toast-notification" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}

      {/* ── Cinematic Mode: Guidance prompt ───────────────────────── */}
      {viewMode === 'cinematic' && (
        <div className="cinematic-overlay">
          <div className="cinematic-prompt">
            <span className="cinematic-prompt-text">Click the brochure on the table to open</span>
            <span className="cinematic-prompt-hint">Drag to orbit all angles • Right-click or 2-finger drag to pan • Scroll to zoom</span>
          </div>
        </div>
      )}

      {/* ── Reading Mode: Flipbook overlay on 3D canvas ───────────── */}
      {viewMode === 'reading' && (
        <div className="reading-overlay">
          {/* Explore Dev Room button */}
          <button
            className="back-to-3d-btn"
            onClick={handleBackTo3D}
            title="Explore Environment"
            aria-label="Explore Environment"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Explore Environment</span>
          </button>

          {/* Thumbnails Drawer */}
          <FlipbookThumbnails
            isOpen={thumbnailsOpen}
            onClose={toggleThumbnails}
            pageImages={pageImages}
            totalPages={totalPages}
            currentPage={currentPage}
            onSelectPage={goToPage}
          />

          {/* Flipbook Center Area */}
          <FlipbookViewer
            pageImages={pageImages}
            totalPages={totalPages}
            currentPage={currentPage}
            aspectRatio={aspectRatio}
            zoom={zoom}
            onPageChange={handlePageChange}
            onFlipPrev={flipPrev}
            onFlipNext={flipNext}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            onSetZoom={setZoom}
            flipbookRef={flipbookRef}
          />

          {/* Bottom Controls Bar */}
          <FlipbookControls
            currentPage={currentPage}
            totalPages={totalPages}
            zoom={zoom}
            isFullscreen={isFullscreen}
            soundEnabled={soundEnabled}
            autoPlay={autoPlay}
            isMobile={isMobile}
            onFlipPrev={flipPrev}
            onFlipNext={flipNext}
            onGoToFirstPage={goToFirstPage}
            onGoToLastPage={goToLastPage}
            onGoToPage={goToPage}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            onToggleFullscreen={toggleFullscreen}
            onToggleSound={toggleSound}
            onToggleAutoPlay={toggleAutoPlay}
            onToggleThumbnails={toggleThumbnails}
            onShare={handleShare}
          />
        </div>
      )}
    </div>
  );
};

export default App;
