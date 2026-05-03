import React, { createContext, useRef } from 'react';
import AnimatedToast from '../components/AnimatedToast';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const toastRef = useRef(null);

  const showToast = (message) => {
    if (toastRef.current) {
      toastRef.current.show(message);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatedToast ref={toastRef} />
    </ToastContext.Provider>
  );
};
