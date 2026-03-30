import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import PageLayout from '../components/Common/PageLayout';
import TourGuide from '../components/Common/TourGuide';
import WorkerCard from '../components/Workers/WorkerCard';
import WorkerPopup from '../components/Workers/WorkerPopup';

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

const MascotContainer = styled(motion.div)`
  flex: 1;
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    max-width: 400px;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 20px rgba(76, 175, 80, 0.2));
  }
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

const SectionTitle = styled.h2`
  text-align: center;
  margin-top: 80px;
  margin-bottom: 40px;
  font-size: 2.2rem;
  color: var(--primary-color);
  background: linear-gradient(90deg, #81C784, #4CAF50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
`;

const JobRequestCard = styled.div`
  background: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  h4 {
    color: var(--text-main);
    margin-bottom: 5px;
    font-size: 1.2rem;
  }

  p {
    color: var(--text-muted);
    font-size: 0.95rem;
    margin-bottom: 15px;
    line-height: 1.5;
  }

  .budget {
    color: var(--primary-color);
    font-weight: bold;
    margin-bottom: 15px;
  }

  button {
    background: transparent;
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    padding: 8px 15px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;

    &:hover {
      background: var(--primary-color);
      color: white;
    }
  }
`;

const CallToAction = styled.div`
  text-align: center;
  margin: 60px 0;
  padding: 40px;
  background: rgba(76, 175, 80, 0.05);
  border: 1px dashed var(--primary-color);
  border-radius: 15px;

  h3 {
    color: var(--text-main);
    margin-bottom: 15px;
    font-size: 1.8rem;
  }
  p {
    color: var(--text-muted);
    margin-bottom: 25px;
  }
  a {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    padding: 12px 30px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.1rem;
    transition: background 0.3s ease;

    &:hover {
      background: var(--primary-hover);
    }
  }
`;

const Home = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);

  // FB feed state
  const [jobRequests, setJobRequests] = useState([
    { id: 1, title: 'Need a Plumber ASAP', desc: 'Broken pipe in the kitchen sink. Need immediate repair.', budget: '₱ 800 - ₱ 1,500', recommendations: 12 },
    { id: 2, title: 'React Developer for Startup', desc: 'Looking for a skilled MERN developer to build a booking app MVP.', budget: '₱ 15,000 - ₱ 25,000', recommendations: 5 },
    { id: 3, title: 'Virtual Assistant (Data Entry)', desc: 'Part-time VA needed to sort emails and enter data into Excel.', budget: '₱ 10,000 / month', recommendations: 20 },
    { id: 4, title: 'Carpenter for Custom Cabinet', desc: 'Looking for a master carpenter to build a custom bookshelf.', budget: '₱ 5,000 - ₱ 10,000', recommendations: 2 },
    { id: 5, title: 'Electrician needed for house rewiring', desc: 'Old house needs complete electrical rewiring.', budget: '₱ 20,000+', recommendations: 8 },
  ]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  const handleRecommend = (id) => {
    setJobRequests(prevJobs => {
      return prevJobs.map(job => {
        if (job.id === id) {
          return { ...job, recommendations: job.recommendations + 1 };
        }
        return job;
      }).sort((a, b) => b.recommendations - a.recommendations);
    });
  };

  const paginatedJobs = jobRequests.slice(0, page * itemsPerPage);

  useEffect(() => {
    // Check if tour should run (only once per session/visit)
    if (!localStorage.getItem('tourCompleted')) {
      setRunTour(true);
      localStorage.setItem('tourCompleted', 'true');
    }

    const fetchStatsAndWorkers = async () => {
      try {
        const [statsRes, workersRes] = await Promise.all([
          api.get('/stats'),
          api.get('/workers')
        ]);
        setTotalUsers(statsRes.data.totalUsers);
        setWorkers(Array.isArray(workersRes.data) ? workersRes.data.slice(0, 3) : []); // Only show top 3
      } catch (error) {
        console.error('Failed to fetch initial data', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatsAndWorkers();
  }, []);

  const handleCardClick = (worker) => {
    setSelectedWorker(worker);
    setIsPopupOpen(true);
  };

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
                <StatNumber>{(totalUsers || 0).toLocaleString()}+</StatNumber>
                <StatLabel>Registered Users Trust Us</StatLabel>
              </>
            )}
          </StatsSection>
        </Content>

        <MascotContainer
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.img
            src="/FC-logo.png"
            alt="FixConnect Mascot"
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
        </MascotContainer>
      </HeroSection>

      <SectionTitle>Top Available Professionals</SectionTitle>
      {workers.length > 0 ? (
        <Grid>
          {workers.map(worker => (
            <WorkerCard key={worker._id} worker={worker} onClick={handleCardClick} />
          ))}
        </Grid>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading professionals...</p>
      )}

      <SectionTitle>Recent Job Requests Feed</SectionTitle>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {paginatedJobs.map(job => (
          <JobRequestCard key={job.id} style={{ display: 'flex', flexDirection: 'column', padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h4>{job.title}</h4>
              <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{job.recommendations} Recommendations</span>
            </div>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '15px' }}>{job.desc}</p>
            <div className="budget" style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Budget: <span style={{ color: 'var(--primary-color)' }}>{job.budget}</span></div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-main)' }} onClick={() => handleRecommend(job.id)}>
                👍 Recommend
              </button>
              <button style={{ flex: 2, background: 'var(--primary-color)', color: 'white', border: 'none' }} onClick={() => setIsPopupOpen(true)}>
                View More / Apply
              </button>
            </div>
          </JobRequestCard>
        ))}
        {paginatedJobs.length < jobRequests.length && (
          <button
            style={{ padding: '15px', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
            onClick={() => setPage(p => p + 1)}
          >
            Load More Posts
          </button>
        )}
      </div>

      <CallToAction>
        <h3>Ready to streamline your workflow?</h3>
        <p>Join thousands of users and professionals who trust FixConnect to get things done securely and systematically.</p>
        <Link to="/book">Book a Service Now</Link>
      </CallToAction>

      <WorkerPopup
        worker={selectedWorker}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </PageLayout>
  );
};

export default Home;
