import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaHardHat } from 'react-icons/fa';
import { gsap } from 'gsap';

const CTAContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: -250px; /* Initially hidden off-screen */
  background: var(--bg-card);
  border: 1px solid var(--primary-color);
  border-radius: 50px;
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  transition: transform 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: scale(1.05);
  }
`;

const IconWrapper = styled.div`
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  position: relative;
`;

const Text = styled.span`
  color: var(--text-main);
  font-weight: 600;
  white-space: nowrap;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-width 0.4s ease, opacity 0.4s ease, padding 0.4s ease;
  padding-left: 0;

  ${CTAContainer}:hover & {
    max-width: 250px;
    opacity: 1;
    padding-left: 15px;
    padding-right: 15px;
  }
`;

const Popup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-card);
  padding: 30px 50px;
  border-radius: 10px;
  border: 2px solid var(--accent);
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
  z-index: 1001;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PopupTitle = styled.h2`
  color: var(--accent);
  margin-bottom: 10px;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  z-index: 1000;
`;

const CloseBtn = styled.button`
  margin-top: 20px;
  padding: 8px 20px;
  background: var(--bg-dark);
  color: var(--text-main);
  border: 1px solid var(--text-muted);
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
  }
`;

const WorkerCTA = () => {
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Animate in from right to left
    gsap.to(containerRef.current, {
      right: '30px',
      duration: 1.5,
      ease: 'power3.out',
      delay: 2 // Wait 2 seconds before sliding in
    });
  }, []);

  const handleClick = () => {
    setShowPopup(true);
  };

  return (
    <>
      <CTAContainer ref={containerRef} onClick={handleClick}>
        <IconWrapper>
          <FaHardHat size={24} />
        </IconWrapper>
        <Text>Apply as Skilled Worker?</Text>
      </CTAContainer>

      {showPopup && (
        <>
          <Overlay onClick={() => setShowPopup(false)} />
          <Popup>
            <PopupTitle>Coming Soon!</PopupTitle>
            <p>We are currently building the application process.</p>
            <CloseBtn onClick={() => setShowPopup(false)}>Close</CloseBtn>
          </Popup>
        </>
      )}
    </>
  );
};

export default WorkerCTA;
