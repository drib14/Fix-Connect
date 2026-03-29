import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.8);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopupBox = styled(motion.div)`
  background: var(--bg-card);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  position: relative;
`;

const Title = styled.h2`
  color: var(--primary-color);
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
`;

const Content = styled.div`
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 30px;

  h3 {
    color: var(--text-main);
    margin-top: 15px;
    margin-bottom: 5px;
  }
`;

const AgreeBtn = styled.button`
  width: 100%;
  padding: 15px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: var(--primary-hover);
  }
`;

const TermsPopup = ({ isOpen, onClose, onAgree }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <PopupBox
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
          >
            <Title>Terms & Privacy Policy</Title>
            <Content>
              <p>Welcome to FixConnect. Please read our terms carefully.</p>
              <h3>1. Acceptance of Terms</h3>
              <p>By creating an account, you agree to abide by these terms and conditions.</p>
              <h3>2. Privacy Policy</h3>
              <p>We respect your privacy. Your personal information, including location data (e.g., Cebu City and other regions), is stored securely and used solely to connect you with skilled workers.</p>
              <h3>3. User Conduct</h3>
              <p>You agree to use the platform respectfully and not engage in fraudulent activities.</p>
            </Content>
            <AgreeBtn onClick={() => { onAgree(); onClose(); }}>I Agree</AgreeBtn>
          </PopupBox>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default TermsPopup;
