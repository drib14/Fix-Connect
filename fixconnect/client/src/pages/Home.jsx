import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../utils/axios';
import PageLayout from '../components/Common/PageLayout';
import Mascot3D from '../components/Home/Mascot3D';
import TourGuide from '../components/Common/TourGuide';

const HeroSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 50px;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    text-align: center;
  }
`;

const Content = styled(motion.div)`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: var(--text-muted);
  margin-bottom: 30px;
  line-height: 1.8;
`;

const MascotContainer = styled(motion.div)`
  flex: 1;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  background: radial-gradient(circle, rgba(76,175,80,0.1) 0%, rgba(18,18,18,1) 70%);
`;

const StatsSection = styled(motion.div)`
  margin-top: 60px;
  background: var(--bg-card);
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--accent);
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Home = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Check if tour should run (only once per session/visit)
    if (!localStorage.getItem('tourCompleted')) {
      setRunTour(true);
      localStorage.setItem('tourCompleted', 'true');
    }

    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setTotalUsers(response.data.totalUsers);
      } catch (error) {
        console.error('Failed to fetch stats', error);
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
          <Description>
            The premier platform connecting you with top-tier skilled professionals.
            Whether you need a Virtual Assistant, a Web Developer, or a master craftsman,
            FixConnect bridges the gap between your needs and their expertise with seamless precision.
          </Description>

          <StatsSection
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {loadingStats ? (
              <div className="skeleton" style={{ height: '60px', width: '150px', margin: '0 auto' }}></div>
            ) : (
              <>
                <StatNumber>{totalUsers.toLocaleString()}+</StatNumber>
                <StatLabel>Registered Users Trust Us</StatLabel>
              </>
            )}
          </StatsSection>
        </Content>

        <MascotContainer
          className="mascot-container"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Mascot3D />
        </MascotContainer>
      </HeroSection>
    </PageLayout>
  );
};

export default Home;
