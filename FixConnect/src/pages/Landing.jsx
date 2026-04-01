import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import PageLayout from '../components/Common/PageLayout';
import WorkerContractModal from '../components/Contracts/WorkerContractModal';

const HeroSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60vh;
  margin-bottom: 60px;
  margin-top: 50px;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeroContent = styled(motion.div)`
  flex: 1;
  max-width: 600px;
  z-index: 2;

  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 10px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--text-main);
    margin-bottom: 20px;
    letter-spacing: 1px;
  }

  p {
    font-size: 1.2rem;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 30px;
  }
`;

const StatsSection = styled(motion.div)`
  margin-top: 60px;
  background: var(--bg-card);
  padding: 30px 40px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: inline-block;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: var(--text-muted);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CTAContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 40px;

  @media (max-width: 768px) {
    justify-content: center;
  }

  a {
    padding: 15px 30px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 1.1rem;
    text-decoration: none;
    transition: all 0.3s ease;

    &.primary {
      background: var(--primary-color);
      color: white;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);

      &:hover {
        background: var(--primary-hover);
        transform: translateY(-2px);
      }
    }

    &.secondary {
      background: transparent;
      color: var(--text-main);
      border: 2px solid rgba(255, 255, 255, 0.1);

      &:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }
`;

// Slide out CTA from previous design
const SliderWrapper = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  right: -280px; /* Hidden by default */
  width: 350px;
  background: var(--bg-card);
  padding: 20px;
  border-radius: 12px 0 0 12px;
  border: 1px solid var(--primary-color);
  border-right: none;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  z-index: 100;
  transition: right 0.3s ease;

  &:hover {
    right: 0; /* Slide in completely on hover */
  }

  /* Expose just the icon initially */
  &.peek {
    right: -290px;
  }
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const TextContent = styled.div`
  color: white;
  h4 {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
  }
  p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
`;

const Landing = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showContract, setShowContract] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await api.get('/stats');
        setTotalUsers(statsRes.data.totalUsers);
      } catch (error) {
        console.error('Failed to fetch initial data', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <PageLayout>
      <HeroSection>
        <HeroContent
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>FixConnect</h1>
          <h3>Your Quick Fix, Just a Click Away.</h3>
          <p>
            The premier platform connecting you with top-tier skilled professionals.
            Whether you need a Virtual Assistant, a Web Developer, or a master craftsman,
            FixConnect bridges the gap between your needs and their expertise with seamless precision.
          </p>

          <CTAContainer>
            <Link to="/login" className="primary">Sign In to Book or Hire</Link>
            <Link to="/register" className="secondary">Create an Account</Link>
          </CTAContainer>

          <StatsSection
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {loadingStats ? (
              <div className="skeleton" style={{ height: '60px', width: '150px', margin: '0 auto' }}></div>
            ) : (
              <>
                <StatNumber>{(totalUsers || 0).toLocaleString()}+</StatNumber>
                <StatLabel>Registered Users Trust Us</StatLabel>
              </>
            )}
          </StatsSection>
        </HeroContent>
      </HeroSection>

      <SliderWrapper
        className="peek"
        onClick={() => setShowContract(true)}
      >
        <IconWrapper>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
        </IconWrapper>
        <TextContent>
          <h4>Apply as Skilled Worker?</h4>
          <p>Join our network of professionals.</p>
        </TextContent>
      </SliderWrapper>

      {showContract && <WorkerContractModal onClose={() => setShowContract(false)} />}
    </PageLayout>
  );
};

export default Landing;
