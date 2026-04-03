import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import PageLayout from '../components/Common/PageLayout';
import TourGuide from '../components/Common/TourGuide';

const HeroSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 50px;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Content = styled(motion.div)`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Tagline = styled.h3`
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 20px;
  letter-spacing: 1px;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: var(--text-muted);
  margin-bottom: 30px;
  line-height: 1.8;
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

const Home = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tourCompleted')) {
      setRunTour(true);
      localStorage.setItem('tourCompleted', 'true');
    }

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
      <TourGuide run={runTour} />
      <HeroSection>
        <Content
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title>FixConnect</Title>
          <Tagline>Your Quick Fix, Just a Click Away.</Tagline>
          <Description>
            The premier platform connecting you with top-tier skilled professionals.
            Whether you need a Plumber, an Electrician, or a House Cleaner,
            FixConnect bridges the gap between your needs and their expertise.
          </Description>

          <CTAContainer>
            <Link to="/book" className="primary">Book a Service</Link>
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
        </Content>
      </HeroSection>
    </PageLayout>
  );
};

export default Home;
