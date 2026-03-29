import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../utils/axios';
import PageLayout from '../components/Common/PageLayout';
import WorkerCard from '../components/Workers/WorkerCard';
import WorkerPopup from '../components/Workers/WorkerPopup';

const Container = styled.div`
  margin-top: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--text-main);
  margin-bottom: 40px;
  text-align: center;
  position: relative;

  &:after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: var(--primary-color);
    margin: 15px auto 0;
    border-radius: 2px;
  }
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  padding: 20px 0;
`;

const SkeletonCard = styled.div`
  background: var(--bg-card);
  border-radius: 15px;
  overflow: hidden;
  height: 400px;
  padding-bottom: 20px;
`;

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await api.get('/workers');
        setWorkers(response.data);
      } catch (error) {
        console.error('Error fetching workers', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const handleCardClick = (worker) => {
    setSelectedWorker(worker);
    setIsPopupOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <PageLayout>
      <Container>
        <Title>Explore Skilled Professionals</Title>

        {loading ? (
          <Grid>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} className="skeleton">
                <div className="skeleton-img"></div>
                <div style={{ padding: '20px' }}>
                  <div className="skeleton skeleton-text" style={{ width: '70%', height: '25px' }}></div>
                  <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '15px' }}></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              </SkeletonCard>
            ))}
          </Grid>
        ) : (
          <Grid variants={containerVariants} initial="hidden" animate="show">
            {workers.map((worker) => (
              <motion.div key={worker._id} variants={itemVariants}>
                <WorkerCard worker={worker} onClick={handleCardClick} />
              </motion.div>
            ))}
          </Grid>
        )}
      </Container>

      <WorkerPopup
        worker={selectedWorker}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </PageLayout>
  );
};

export default Workers;
