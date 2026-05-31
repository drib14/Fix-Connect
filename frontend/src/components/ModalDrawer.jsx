import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const ModalDrawer = ({ isOpen, onClose, title, children }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle clicking overlay
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('md-overlay')) {
      onClose();
    }
  };

  return (
    <div className="md-overlay" onClick={handleOverlayClick}>
      <div className="md-container">
        {/* Draw a handle on mobile for natural bottom sheet swipe feel */}
        {isMobile && <div className="drawer-handle" onClick={onClose}></div>}

        <div className="md-header">
          <h3 className="md-title">{title}</h3>
          <button className="md-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="md-content">{children}</div>
      </div>
    </div>
  );
};

export default ModalDrawer;
