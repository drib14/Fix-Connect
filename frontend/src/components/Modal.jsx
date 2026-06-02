import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const Modal = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  isLoading = false,
}) => {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: danger ? 'var(--danger-soft)' : 'var(--primary-soft)',
            color: danger ? 'var(--danger)' : 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={22} />
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <h3 id="modal-title" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.8rem' }}>
            {description}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className="btn btn-primary"
            style={{
              flex: 1,
              backgroundColor: danger ? 'var(--danger)' : 'var(--primary)',
              boxShadow: danger ? '0 4px 12px rgba(239, 68, 68, 0.2)' : undefined,
            }}
            onClick={onConfirm}
            disabled={isLoading}
            id="modal-confirm-btn"
          >
            {isLoading ? (
              <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: 'white' }} />
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
