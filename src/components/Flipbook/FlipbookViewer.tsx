import React, { useCallback, useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import PdfPage from './PdfPage';

interface FlipbookViewerProps {
  pageImages: string[];
  totalPages: number;
  currentPage: number;
  aspectRatio: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onFlipPrev: () => void;
  onFlipNext: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onSetZoom?: (zoom: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flipbookRef: React.RefObject<any>;
}

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

const FlipbookViewer: React.FC<FlipbookViewerProps> = ({
  pageImages,
  totalPages,
  currentPage,
  aspectRatio,
  zoom,
  onPageChange,
  onFlipPrev,
  onFlipNext,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSetZoom,
  flipbookRef,
}) => {
  const { width: winW, height: winH } = useWindowSize();
  const isMobile = winW < 640;
  const isTablet = winW >= 640 && winW < 1024;

  // ── Pan State when zoomed in ───────────────────────────────────────────────
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Reset pan when zoom returns to 1.0 (or below)
  useEffect(() => {
    if (zoom <= 1.0) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoom]);

  // ── Compute optimal book dimensions ────────────────────────────────────────
  const computeDimensions = useCallback(() => {
    const availH = winH - 120;
    const availW = winW - 140; // Room for side floating arrows

    if (isMobile) {
      // Single page mode on mobile
      const baseW = Math.min(availW, availH * aspectRatio);
      const baseH = baseW / aspectRatio;
      return {
        pageW: Math.floor(baseW * (zoom > 1.0 ? 1 : zoom)),
        pageH: Math.floor(baseH * (zoom > 1.0 ? 1 : zoom)),
        isSinglePage: true,
      };
    }

    // Desktop / tablet: two-page spread
    const bookAspect = aspectRatio * 2;
    const pageH_fromW = availW / bookAspect;
    const pageH_fromH = availH;

    const pageH = Math.min(pageH_fromW, pageH_fromH);
    const pageW = pageH * aspectRatio;

    const finalW = Math.floor(pageW * (zoom > 1.0 ? 1 : zoom));
    const finalH = Math.floor(pageH * (zoom > 1.0 ? 1 : zoom));

    return {
      pageW: Math.max(200, finalW),
      pageH: Math.max(300, finalH),
      isSinglePage: isTablet && winW < 800,
    };
  }, [winW, winH, aspectRatio, zoom, isMobile, isTablet]);

  const { pageW, pageH, isSinglePage } = computeDimensions();

  // ── Flip events ──────────────────────────────────────────────────────────
  const handleFlip = useCallback(
    (e: { data: number }) => {
      onPageChange(e.data);
    },
    [onPageChange]
  );

  // ── Helper to style the backside of a turning page ────────────────────────
  const applyBacksideBlankToElement = useCallback((el: HTMLElement) => {
    if (!el) return;
    el.classList.add('page-backside-blank');
    el.setAttribute('data-backside', 'true');
    el.style.setProperty('background', 'rgba(255, 255, 255, 0.6)', 'important');
    el.style.setProperty('background-color', 'rgba(255, 255, 255, 0.6)', 'important');
    el.style.setProperty('backdrop-filter', 'blur(4px)', 'important');
    el.style.setProperty('-webkit-backdrop-filter', 'blur(4px)', 'important');

    const innerPage = el.classList.contains('page') ? el : el.querySelector('.page');
    if (innerPage instanceof HTMLElement) {
      innerPage.classList.add('page-backside-blank');
      innerPage.setAttribute('data-backside', 'true');
      innerPage.style.setProperty('background', 'rgba(255, 255, 255, 0.6)', 'important');
      innerPage.style.setProperty('background-color', 'rgba(255, 255, 255, 0.6)', 'important');
      innerPage.style.setProperty('backdrop-filter', 'blur(4px)', 'important');
      innerPage.style.setProperty('-webkit-backdrop-filter', 'blur(4px)', 'important');
    }

    const imgs = el.querySelectorAll('img');
    imgs.forEach((img) => {
      img.style.setProperty('display', 'none', 'important');
      img.style.setProperty('opacity', '0', 'important');
      img.style.setProperty('visibility', 'hidden', 'important');
    });

    const spineShadows = el.querySelectorAll('.page-spine-shadow, .spine-crease-backing');
    spineShadows.forEach((sh) => {
      (sh as HTMLElement).style.setProperty('display', 'none', 'important');
    });
  }, []);

  // ── Monkey-patch page-flip: Center-edge grab + White 0.6 opacity backside ──
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pf = (flipbookRef as any).current?.pageFlip?.();
    if (!pf) return;

    try {
      const flipCtrl = pf.getFlipController();
      const render = pf.getRender();
      if (!flipCtrl || !render) return;

      // ─── Patch 1: Allow grabbing from anywhere along left/right edge ───
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flipCtrl.isPointOnCorners = function (this: any, globalPos: any): boolean {
        const rect = this.getBoundsRect();
        const bookPos = render.convertToBook(globalPos);
        const edgeDist =
          Math.sqrt(Math.pow(rect.pageWidth, 2) + Math.pow(rect.height, 2)) / 5;
        return (
          bookPos.x > 0 &&
          bookPos.y > 0 &&
          bookPos.x < rect.width &&
          bookPos.y < rect.height &&
          (bookPos.x < edgeDist || bookPos.x > rect.width - edgeDist)
        );
      };

      // ─── Patch 2: Center fold geometry on actual grab Y position ───
      const origStart = flipCtrl.start;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flipCtrl.start = function (this: any, globalPos: any): boolean {
        const result = origStart.call(this, globalPos);
        if (result && this.calc) {
          const bookPos = render.convertToBook(globalPos);
          const rect = this.getBoundsRect();
          const grabYRatio = Math.max(0.02, Math.min(0.98, bookPos.y / rect.height));

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.calc.getPageRect = function (this: any, localPos: any) {
            const yOffset = -this.pageHeight * grabYRatio;
            return this.getRectFromBasePoint(
              [
                { x: 0, y: yOffset },
                { x: this.pageWidth, y: yOffset },
                { x: 0, y: yOffset + this.pageHeight },
                { x: this.pageWidth, y: yOffset + this.pageHeight },
              ],
              localPos
            );
          };
        }
        return result;
      };

      // ─── Patch 3: White 0.6 Opacity Backside on every frame & turn ───
      // Hook 3a: Intercept flipCtrl.do (called during mouse/touch drag)
      const origDo = flipCtrl.do.bind(flipCtrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flipCtrl.do = function (pos: any) {
        origDo(pos);
        if (render.getOrientation() === 'portrait' || isSinglePage) {
          if (flipCtrl.flippingPage?.getElement) {
            applyBacksideBlankToElement(flipCtrl.flippingPage.getElement());
          }
        }
      };

      // Hook 3b: Intercept render.drawFrame (called on every animation frame)
      const origDrawFrame = render.drawFrame.bind(render);
      render.drawFrame = function () {
        origDrawFrame();
        if (render.getOrientation() === 'portrait' || isSinglePage) {
          if (render.flippingPage?.getElement) {
            applyBacksideBlankToElement(render.flippingPage.getElement());
          }
        }
      };

      // Hook 3c: MutationObserver for dynamically added cloned elements
      const blockEl = pf.getUI()?.getDistElement?.();
      let observer: MutationObserver | null = null;
      if (blockEl) {
        observer = new MutationObserver((mutations) => {
          mutations.forEach((m) => {
            m.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement && (node.classList.contains('stf__item') || node.classList.contains('page'))) {
                if (!node.classList.contains('--simple')) {
                  applyBacksideBlankToElement(node);
                }
              }
            });
          });
        });
        observer.observe(blockEl, { childList: true, subtree: true });
      }

      return () => {
        if (observer) observer.disconnect();
      };
    } catch (e) {
      console.warn('Could not patch page-flip behavior:', e);
    }
  }, [pageImages, flipbookRef, isSinglePage, applyBacksideBlankToElement]);

  // ── Pan / Drag Handlers when Zoomed In ──────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1.0) return;
    // Prevent default drag behaviors so pan is buttery smooth
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      startPanRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoom <= 1.0) return;
    const dx = e.clientX - startPanRef.current.mouseX;
    const dy = e.clientY - startPanRef.current.mouseY;

    // Limit maximum pan range according to zoom factor
    const totalW = pageW * (isSinglePage ? 1 : 2) * zoom;
    const totalH = pageH * zoom;
    const maxPanX = Math.max(0, (totalW - winW) / 2 + 120);
    const maxPanY = Math.max(0, (totalH - winH) / 2 + 120);

    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, startPanRef.current.panX + dx)),
      y: Math.max(-maxPanY, Math.min(maxPanY, startPanRef.current.panY + dy)),
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // ── Touch Gestures (Pinch to zoom + 1-finger pan + double tap) ────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture start
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      lastTouchDistanceRef.current = dist;
    } else if (e.touches.length === 1) {
      // Check for double tap
      const now = Date.now();
      if (now - lastTapTimeRef.current < 300) {
        // Double tap toggles zoom
        if (zoom > 1.0) {
          onResetZoom?.();
        } else {
          onSetZoom ? onSetZoom(1.75) : onZoomIn?.();
        }
      }
      lastTapTimeRef.current = now;

      if (zoom > 1.0) {
        setIsPanning(true);
        startPanRef.current = {
          mouseX: e.touches[0].clientX,
          mouseY: e.touches[0].clientY,
          panX: pan.x,
          panY: pan.y,
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      // Pinching
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const delta = dist - lastTouchDistanceRef.current;

      if (Math.abs(delta) > 15) {
        if (delta > 0) {
          onZoomIn?.();
        } else {
          onZoomOut?.();
        }
        lastTouchDistanceRef.current = dist;
      }
    } else if (e.touches.length === 1 && isPanning && zoom > 1.0) {
      // 1-finger pan
      const dx = e.touches[0].clientX - startPanRef.current.mouseX;
      const dy = e.touches[0].clientY - startPanRef.current.mouseY;

      const totalW = pageW * (isSinglePage ? 1 : 2) * zoom;
      const totalH = pageH * zoom;
      const maxPanX = Math.max(0, (totalW - winW) / 2 + 120);
      const maxPanY = Math.max(0, (totalH - winH) / 2 + 120);

      setPan({
        x: Math.max(-maxPanX, Math.min(maxPanX, startPanRef.current.panX + dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, startPanRef.current.panY + dy)),
      });
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistanceRef.current = null;
    setIsPanning(false);
  };

  // ── Dynamic Center Alignment Calculation ──────────────────────────────────
  const isFrontCover = currentPage === 0;
  const isBackCover = totalPages > 1 && currentPage >= totalPages - 1;

  let baseTranslateX = 0;
  let badgeLeft = '50%';

  if (!isSinglePage) {
    if (isFrontCover) {
      baseTranslateX = -Math.floor(pageW / 2);
      badgeLeft = '75%'; // centered under the front cover
    } else if (isBackCover) {
      baseTranslateX = Math.floor(pageW / 2);
      badgeLeft = '25%'; // centered under the back cover
    } else {
      baseTranslateX = 0;
      badgeLeft = '50%'; // centered at center spine crease
    }
  } else {
    // Single page mode on mobile
    baseTranslateX = 0;
    badgeLeft = '50%';
  }

  // Combine desktop cover offset with interactive pan and zoom
  const combinedTransform = `translate(${baseTranslateX + pan.x}px, ${pan.y}px) scale(${zoom > 1.0 ? zoom : 1})`;

  // Compute red badge text: Single page number on mobile, spread on desktop
  let badgeText = '1';
  if (isSinglePage) {
    badgeText = `${currentPage + 1}`;
  } else {
    if (currentPage === 0) {
      badgeText = '1';
    } else if (isBackCover) {
      badgeText = `${totalPages}`;
    } else if (currentPage % 2 !== 0) {
      badgeText = `${currentPage + 1}  ${Math.min(currentPage + 2, totalPages)}`;
    } else {
      badgeText = `${currentPage}  ${Math.min(currentPage + 1, totalPages)}`;
    }
  }

  if (!pageImages.length || totalPages === 0) return null;

  return (
    <main
      className={`flipbook-container ${zoom > 1.0 ? (isPanning ? 'is-panning' : 'is-zoomed') : ''}`}
      role="region"
      aria-label="Interactive brochure flipbook"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Floating Side Navigation Arrows */}
      <button
        type="button"
        className="side-nav-arrow side-nav-left"
        onClick={onFlipPrev}
        title="Previous Page (←)"
        aria-label="Previous page"
      >
        <svg width="28" height="48" viewBox="0 0 24 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 10 6 24 18 38" />
        </svg>
      </button>

      <button
        type="button"
        className="side-nav-arrow side-nav-right"
        onClick={onFlipNext}
        title="Next Page (→)"
        aria-label="Next page"
      >
        <svg width="28" height="48" viewBox="0 0 24 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 10 18 24 6 38" />
        </svg>
      </button>

      {/* Book Stage with dynamic center translation, zoom scale, and pan */}
      <div
        className="flipbook-stage"
        style={{
          transform: combinedTransform,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* Dark gray spine backing behind the page connection (only when open on desktop) */}
        {!isSinglePage && !isFrontCover && !isBackCover && (
          <div
            className="spine-crease-backing"
            style={{ height: pageH }}
            aria-hidden="true"
          />
        )}

        {/* Center Red Page Number Badge */}
        <div
          className="book-center-badge"
          style={{
            left: badgeLeft,
            transition: 'left 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
          aria-hidden="true"
        >
          {badgeText}
        </div>

        <HTMLFlipBook
          ref={flipbookRef}
          width={pageW}
          height={pageH}
          // Rendering settings
          size="fixed"
          minWidth={100}
          maxWidth={pageW * 2}
          minHeight={100}
          maxHeight={pageH * 2}
          // Appearance
          showCover={!isSinglePage}
          drawShadow={true}
          flippingTime={750}
          // Interaction
          usePortrait={isSinglePage}
          startPage={0}
          autoSize={false}
          maxShadowOpacity={0.65}
          mobileScrollSupport={false}
          showPageCorners={true}
          disableFlipByClick={false}
          // Swipe (touch)
          swipeDistance={30}
          // Callbacks
          onFlip={handleFlip}
          // Required props
          className="flipbook"
          style={{}}
          startZIndex={0}
          clickEventForward={true}
          useMouseEvents={true}
        >
          {pageImages.map((imgUrl, idx) => (
            <PdfPage
              key={idx}
              imageUrl={imgUrl}
              pageNumber={idx + 1}
              isHard={!isSinglePage && (idx === 0 || idx === pageImages.length - 1)}
            />
          ))}
        </HTMLFlipBook>
      </div>
    </main>
  );
};

export default FlipbookViewer;
