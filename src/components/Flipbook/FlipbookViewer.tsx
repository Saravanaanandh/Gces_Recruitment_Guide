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
  flipbookRef,
}) => {
  const { width: winW, height: winH } = useWindowSize();

  // ── Compute optimal book dimensions ────────────────────────────────────────

  const isMobile = winW < 640;
  const isTablet = winW >= 640 && winW < 1024;

  const computeDimensions = useCallback(() => {
    const availH = winH - 120;
    const availW = winW - 140; // Room for side floating arrows

    if (isMobile) {
      // Single page mode on mobile
      const pageW = Math.min(availW, availH * aspectRatio);
      const pageH = pageW / aspectRatio;
      return {
        pageW: Math.floor(pageW * zoom),
        pageH: Math.floor(pageH * zoom),
        isSinglePage: true,
      };
    }

    // Desktop / tablet: two-page spread
    const bookAspect = aspectRatio * 2;
    const pageH_fromW = availW / bookAspect;
    const pageH_fromH = availH;

    const pageH = Math.min(pageH_fromW, pageH_fromH);
    const pageW = pageH * aspectRatio;

    // Apply zoom
    const zoomedW = Math.floor(pageW * zoom);
    const zoomedH = Math.floor(pageH * zoom);

    const finalW = Math.min(zoomedW, Math.floor(availW / 2));
    const finalH = Math.min(zoomedH, availH);

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

  // ── Monkey-patch page-flip for natural center-edge grab folding ──────────
  //
  // The page-flip library (class FlipCalculation) only supports TOP or BOTTOM
  // corner as the fold origin. When the user grabs the center of the page edge,
  // the library snaps to the nearest corner, producing an asymmetric fold.
  //
  // This patch intercepts the Flip controller's start() method and, after the
  // FlipCalculation is created, overrides its getPageRect() so the page rectangle
  // is centered on the actual grab Y position. This produces:
  //   • Top grab    → page extends mostly downward  (like original TOP corner)
  //   • Center grab → page extends equally above/below (balanced fold)
  //   • Bottom grab → page extends mostly upward    (like original BOTTOM corner)
  //
  // It also patches isPointOnCorners() to allow interaction from the full page
  // edge, not just the four corner zones.
  // ─────────────────────────────────────────────────────────────────────────────
  const patchAppliedRef = useRef(false);

  useEffect(() => {
    if (patchAppliedRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pf = (flipbookRef as any).current?.pageFlip?.();
    if (!pf) return;

    try {
      const flipCtrl = pf.getFlipController();
      const render = pf.getRender();
      if (!flipCtrl || !render) return;

      patchAppliedRef.current = true;

      // Save the original start method
      const origStart = flipCtrl.start;

      // ─── Patch 1: Allow grabbing from anywhere along the left/right edge ───
      // Original restricts to diagonal-corner zones.
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
          // Y-axis restriction removed — full edge is interactive
        );
      };

      // ─── Patch 2: Center the fold geometry on the actual grab Y position ───
      // After FlipCalculation is instantiated inside start(), we override its
      // getPageRect so the base-point rectangle is offset by -grabY, centering
      // the page on the grab position instead of anchoring it to a corner.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flipCtrl.start = function (this: any, globalPos: any): boolean {
        const result = origStart.call(this, globalPos);

        if (result && this.calc) {
          const bookPos = render.convertToBook(globalPos);
          const rect = this.getBoundsRect();
          // Clamp to [0.02, 0.98] to avoid degenerate geometry at extremes
          const grabYRatio = Math.max(0.02, Math.min(0.98, bookPos.y / rect.height));

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.calc.getPageRect = function (this: any, localPos: any) {
            // yOffset positions the page so that grabY% of its height is above
            // the grab point and (1 - grabY%) is below it.
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
    } catch (e) {
      console.warn('Could not patch page-flip fold behavior:', e);
    }
  }, [pageImages, flipbookRef]);

  // ── Dynamic Center Alignment Calculation ──────────────────────────────────
  // If book is not opened (Front Cover: page 0), shift left by pageW/2 to center the right-hand cover
  // If book is closed on last page (Back Cover: page >= totalPages - 1), shift right by pageW/2 to center the left-hand cover
  // When book is open (pages 2 to totalPages - 2), center the full double-page spread (translateX: 0)
  const isFrontCover = currentPage === 0;
  const isBackCover = totalPages > 1 && currentPage >= totalPages - 1;

  let stageTransform = 'translateX(0)';
  let badgeLeft = '50%';

  if (!isSinglePage) {
    if (isFrontCover) {
      stageTransform = `translateX(-${Math.floor(pageW / 2)}px)`;
      badgeLeft = '75%'; // centered under the front cover
    } else if (isBackCover) {
      stageTransform = `translateX(${Math.floor(pageW / 2)}px)`;
      badgeLeft = '25%'; // centered under the back cover
    } else {
      stageTransform = 'translateX(0)';
      badgeLeft = '50%'; // centered at center spine crease
    }
  }

  // Compute red badge text
  let badgeText = '1';
  if (currentPage === 0) {
    badgeText = '1';
  } else if (isBackCover) {
    badgeText = `${totalPages}`;
  } else if (currentPage % 2 !== 0) {
    badgeText = `${currentPage + 1}  ${Math.min(currentPage + 2, totalPages)}`;
  } else {
    badgeText = `${currentPage}  ${Math.min(currentPage + 1, totalPages)}`;
  }

  if (!pageImages.length || totalPages === 0) return null;

  return (
    <main className="flipbook-container" role="region" aria-label="Interactive brochure flipbook">
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

      {/* Book Stage with dynamic center translation */}
      <div
        className="flipbook-stage"
        style={{
          transform: stageTransform,
          transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* Dark gray spine backing behind the page connection (only when open) */}
        {!isFrontCover && !isBackCover && (
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
          showCover={true}
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
              isHard={idx === 0 || idx === pageImages.length - 1}
            />
          ))}
        </HTMLFlipBook>
      </div>
    </main>
  );
};

export default FlipbookViewer;
