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

const SearchContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
`;

const SearchInput = styled.input`
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-main);
  width: 100%;
  max-width: 400px;
  font-size: 1rem;
`;

const SelectInput = styled.select`
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 1rem;
`;

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await api.get('/workers');
        // Ensure workers is always an array
        const fetchedWorkers = Array.isArray(response.data) ? response.data : [];
        setWorkers(fetchedWorkers);
        setFilteredWorkers(fetchedWorkers);
      } catch (error) {
        console.error('Error fetching workers', error);
        setWorkers([]); // Fallback to empty array on error
        setFilteredWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  useEffect(() => {
    let result = workers;
    if (searchTerm) {
      result = result.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) {
      result = result.filter(w => w.category === selectedCategory);
    }
    setFilteredWorkers(result);
  }, [searchTerm, selectedCategory, workers]);

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

  const categories = [...new Set(workers.map(w => w.category))];

  return (
    <PageLayout>
      <Container>
        <Title>Explore Skilled Professionals</Title>

        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by name or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SelectInput
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </SelectInput>
        </SearchContainer>

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
        ) : filteredWorkers && filteredWorkers.length > 0 ? (
          <Grid variants={containerVariants} initial="hidden" animate="show">
            {filteredWorkers.map((worker) => (
              <motion.div key={worker._id} variants={itemVariants}>
                <WorkerCard worker={worker} onClick={handleCardClick} />
              </motion.div>
            ))}
          </Grid>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
            No workers available at the moment.
          </div>
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
