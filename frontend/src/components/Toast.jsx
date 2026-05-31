import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// ─── Toast Context ────────────────────────────────────────────────────
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if used outside provider — use alert()
    return {
      success: (msg) => console.log(`[Toast] ✓ ${msg}`),
      error: (msg) => console.error(`[Toast] ✗ ${msg}`),
      info: (msg) => console.info(`[Toast] ℹ ${msg}`),
    };
  }
  return context;
};

// ─── Single Toast Item ────────────────────────────────────────────────
const ToastItem = ({ id, type, message, onRemove }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(id), 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const icons = {
    success: <CheckCircle size={16} />,
    error: <AlertCircle size={16} />,
    info: <Info size={16} />,
  };

  return (
    <div className={`toast toast-${type} ${exiting ? 'toast-exit' : ''}`}>
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(id), 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: 'inherit',
          opacity: 0.6,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

// ─── Toast Provider ───────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]); // Keep max 5 toasts
  }, []);

  const toast = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    info: (msg) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
