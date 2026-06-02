import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1, style = {} }) => {
  const renderSkeleton = (key) => {
    switch (type) {
      case 'card':
        return (
          <div key={key} className="skeleton-card" style={{ ...defaultCardStyle, ...style }}>
            <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '1rem' }}></div>
            <div className="skeleton-shimmer" style={{ height: '20px', width: '80%', marginBottom: '0.5rem', borderRadius: '4px' }}></div>
            <div className="skeleton-shimmer" style={{ height: '14px', width: '100%', marginBottom: '0.5rem', borderRadius: '4px' }}></div>
            <div className="skeleton-shimmer" style={{ height: '14px', width: '60%', borderRadius: '4px' }}></div>
          </div>
        );
      case 'profile':
        return (
          <div key={key} style={{ display: 'flex', gap: '1rem', alignItems: 'center', ...style }}>
            <div className="skeleton-shimmer" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton-shimmer" style={{ height: '20px', width: '60%', marginBottom: '0.5rem', borderRadius: '4px' }}></div>
              <div className="skeleton-shimmer" style={{ height: '14px', width: '40%', borderRadius: '4px' }}></div>
            </div>
          </div>
        );
      case 'text':
      default:
        return (
          <div key={key} className="skeleton-shimmer" style={{ height: '20px', width: '100%', marginBottom: '0.5rem', borderRadius: '4px', ...style }}></div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
      <style>{`
        .skeleton-shimmer {
          background: #e2e8f0;
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.4) 20%,
            rgba(255, 255, 255, 0.8) 60%,
            rgba(255, 255, 255, 0)
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-card {
          background: white;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </>
  );
};

const defaultCardStyle = {
  display: 'flex',
  flexDirection: 'column',
};

export default SkeletonLoader;
