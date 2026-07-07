import React from 'react';
import { User, ShieldAlert, Navigation, Loader2 } from 'lucide-react';

export default function MapView({ userLocation, providerLocation, height = 300 }) {
  const centerLat = userLocation?.latitude || 14.5995;
  const centerLng = userLocation?.longitude || 120.9842;

  return (
    <div style={{ ...styles.container, height }}>
      {/* Simulation Header */}
      <div style={styles.header}>
        <div style={styles.dot}></div>
        <div style={styles.headerTitle}>Live Dispatch Radar (Manila Center)</div>
        <div style={styles.coordinates}>{centerLat.toFixed(4)}°N, {centerLng.toFixed(4)}°E</div>
      </div>

      {/* Radar body */}
      <div style={styles.radarBody}>
        {/* Sweep arm */}
        <div className="radar-sweep" style={styles.sweep}></div>

        {/* Pulse rings */}
        <div className="radar-ring pulse-ring-1" style={styles.ring1}></div>
        <div className="radar-ring pulse-ring-2" style={styles.ring2}></div>
        <div className="radar-ring pulse-ring-3" style={styles.ring3}></div>

        {/* User Node */}
        <div style={styles.userNode}>
          <div className="user-glow" style={styles.userGlow}></div>
          <div style={styles.userIconCircle}>
            <User size={16} color="#FFF" />
          </div>
          <span style={styles.nodeLabel}>You (Active)</span>
        </div>

        {/* Provider Node */}
        {providerLocation ? (
          <div 
            style={{
              ...styles.providerNode,
              transform: `rotate(${providerLocation.bearing || 45}deg) translate(80px) rotate(-${providerLocation.bearing || 45}deg)`
            }}
          >
            <div className="provider-glow" style={styles.providerGlow}></div>
            <div style={styles.providerIconCircle}>
              <Navigation size={14} color="#FFF" style={{ transform: 'rotate(45deg)' }} />
            </div>
            <span style={styles.nodeLabel}>Technician Dispatched</span>
          </div>
        ) : (
          <div style={styles.loaderBox}>
            <Loader2 size={16} className="loader-spin" style={{ marginRight: 8, color: '#2E7D32' }} />
            <span style={styles.loaderText}>Searching for nearby service providers...</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    borderRadius: '16px',
    backgroundColor: '#0A0F0D',
    border: '1.5px solid #1B3F21',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'rgba(27, 63, 33, 0.2)',
    borderBottom: '1px solid rgba(27, 63, 33, 0.4)',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#81C784',
    animation: 'pulse 1.5s infinite',
  },
  headerTitle: {
    color: '#E8F5E9',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    fontFamily: "'Outfit', sans-serif",
  },
  coordinates: {
    marginLeft: 'auto',
    color: '#81C784',
    fontFamily: 'monospace',
    fontSize: '11px',
  },
  radarBody: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: 'radial-gradient(circle, rgba(27, 63, 33, 0.15) 1px, transparent 1px)',
    backgroundSize: '16px 16px',
  },
  sweep: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(45deg, rgba(46, 125, 50, 0.1) 0%, transparent 40%)',
    transformOrigin: 'center center',
  },
  ring1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: '50%',
    border: '1px dashed rgba(46, 125, 50, 0.2)',
  },
  ring2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: '50%',
    border: '1px solid rgba(46, 125, 50, 0.15)',
  },
  ring3: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    border: '1px solid rgba(46, 125, 50, 0.08)',
  },
  userNode: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 5,
  },
  userIconCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#2E7D32',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFF',
    boxShadow: '0 0 10px rgba(46, 125, 50, 0.8)',
  },
  userGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: 'rgba(46, 125, 50, 0.3)',
  },
  providerNode: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 5,
    transition: 'all 0.5s ease',
  },
  providerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#FF9800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFF',
    boxShadow: '0 0 10px rgba(255, 152, 0, 0.8)',
  },
  providerGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
  },
  nodeLabel: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#E2E8F0',
    backgroundColor: '#1E293B',
    padding: '2px 6px',
    borderRadius: '4px',
    marginTop: 6,
    whiteSpace: 'nowrap',
  },
  loaderBox: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: 'rgba(10, 15, 13, 0.8)',
    border: '1px solid rgba(46, 125, 50, 0.3)',
    borderRadius: '20px',
    padding: '6px 14px',
    display: 'flex',
    alignItems: 'center',
    zIndex: 6,
  },
  loaderText: {
    color: '#81C784',
    fontSize: '11px',
    fontWeight: '600',
  },
};

// Inject custom radar animations in HTML head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @keyframes radarSweep {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes sweepGlow {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }
    @keyframes ripple {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .radar-sweep {
      animation: radarSweep 4s infinite linear;
    }
    .user-glow, .provider-glow {
      animation: ripple 2s infinite ease-out;
    }
    .loader-spin {
      animation: spin 1s infinite linear;
    }
  `;
  document.head.appendChild(styleSheet);
}
