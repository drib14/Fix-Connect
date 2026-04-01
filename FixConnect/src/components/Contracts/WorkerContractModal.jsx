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

const WorkerContractModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleAccept = () => {
    onClose();
    // Redirect to login/register, the user will be guided to /apply once authenticated
    navigate('/register', { state: { redirectToApply: true } });
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>FixConnect Worker Terms & Conditions</h2>
        <Content>
          <p>By applying to become a professional worker on FixConnect, you agree to the following terms:</p>

          <h3>1. Platform Commission</h3>
          <p>FixConnect charges a standard 20% platform commission on all completed transactions. This covers platform maintenance, marketing, and secure payment processing.</p>

          <h3>2. Professionalism & Quality</h3>
          <p>You agree to provide services to the best of your ability. Consistently poor ratings or unresolved disputes may result in temporary or permanent suspension from the platform.</p>

          <h3>3. Accurate Pricing</h3>
          <p>You agree to honor the daily, monthly, or one-time rates you set in your Service Posts. Bait-and-switch pricing tactics are strictly prohibited.</p>

          <h3>4. Verification</h3>
          <p>You agree to provide accurate identification and professional certifications during the application process.</p>
        </Content>
        <ButtonGroup>
          <button style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--text-muted)', color: 'white', borderRadius: '5px', cursor: 'pointer' }} onClick={onClose}>Decline</button>
          <button style={{ padding: '10px 20px', background: 'var(--primary-color)', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleAccept}>I Agree & Continue</button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default WorkerContractModal;
