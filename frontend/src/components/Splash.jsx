import React from 'react';

export const Splash = () => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
      }}>
        {/* Pulsing circular handyman logo wrapper */}
        <div style={{
          position: 'relative',
          width: '100px',
          height: '100px',
        }}>
          {/* Animated concentric pulse waves */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: '#10b981',
            opacity: 0.15,
            transform: 'scale(1)',
            animation: 'pulseWave 2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
          }}></div>
          
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: '#10b981',
            opacity: 0.25,
            transform: 'scale(1)',
            animation: 'pulseWave 2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
            animationDelay: '0.6s',
          }}></div>

          <img 
            src="/logo.svg" 
            alt="FixConnect" 
            style={{
              position: 'relative',
              width: '100px',
              height: '100px',
              zIndex: 2,
              animation: 'logoScale 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate',
            }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontFamily: "'Outfit', sans-serif", 
            fontWeight: 800, 
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px',
            marginBottom: '0.4rem',
          }}>
            Fix<span style={{ color: 'var(--primary)' }}>Connect</span>
          </h2>
          <p style={{ 
            fontSize: '0.9rem', 
            fontWeight: 500, 
            color: 'var(--text-muted)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            Securing Premium Local Care...
          </p>
        </div>
      </div>

      {/* Dynamic Keyframe style block injected locally */}
      <style>{`
        @keyframes pulseWave {
          0% { transform: scale(1); opacity: 0.35; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes logoScale {
          0% { transform: scale(0.9); }
          100% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default Splash;
