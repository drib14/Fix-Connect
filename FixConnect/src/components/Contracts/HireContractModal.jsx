import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: var(--bg-card);
  padding: 40px;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  border: 1px solid var(--primary-color);
  max-height: 80vh;
  overflow-y: auto;
`;

const Content = styled.div`
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 20px;
  h3 { color: var(--text-main); margin-top: 20px; margin-bottom: 10px; }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const HireContractModal = ({ onClose, servicePost }) => {
  const navigate = useNavigate();

  const handleAccept = () => {
    onClose();
    // Redirect to the booking page with the worker pre-selected
    navigate(`/book?workerId=${servicePost?.workerId?._id}`);
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>FixConnect Service Contract</h2>
        <Content>
          <p>Before proceeding to hire this professional, please review and accept the terms of service:</p>

          <h3>1. Scope of Work</h3>
          <p>The worker agrees to perform the services described in the post: <strong>{servicePost?.title}</strong>. Any additional work outside this scope may require renegotiation of the rate.</p>

          <h3>2. Payment Terms</h3>
          <p>Payment must be processed through FixConnect's secure gateway to ensure protection for both parties. The agreed rate is <strong>{servicePost?.price?.toLocaleString()} PHP</strong> ({servicePost?.rateType}). Off-platform payments are prohibited and void any platform guarantees.</p>

          <h3>3. Dispute Resolution</h3>
          <p>In the event of incomplete or unsatisfactory work, you may raise a dispute through your dashboard before the payment is released to the worker.</p>

          <h3>4. Cancellation Policy</h3>
          <p>Cancellations must be made at least 24 hours prior to the scheduled start time to receive a full refund.</p>
        </Content>
        <ButtonGroup>
          <button style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--text-muted)', color: 'white', borderRadius: '5px', cursor: 'pointer' }} onClick={onClose}>Decline</button>
          <button style={{ padding: '10px 20px', background: 'var(--primary-color)', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleAccept}>I Agree & Proceed to Checkout</button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default HireContractModal;
