import React, { useState, useRef, useEffect } from 'react';
import { ROOM_THEMES, RoomTheme } from '../../config/roomThemes';

interface ThemeSwitcherProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentThemeId,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTheme = ROOM_THEMES.find((t) => t.id === currentThemeId) || ROOM_THEMES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="theme-switcher-container" ref={containerRef}>
      {/* Floating Trigger Button */}
      <button
        className="theme-switcher-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Change Room Theme"
        aria-label="Change Room Theme"
        aria-expanded={isOpen}
      >
        <span className="theme-switcher-icon">🎨</span>
        <span className="theme-switcher-label">Theme:</span>
        <span className="theme-switcher-active-name">{activeTheme.name}</span>

        {/* Active swatch dots */}
        <span className="theme-swatch-mini">
          {activeTheme.swatch.map((c, i) => (
            <span
              key={i}
              className="theme-swatch-dot"
              style={{ backgroundColor: c }}
            />
          ))}
        </span>

        <svg
          className={`theme-switcher-arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="theme-switcher-menu" role="menu">
          <div className="theme-switcher-header">
            <span>Room Color Themes</span>
            <span className="theme-count">{ROOM_THEMES.length} options</span>
          </div>

          <div className="theme-options-list">
            {ROOM_THEMES.map((theme: RoomTheme) => {
              const isSelected = theme.id === currentThemeId;
              return (
                <button
                  key={theme.id}
                  className={`theme-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  role="menuitem"
                >
                  <div className="theme-option-swatch">
                    {theme.swatch.map((color, i) => (
                      <span
                        key={i}
                        className="theme-swatch-circle"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="theme-option-info">
                    <div className="theme-option-name">{theme.name}</div>
                    <div className="theme-option-desc">{theme.description}</div>
                  </div>

                  {isSelected && (
                    <div className="theme-selected-check">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
