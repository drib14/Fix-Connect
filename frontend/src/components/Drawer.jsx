import React from 'react';
import { X } from 'lucide-react';

export const Drawer = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 998,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      {/* Backdrop closer click capture */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose}></div>

      <div 
        style={{
          position: 'relative',
          backgroundColor: 'var(--surface)',
          borderLeft: '1px solid var(--surface-border)',
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.8rem',
          borderBottom: '1px solid var(--surface-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.8rem',
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Drawer;
