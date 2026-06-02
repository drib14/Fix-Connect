import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, title, description, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div 
        className="animate-slide"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          width: '90%',
          maxWidth: '440px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <X size={18} />
        </button>

        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: 'var(--text-primary)' }}>{title}</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.8rem', lineHeight: '1.5' }}>{description}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
          <button className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
