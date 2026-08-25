import React from 'react';

interface FlipbookTopBarProps {
  onToggleThumbnails: () => void;
  thumbnailsOpen: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
}

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FlipbookTopBar: React.FC<FlipbookTopBarProps> = ({
  onToggleThumbnails,
  thumbnailsOpen,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="flipbook-topbar" role="banner" aria-label="Viewer top bar">
      {/* Left: Thumbnail Drawer Toggle */}
      <button
        type="button"
        id="top-thumbnails-btn"
        className={`top-icon-btn ${thumbnailsOpen ? 'active' : ''}`}
        onClick={onToggleThumbnails}
        title="Page Thumbnails"
        aria-label="Toggle page thumbnails"
        aria-pressed={thumbnailsOpen}
      >
        <GridIcon />
      </button>

      {/* Right: Search Box */}
      <div className="top-search-wrapper">
        <input
          type="text"
          id="top-search-input"
          className="top-search-input"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search or jump to page number"
        />
        <button
          type="button"
          id="top-search-btn"
          className="top-search-icon-btn"
          onClick={() => onSearchSubmit(searchQuery)}
          title="Search"
          aria-label="Execute search"
        >
          <SearchIcon />
        </button>
      </div>
    </header>
  );
};

export default FlipbookTopBar;
