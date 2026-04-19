import React, { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import ThreeBackground from './ThreeBackground';

export default function AuthLayout({ children }) {
  const containerRef = useRef(null);
  const location = useLocation();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    });

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden dark bg-background">
      <ThreeBackground />

      <div className="relative z-10 w-full max-w-md p-6" ref={containerRef}>
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden p-1">
              <img src="/FC-logo.png" alt="FixConnect Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">FixConnect</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}