import React from 'react';

interface PdfPageProps {
  imageUrl: string;
  pageNumber: number;
  isHard?: boolean;
}

/**
 * Individual page component for the flipbook.
 * MUST use forwardRef — react-pageflip requires it to attach internal refs.
 */
const PdfPage = React.forwardRef<HTMLDivElement, PdfPageProps>(
  ({ imageUrl, pageNumber, isHard = false }, ref) => {
    // In a two-page spread:
    // Even page numbers (2, 4, 6...) are Left pages (spine on the right edge)
    // Odd page numbers (1, 3, 5...) are Right pages (spine on the left edge)
    const isLeftPage = pageNumber % 2 === 0;
    const isRightPage = !isLeftPage;

    return (
      <div
        ref={ref}
        className={`page ${isLeftPage ? 'page--left' : 'page--right'}${isHard ? ' page--hard' : ''}`}
        data-density={isHard ? 'hard' : 'soft'}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Page ${pageNumber}`}
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-white">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        )}

        {/* Center Spine Blur Shadow (Embedded inside each page so it never cuts through turning pages) */}
        {!isHard && (
          <div
            className={`page-spine-shadow ${isLeftPage ? 'page-spine-shadow--left' : 'page-spine-shadow--right'}`}
            aria-hidden="true"
          />
        )}

        {/* Backside overlay layer for mobile view page turning */}
        <div className="page-backside-layer" aria-hidden="true" />
      </div>
    );
  }
);

PdfPage.displayName = 'PdfPage';

export default PdfPage;
