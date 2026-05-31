import React, { useEffect, useState } from 'react';
import Logo from './Logo';

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
    }, 40);

    // Fade out splash screen
    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); 
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
          <Logo size={100} showText={false} />
        </div>
      </div>
      <h1 className="splash-title" style={{ fontFamily: 'Outfit', fontWeight: '800' }}>FixConnect</h1>
      <p className="splash-tagline">{text}|</p>
    </div>
  );
};

export default Splash;
