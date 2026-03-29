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
  max-width: 500px;
  padding: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  text-align: center;
`;

const Title = styled.h2`
  color: var(--accent);
  margin-bottom: 20px;
  font-size: 2rem;
`;

const Message = styled.p`
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 30px;
  font-size: 1.1rem;
`;

const CloseBtn = styled.button`
  padding: 12px 30px;
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

const WorkerPopup = ({ worker, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <PopupBox
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Title>Coming Soon!</Title>
            <Message>
              We are currently working on integrating the booking system. Soon, you will be able to connect with <strong>{worker?.name}</strong> and other top professionals directly through our platform.
            </Message>
            <CloseBtn onClick={onClose}>Understood</CloseBtn>
          </PopupBox>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default WorkerPopup;
