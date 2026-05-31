import React from 'react';

const Logo = ({ size = 44, showText = true, vertical = false }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        gap: '12px',
        justifyContent: 'center',
      }}
    >
      {/* Crisp Circular Vector Mechanics Logo Badge */}
      <img
        src="/logo.png"
        alt="FixConnect Logo"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'block',
          borderRadius: '50%',
          filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.15))',
        }}
      />

      {showText && (
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: '800',
            fontSize: vertical ? '22px' : '20px',
            letterSpacing: '-0.5px',
            color: 'hsl(220 37% 12%)',
          }}
        >
          FixConnect
        </span>
      )}
    </div>
  );
};

export default Logo;
