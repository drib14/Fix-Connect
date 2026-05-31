import React, { useEffect, useState } from 'react';

const Splash = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [text, setText] = useState('');
  const fullTagline = 'Connecting Homes with Handpicked Professionals';

  useEffect(() => {
    // Typing text animation
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullTagline.length) {
        setText((prev) => prev + fullTagline.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 45);

    // Fade out splash screen after 2.5 seconds
    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); // Wait for transition fade out to finish
    }, 2800);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="splash-container">
      <div className="splash-logo-wrapper">
        <div className="splash-ring"></div>
        <div className="splash-logo-circle">
          {/* Shard styled SVG representing the FixConnect circular mechanic logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width="90"
            height="90"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="50" cy="50" r="44" fill="#f0fdf4" stroke="#10b981" strokeWidth="4" />
            {/* Friendly Mechanic Silhouette and Tool outline */}
            <path
              d="M50 22 C42 22, 38 28, 38 34 C38 41, 40 45, 45 49 C46 54, 42 56, 38 57 C33 58, 25 62, 25 72 L75 72 C75 62, 67 58, 62 57 C58 56, 54 54, 55 49 C60 45, 62 41, 62 34 C62 28, 58 22, 50 22 Z"
              fill="#10b981"
              opacity="0.15"
            />
            {/* Mechanic Cap */}
            <path d="M35 34 C35 24, 65 24, 65 34 C65 34, 35 34, 35 34 Z" fill="#10b981" />
            <path d="M35 34 L31 37 C29 39, 32 40, 35 38 Z" fill="#047857" />
            {/* Friendly Face eyes & smile */}
            <circle cx="45" cy="38" r="2.5" fill="#047857" />
            <circle cx="55" cy="38" r="2.5" fill="#047857" />
            <path d="M46 44 Q50 47, 54 44" stroke="#047857" strokeWidth="2.5" />
            {/* Wrench held by worker */}
            <path
              d="M26 44 L20 50 C18 52, 19 55, 21 57 L24 57 C26 55, 27 52, 29 50 Z"
              stroke="#047857"
              strokeWidth="2.5"
            />
            <path
              d="M17 44 C15 42, 12 45, 14 47 L19 42 Z"
              fill="#047857"
            />
            {/* Tool Chest label */}
            <rect x="36" y="62" width="28" height="10" rx="2" fill="#047857" />
            <text x="50" y="70" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">
              FIX
            </text>
          </svg>
        </div>
      </div>
      <h1 className="splash-title">FixConnect</h1>
      <p className="splash-tagline">{text}|</p>
    </div>
  );
};

export default Splash;
