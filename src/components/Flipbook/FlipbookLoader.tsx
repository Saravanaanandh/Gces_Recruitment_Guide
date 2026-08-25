import React from 'react';

interface FlipbookLoaderProps {
  renderedCount: number;
  totalPages: number;
  status: string;
}

const FlipbookLoader: React.FC<FlipbookLoaderProps> = ({ renderedCount, totalPages, status }) => {
  const progressText =
    status === 'rendering' && totalPages > 0
      ? `Rendering pages... ${renderedCount} / ${totalPages}`
      : status === 'loading'
      ? 'Loading brochure...'
      : 'Initializing...';

  return (
    <div className="loading-screen" aria-label="Loading brochure">
      <div className="loading-ring" />
      <div className="loading-text">{progressText}</div>
      {status === 'rendering' && totalPages > 0 && (
        <div className="loading-progress">
          {Math.round((renderedCount / totalPages) * 100)}%
        </div>
      )}
    </div>
  );
};

export default FlipbookLoader;
