import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import PageLayout from '../components/Common/PageLayout';
import TourGuide from '../components/Common/TourGuide';
import WorkerPopup from '../components/Workers/WorkerPopup';
import HireContractModal from '../components/Contracts/HireContractModal';

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

  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobPopupOpen, setIsJobPopupOpen] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [contractPost, setContractPost] = useState(null);

  // FB feed state
  const [jobRequests, setJobRequests] = useState([]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };
  const [recommendedJobs, setRecommendedJobs] = useState(() => {
    const saved = localStorage.getItem('recommendedJobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  const handleRecommend = (id) => {
    if (recommendedJobs.includes(id)) {
      // Retract recommendation
      const newRecommendedJobs = recommendedJobs.filter(jobId => jobId !== id);
      setRecommendedJobs(newRecommendedJobs);
      localStorage.setItem('recommendedJobs', JSON.stringify(newRecommendedJobs));

      setJobRequests(prevJobs => {
        return prevJobs.map(job => {
          if (job.id === id) {
            return { ...job, recommendations: Math.max(0, job.recommendations - 1) };
          }
          return job;
        }).sort((a, b) => b.recommendations - a.recommendations);
      });
    } else {
      // Add recommendation
      const newRecommendedJobs = [...recommendedJobs, id];
      setRecommendedJobs(newRecommendedJobs);
      localStorage.setItem('recommendedJobs', JSON.stringify(newRecommendedJobs));

      setJobRequests(prevJobs => {
        return prevJobs.map(job => {
          if (job.id === id) {
            return { ...job, recommendations: job.recommendations + 1 };
          }
          return job;
        }).sort((a, b) => b.recommendations - a.recommendations);
      });
    }
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
        const [statsRes, workersRes, postsRes] = await Promise.all([
          api.get('/stats'),
          api.get('/workers'),
          api.get('/service-posts')
        ]);
        setTotalUsers(statsRes.data.totalUsers);
        setWorkers(Array.isArray(workersRes.data) ? workersRes.data.slice(0, 3) : []); // Only show top 3

        // Map ServicePosts to jobRequests feed format, only showing Hire type
        const fetchedPosts = postsRes.data
          .filter(post => post.type === 'Hire')
          .map(post => ({
            id: post._id,
            title: post.title,
            desc: post.description,
            budget: `₱ ${post.price?.toLocaleString()} / ${post.rateType}`,
            recommendations: post.recommendations || 0,
            postedAt: new Date(post.createdAt).toLocaleDateString(),
            poster: post.workerId?.name || 'Unknown Worker',
            type: post.type, // 'Booking' or 'Hire'
            imageUrl: post.imageUrl
          }));
        setJobRequests(fetchedPosts);

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

      <SectionTitle style={{ marginTop: '40px' }}>Service Posts</SectionTitle>
      <Grid style={{ maxWidth: '1000px', margin: '0 auto 60px auto' }}>
        {paginatedJobs.length === 0 && !loadingStats ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No service posts available yet. Be the first to post!</p>
        ) : paginatedJobs.map(job => (
          <JobRequestCard key={job.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {getInitials(job.poster)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{job.poster}</h4>
                  <h5 style={{ margin: 0, fontWeight: 'normal', color: 'var(--primary-color)' }}>{job.title}</h5>
                  <small style={{ color: 'var(--text-muted)' }}>{job.postedAt}</small>
                </div>
              </div>
              <span style={{ background: job.type === 'Booking' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(33, 150, 243, 0.2)', color: job.type === 'Booking' ? '#4CAF50' : '#2196F3', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {job.type}
              </span>
            </div>

            {job.imageUrl && (
              <div style={{ margin: '15px 0', borderRadius: '8px', overflow: 'hidden', height: '200px' }}>
                <img src={job.imageUrl} alt={job.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '15px', flexGrow: 1 }}>{job.desc}</p>
            <div className="budget" style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Rate: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{job.budget}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
               <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{job.recommendations} Recommendations</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ flex: 1, background: 'transparent', border: 'none', color: recommendedJobs.includes(job.id) ? 'var(--primary-color)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleRecommend(job.id)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                {recommendedJobs.includes(job.id) ? 'Recommended' : 'Recommend'}
              </button>

              <div style={{ flex: 1, textDecoration: 'none' }}>
                <button
                  onClick={() => {
                    setContractPost(job);
                    setShowContract(true);
                  }}
                  style={{ width: '100%', background: job.type === 'Booking' ? 'var(--primary-color)' : '#2196F3', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {job.type === 'Booking' ? 'Book Now' : 'Hire Now'}
                </button>
              </div>
            </div>
          </JobRequestCard>
        ))}
      </Grid>

      {paginatedJobs.length < jobRequests.length && (
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <button
            style={{ padding: '12px 30px', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s ease' }}
            onClick={() => setPage(p => p + 1)}
            onMouseOver={(e) => { e.target.style.background = 'var(--primary-color)'; e.target.style.color = 'white'; }}
            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--primary-color)'; }}
          >
            Load More Posts
          </button>
        </div>
      )}

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

      {isJobPopupOpen && selectedJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setIsJobPopupOpen(false)}>
          <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '12px', maxWidth: '600px', width: '90%', border: '1px solid var(--primary-color)' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>{selectedJob.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>{selectedJob.desc}</p>
            <div style={{ marginBottom: '20px' }}>
              <strong>Budget: </strong><span style={{ color: 'var(--primary-color)' }}>{selectedJob.budget}</span>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Recommendations: </strong><span style={{ color: 'var(--text-main)' }}>{selectedJob.recommendations}</span>
            </div>
            <button style={{ width: '100%', padding: '12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsJobPopupOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showContract && contractPost && (
        <HireContractModal onClose={() => setShowContract(false)} servicePost={contractPost} />
      )}
    </PageLayout>
  );
};

export default Home;
