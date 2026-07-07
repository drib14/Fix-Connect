import React from 'react';

export function ServicesGridSkeleton({ count = 8 }) {
  return (
    <div className="services-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="service-card shimmer" style={styles.card}>
          <div style={styles.icon}></div>
          <div style={styles.line1}></div>
          <div style={styles.line2}></div>
        </div>
      ))}
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="shimmer" style={styles.banner}>
      <div style={styles.circle}></div>
      <div style={{ flex: 1, marginLeft: 16 }}>
        <div style={styles.bannerLine1}></div>
        <div style={styles.bannerLine2}></div>
      </div>
    </div>
  );
}

export function BookingsListSkeleton({ count = 3 }) {
  return (
    <div style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shimmer" style={styles.listItem}>
          <div style={styles.circle}></div>
          <div style={{ flex: 1, marginLeft: 16 }}>
            <div style={styles.line1}></div>
            <div style={styles.line2}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    height: 140,
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    border: 'none',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: '8px',
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  line1: {
    width: '70%',
    height: 14,
    borderRadius: '4px',
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  line2: {
    width: '40%',
    height: 10,
    borderRadius: '4px',
    backgroundColor: '#E2E8F0',
  },
  banner: {
    height: 80,
    borderRadius: '16px',
    backgroundColor: '#E2E8F0',
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: '#CBD5E1',
  },
  bannerLine1: {
    width: '30%',
    height: 14,
    borderRadius: '4px',
    backgroundColor: '#CBD5E1',
    marginBottom: 6,
  },
  bannerLine2: {
    width: '15%',
    height: 10,
    borderRadius: '4px',
    backgroundColor: '#CBD5E1',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginTop: 20,
  },
  listItem: {
    height: 90,
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    padding: 16,
    display: 'flex',
    alignItems: 'center',
  },
};
