import React from 'react';

interface FlipbookThumbnailsProps {
  isOpen: boolean;
  onClose: () => void;
  pageImages: string[];
  totalPages: number;
  currentPage: number;
  onSelectPage: (pageIndex: number) => void;
}

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FlipbookThumbnails: React.FC<FlipbookThumbnailsProps> = ({
  isOpen,
  onClose,
  pageImages,
  totalPages,
  currentPage,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="thumbnails-drawer" aria-label="Pages overview">
      <div className="thumbnails-header">
        <h2 className="text-sm font-medium text-gray-200">Pages ({totalPages})</h2>
        <button
          type="button"
          onClick={onClose}
          className="thumbnails-close-btn"
          title="Close thumbnails (Esc)"
          aria-label="Close thumbnails"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="thumbnails-grid">
        {pageImages.map((imgUrl, idx) => {
          const isActive = idx === currentPage;

          return (
            <button
              key={idx}
              type="button"
              className={`thumbnail-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectPage(idx);
                onClose();
              }}
              aria-label={`Jump to page ${idx + 1}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="thumbnail-img-wrap">
                <img src={imgUrl} alt={`Thumbnail page ${idx + 1}`} loading="lazy" />
              </div>
              <span className="thumbnail-num">{idx + 1}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default FlipbookThumbnails;
