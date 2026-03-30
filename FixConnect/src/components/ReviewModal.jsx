import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axios';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled(motion.div)`
  background: var(--bg-card);
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h3`
  margin-bottom: 20px;
  color: var(--text-main);
  text-align: center;
`;

const StarsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const Star = styled.span`
  font-size: 2rem;
  cursor: pointer;
  color: ${props => props.active ? '#FFD700' : 'rgba(255,255,255,0.2)'};
  transition: color 0.2s;

  &:hover {
    color: #FFD700;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-main);
  margin-bottom: 20px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: ${props => props.variant === 'outline' ? 'transparent' : 'var(--primary-color)'};
  border: ${props => props.variant === 'outline' ? '1px solid var(--text-muted)' : 'none'};
  color: ${props => props.variant === 'outline' ? 'var(--text-main)' : 'white'};
`;

const StatusMsg = styled.div`
  margin-bottom: 15px;
  text-align: center;
  color: ${props => props.success ? '#4CAF50' : '#f44336'};
`;

const ReviewModal = ({ isOpen, onClose, workerId, bookingId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setStatus({ type: 'error', message: 'Please select a rating.' });
      return;
    }
    if (!comment.trim()) {
      setStatus({ type: 'error', message: 'Please write a review comment.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/reviews', {
        workerId,
        bookingId,
        rating,
        comment
      });
      setStatus({ type: 'success', message: 'Review submitted successfully!' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to submit review' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ModalContent
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <Title>Rate Your Experience</Title>

          {status.message && (
            <StatusMsg success={status.type === 'success'}>{status.message}</StatusMsg>
          )}

          <StarsContainer>
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                active={star <= (hoverRating || rating)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                ★
              </Star>
            ))}
          </StarsContainer>

          <Textarea
            placeholder="Tell us about the service you received..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <ButtonGroup>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </ButtonGroup>
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
};

export default ReviewModal;
