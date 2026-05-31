import React from 'react';

// Single skeletal unit
export const SkeletonUnit = ({ className = '', style = {} }) => (
  <div className={`skeleton ${className}`} style={style}></div>
);

// Worker Card Skeleton
export const SkeletonCard = () => (
  <div className="skeleton-card glass-card">
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <SkeletonUnit className="skeleton-avatar" />
      <div style={{ flex: 1 }}>
        <SkeletonUnit className="skeleton-text title" style={{ width: '70%', height: '20px' }} />
        <SkeletonUnit className="skeleton-text subtitle" style={{ width: '40%', height: '14px' }} />
      </div>
    </div>
    <SkeletonUnit className="skeleton-text" style={{ height: '14px', width: '90%', marginTop: '8px' }} />
    <SkeletonUnit className="skeleton-text" style={{ height: '14px', width: '80%' }} />
    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
      <SkeletonUnit className="skeleton-text" style={{ height: '24px', width: '30%', borderRadius: '6px' }} />
      <SkeletonUnit className="skeleton-text" style={{ height: '24px', width: '25%', borderRadius: '6px' }} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
      <SkeletonUnit className="skeleton-text" style={{ height: '20px', width: '35%' }} />
      <SkeletonUnit className="skeleton-text" style={{ height: '36px', width: '40%', borderRadius: '10px' }} />
    </div>
  </div>
);

// Worker Full Profile Skeleton
export const SkeletonProfile = () => (
  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
      <SkeletonUnit className="skeleton-avatar" style={{ width: '100px', height: '100px' }} />
      <SkeletonUnit className="skeleton-text" style={{ height: '28px', width: '50%' }} />
      <SkeletonUnit className="skeleton-text" style={{ height: '16px', width: '30%' }} />
    </div>
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
      <SkeletonUnit className="skeleton-text" style={{ height: '32px', width: '80px', borderRadius: '8px' }} />
      <SkeletonUnit className="skeleton-text" style={{ height: '32px', width: '80px', borderRadius: '8px' }} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
      <SkeletonUnit className="skeleton-text" style={{ height: '18px', width: '25%' }} />
      <SkeletonUnit className="skeleton-text" style={{ height: '14px', width: '100%' }} />
      <SkeletonUnit className="skeleton-text" style={{ height: '14px', width: '95%' }} />
      <SkeletonUnit className="skeleton-text" style={{ height: '14px', width: '80%' }} />
    </div>
    <div style={{ marginTop: '24px' }}>
      <SkeletonUnit className="skeleton-text" style={{ height: '18px', width: '35%', marginBottom: '12px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <SkeletonUnit style={{ height: '60px', borderRadius: '12px' }} />
        <SkeletonUnit style={{ height: '60px', borderRadius: '12px' }} />
        <SkeletonUnit style={{ height: '60px', borderRadius: '12px' }} />
      </div>
    </div>
  </div>
);

// Admin / Dashboard Metrics Skeleton
export const SkeletonMetrics = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="skeleton-card glass-card" style={{ height: '120px' }}>
        <SkeletonUnit className="skeleton-text" style={{ height: '14px', width: '50%' }} />
        <SkeletonUnit className="skeleton-text" style={{ height: '36px', width: '80%', marginTop: '12px' }} />
      </div>
    ))}
  </div>
);
