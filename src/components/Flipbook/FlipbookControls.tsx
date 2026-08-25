import React, { useState, useEffect } from 'react';

// ── Icons matching the video ───────────────────────────────────────────────

const FirstPageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="11 19 4 12 11 5" />
    <polyline points="18 19 11 12 18 5" />
  </svg>
);

const LastPageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 5 20 12 13 19" />
    <polyline points="6 5 13 12 6 19" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const SoundOnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const SoundOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const ZoomInIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const FullscreenIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const FullscreenExitIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 3 3 3 3 8" />
    <polyline points="21 8 21 3 16 3" />
    <polyline points="3 16 3 21 8 21" />
    <polyline points="16 21 21 21 21 16" />
    <line x1="3" y1="21" x2="9" y2="15" />
    <line x1="21" y1="3" x2="15" y2="9" />
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────

interface FlipbookControlsProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  isFullscreen: boolean;
  soundEnabled: boolean;
  autoPlay: boolean;
  isMobile?: boolean;
  onFlipPrev: () => void;
  onFlipNext: () => void;
  onGoToFirstPage: () => void;
  onGoToLastPage: () => void;
  onGoToPage: (pageNum: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom?: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onToggleAutoPlay: () => void;
  onToggleThumbnails: () => void;
  onShare: () => void;
}

const FlipbookControls: React.FC<FlipbookControlsProps> = ({
  currentPage,
  totalPages,
  zoom,
  isFullscreen,
  soundEnabled,
  autoPlay,
  isMobile = false,
  onFlipPrev,
  onFlipNext,
  onGoToFirstPage,
  onGoToLastPage,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  onToggleSound,
  onToggleAutoPlay,
  onToggleThumbnails,
  onShare,
}) => {
  // Compute display spread label matching video format on desktop, single page on mobile
  let pageDisplay = '1';
  if (isMobile) {
    pageDisplay = `${currentPage + 1}/${totalPages}`;
  } else {
    if (currentPage === 0) {
      pageDisplay = `1-2/${totalPages}`;
    } else if (currentPage % 2 !== 0) {
      const p1 = currentPage + 1;
      const p2 = Math.min(p1 + 1, totalPages);
      pageDisplay = `${p1}-${p2}/${totalPages}`;
    } else {
      const p1 = currentPage;
      const p2 = Math.min(p1 + 1, totalPages);
      pageDisplay = `${p1}-${p2}/${totalPages}`;
    }
  }

  const [inputVal, setInputVal] = useState(pageDisplay);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputVal(pageDisplay);
    }
  }, [pageDisplay, isEditing]);

  const handleInputSubmit = () => {
    setIsEditing(false);
    // Parse input (can be "14" or "13-14" or "14/58")
    const match = inputVal.match(/\d+/);
    if (match) {
      const target = parseInt(match[0], 10);
      if (target >= 1 && target <= totalPages) {
        onGoToPage(target - 1);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputVal(pageDisplay);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/brochure.pdf';
    link.download = 'Common_Placement_Brochure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <footer className="flipbook-bottombar" role="toolbar" aria-label="Viewer controls">
      {/* Left controls group */}
      <div className="bottombar-group bottombar-left">
        <button
          type="button"
          className="bar-icon-btn"
          onClick={onToggleThumbnails}
          title="Thumbnails"
          aria-label="Toggle page thumbnails"
        >
          <GridIcon />
        </button>

        <button
          type="button"
          className="bar-icon-btn"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute page sound' : 'Enable page sound'}
          aria-label={soundEnabled ? 'Mute audio' : 'Enable audio'}
        >
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>

        <button
          type="button"
          className="bar-icon-btn"
          onClick={onToggleAutoPlay}
          title={autoPlay ? 'Pause Auto Flip' : 'Auto Flip'}
          aria-label={autoPlay ? 'Pause auto flip' : 'Start auto flip'}
        >
          {autoPlay ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      {/* Center navigation group */}
      <div className="bottombar-group bottombar-center">
        <button
          type="button"
          className="bar-nav-arrow-btn"
          onClick={onGoToFirstPage}
          title="First Page"
          aria-label="Go to first page"
        >
          <FirstPageIcon />
        </button>

        <button
          type="button"
          className="bar-nav-arrow-btn"
          onClick={onFlipPrev}
          title="Previous Page (←)"
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </button>

        {/* Interactive Page Input Box */}
        <div className="bar-page-box">
          <input
            type="text"
            className="bar-page-input"
            value={inputVal}
            onFocus={() => setIsEditing(true)}
            onBlur={handleInputSubmit}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            title="Type a page number and press Enter"
            aria-label="Current page and total pages"
          />
        </div>

        <button
          type="button"
          className="bar-nav-arrow-btn"
          onClick={onFlipNext}
          title="Next Page (→)"
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </button>

        <button
          type="button"
          className="bar-nav-arrow-btn"
          onClick={onGoToLastPage}
          title="Last Page"
          aria-label="Go to last page"
        >
          <LastPageIcon />
        </button>
      </div>

      {/* Right controls group (Zoom + Share + Download + Fullscreen) */}
      <div className="bottombar-group bottombar-right">
        {/* Zoom In / Out / Reset Controls */}
        <div className="bar-zoom-group">
          <button
            type="button"
            className="bar-icon-btn"
            onClick={onZoomOut}
            title="Zoom Out (-)"
            aria-label="Zoom out"
          >
            <ZoomOutIcon />
          </button>

          <button
            type="button"
            className="bar-zoom-label-btn"
            onClick={onResetZoom}
            title="Reset Zoom (100%)"
            aria-label="Reset zoom"
          >
            {zoomPercent}%
          </button>

          <button
            type="button"
            className="bar-icon-btn"
            onClick={onZoomIn}
            title="Zoom In (+)"
            aria-label="Zoom in"
          >
            <ZoomInIcon />
          </button>
        </div>

        <button
          type="button"
          className="bar-icon-btn"
          onClick={onShare}
          title="Share Link"
          aria-label="Share brochure"
        >
          <ShareIcon />
        </button>

        <button
          type="button"
          className="bar-icon-btn"
          onClick={handleDownload}
          title="Download PDF"
          aria-label="Download brochure PDF"
        >
          <DownloadIcon />
        </button>

        <button
          type="button"
          className="bar-icon-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </button>
      </div>
    </footer>
  );
};

export default FlipbookControls;
