import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo.png';

export default function AppSplashScreen({ onFinish, duration = 1500 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Start fade out animation
    const fadeTimeout = setTimeout(() => {
      setOpacity(0);
    }, duration - 400);

    // Call finish callback after animation completes
    const finishTimeout = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(finishTimeout);
    };
  }, [duration, onFinish]);

  if (!isVisible) return null;

  return (
    <div style={{
      ...styles.container,
      opacity: opacity,
    }}>
      <div style={styles.logoContainer}>
        <img src={logo} alt="FixConnect Logo" style={styles.logo} />
        <h1 style={styles.title}>FixConnect</h1>
        <p style={styles.subtitle}>Instant Professional Home Services</p>
      </div>
      <div style={styles.loader}></div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    transition: 'opacity 0.4s ease-out',
  },
  logoContainer: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 130,
    borderRadius: 65,
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    marginBottom: 20,
    animation: 'pulse 2s infinite',
  },
  title: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '-1px',
    fontFamily: "'Outfit', sans-serif",
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: '0.5px',
  },
  loader: {
    position: 'absolute',
    bottom: 80,
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    animation: 'spin 1s infinite linear',
  },
};

// Add standard keyframe spin styles inline
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
