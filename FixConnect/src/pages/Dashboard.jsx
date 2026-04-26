import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import Navbar from '../components/Common/Navbar';

const Container = styled.div`
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: var(--primary-color);
  font-size: 2.5rem;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: var(--text-muted);
  font-size: 1.1rem;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const BookingCard = styled(motion.div)`
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const BookingInfo = styled.div`
  flex: 1;
`;

const ServiceName = styled.h3`
  font-size: 1.4rem;
  color: var(--text-main);
  margin-bottom: 8px;
`;

const Detail = styled.p`
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 5px;

  strong {
    color: var(--text-main);
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${props => props.$status === 'Pending' ? 'rgba(255, 152, 0, 0.1)' : props.$status === 'Confirmed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)'};
  color: ${props => props.$status === 'Pending' ? '#ff9800' : props.$status === 'Confirmed' ? '#4CAF50' : '#9e9e9e'};
  border: 1px solid ${props => props.$status === 'Pending' ? '#ff9800' : props.$status === 'Confirmed' ? '#4CAF50' : '#9e9e9e'};
`;

const ActionSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;

  @media (max-width: 768px) {
    align-items: flex-start;
    width: 100%;
  }
`;

const TotalAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
`;

const PayButton = styled.a`
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 8px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: opacity 0.3s;
  text-align: center;

  &:hover {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px;
  color: var(--text-muted);
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px dashed rgba(255,255,255,0.2);
`;

const TabContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
`;

const Tab = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.$active ? 'var(--primary-color)' : 'var(--text-muted)'};
  font-size: 1.1rem;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  cursor: pointer;
  position: relative;
  padding: 5px 10px;

  &:after {
    content: '';
    display: ${props => props.$active ? 'block' : 'none'};
    position: absolute;
    bottom: -16px;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--primary-color);
  }
`;

const ViewButton = styled.button`
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-color);
    color: white;
  }
`;

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Immediately parse role from localStorage so UI doesn't flash user-mode first
  const initialIsWorker = localStorage.getItem('role') === 'worker' || localStorage.getItem('role') === 'admin';
  const [isWorker, setIsWorker] = useState(initialIsWorker);
  const [activeTab, setActiveTab] = useState(initialIsWorker ? 'JobPool' : 'Active');
  const [workerSettings, setWorkerSettings] = useState({ isOnline: true, travelRadius: 15 });

  const fetchWorkerSettings = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await axios.get('/api/workers/me', { headers: { Authorization: `Bearer ${token}` } });
          if (res.data) {
              setWorkerSettings({ isOnline: res.data.isOnline ?? true, travelRadius: res.data.travelRadius ?? 15 });
          }
      } catch (err) {
          console.error("Failed to load worker settings", err);
      }
  };

  const updateWorkerSettings = async (field, value) => {
      try {
          const token = localStorage.getItem('token');
          setWorkerSettings(prev => ({ ...prev, [field]: value }));
          await axios.put('/api/workers/settings', { [field]: value }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
          console.error("Failed to update setting", err);
      }
  };

  const fetchAvailableJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/bookings/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableJobs(res.data);
    } catch(err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setBookings([]);
        setLoading(false);
        return;
      }
      const response = await api.get(`/bookings/user/${userId}`);
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
        if (isWorker) {
            await fetchWorkerSettings();
            if (activeTab === 'JobPool') {
                await fetchAvailableJobs();
            }
        }
        await fetchBookings();
    };
    initializeDashboard();
  }, []);

  useEffect(() => {
    // Setup polling for live job pool updates
    let interval;
    if (isWorker && activeTab === 'JobPool') {
        interval = setInterval(() => {
            fetchAvailableJobs();
        }, 5000);
    }
    return () => clearInterval(interval);
  }, [isWorker, activeTab]);

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'Active') {
      return ['Searching', 'Pending', 'Confirmed', 'In Progress'].includes(booking.status);
    } else if (activeTab === 'Completed') {
      return booking.status === 'Completed';
    } else {
      return booking.status === 'Cancelled';
    }
  });

  const handleAcceptJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/bookings/${jobId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Job accepted!');
      fetchAvailableJobs();
      fetchBookings();
      setActiveTab('Active');
    } catch(err) {
      alert(err.response?.data?.message || 'Failed to accept job.');
      fetchAvailableJobs(); // Refresh to see if it's already taken
    }
  };

  return (
    <>
    <Navbar />
    <Container>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <Title>Your Dashboard</Title>
            <Subtitle>Track your service requests, payments, and system processes.</Subtitle>
          </div>
          {isWorker && (
            <div style={{ background: 'var(--bg-card)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', minWidth: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status:</span>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ position: 'relative' }}>
                    <input type="checkbox" className="sr-only" checked={workerSettings.isOnline} onChange={(e) => updateWorkerSettings('isOnline', e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${workerSettings.isOnline ? 'bg-emerald-500' : 'bg-gray-600'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${workerSettings.isOnline ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span style={{ marginLeft: '10px', fontSize: '0.9rem', fontWeight: 'bold', color: workerSettings.isOnline ? '#10b981' : '#9ca3af' }}>
                    {workerSettings.isOnline ? 'Online' : 'Offline'}
                  </span>
                </label>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Work Radius</span>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>{workerSettings.travelRadius} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={workerSettings.travelRadius}
                  onChange={(e) => updateWorkerSettings('travelRadius', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>
            </div>
          )}
        </div>
      </Header>

      <TabContainer>
        <Tab $active={activeTab === 'JobPool'} onClick={() => { setActiveTab('JobPool'); if(isWorker) fetchAvailableJobs(); }}>{isWorker ? 'Job Pool (Pro)' : 'Find Services'}</Tab>
        <Tab $active={activeTab === 'Active'} onClick={() => setActiveTab('Active')}>Active</Tab>
        <Tab $active={activeTab === 'Completed'} onClick={() => setActiveTab('Completed')}>Completed</Tab>
        <Tab $active={activeTab === 'Cancelled'} onClick={() => setActiveTab('Cancelled')}>Cancelled</Tab>
        {isWorker && (
          <Tab onClick={() => window.location.href = '/worker/earnings'} style={{ marginLeft: 'auto', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '8px' }}>
            My Earnings
          </Tab>
        )}
      </TabContainer>

      {activeTab === 'JobPool' && !isWorker ? (
          <EmptyState style={{ marginTop: '40px' }}>
             <h3>Need a FixConnect Pro?</h3>
             <p>Book your service now and track your worker in real-time.</p>
             <ViewButton style={{ marginTop: '20px', background: 'var(--primary-color)', color: 'white', border: 'none' }} onClick={() => navigate('/')}>Create Booking</ViewButton>
          </EmptyState>
      ) : activeTab === 'JobPool' && isWorker ? (
        <CardGrid>
          {availableJobs.length === 0 ? (
            <EmptyState style={{ background: 'transparent', border: 'none', minHeight: '300px' }}>
                <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 20px auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid rgba(16, 185, 129, 0.5)', borderRadius: '50%', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                    <div style={{ position: 'absolute', width: '70%', height: '70%', border: '2px solid rgba(16, 185, 129, 0.8)', borderRadius: '50%', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', animationDelay: '0.5s' }}></div>
                    <div style={{ width: '30%', height: '30%', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 20px #10b981' }}></div>
                </div>
                <h3 style={{ color: '#10b981' }}>Radar is Active</h3>
                <p>Scanning a {workerSettings.travelRadius}km radius for new service requests...</p>
            </EmptyState>
          ) : availableJobs.map((job) => (
            <BookingCard key={job._id} style={{ borderLeft: '4px solid #10b981', background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0.2) 100%)' }}>
              <BookingInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <ServiceName style={{ color: 'white', fontSize: '1.4rem' }}>{job.serviceCategory}</ServiceName>
                  <StatusBadge $status="urgent" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>NEW JOB</StatusBadge>
                </div>
                <Detail><strong>Distance:</strong> {job.distance ? `${job.distance.toFixed(1)} km away` : 'Nearby'}</Detail>
                <Detail><strong>Client:</strong> {job.userId?.name || 'Guest'}</Detail>
                <Detail><strong>Requested:</strong> {new Date(job.createdAt).toLocaleString()}</Detail>
                <Detail><strong>Address:</strong> {job.address}</Detail>

                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'inline-block' }}>
                    <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>Estimated Net: ₱ {(job.price * 0.80).toLocaleString()}</strong>
                </div>
              </BookingInfo>
              <ActionSection style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                <ViewButton onClick={() => handleAcceptJob(job._id)} style={{ background: '#10b981', border: 'none', color: 'white', fontSize: '1.1rem', padding: '15px 30px', fontWeight: 'bold', width: '100%', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                  Accept Now
                </ViewButton>
              </ActionSection>
            </BookingCard>
          ))}
        </CardGrid>
      ) : loading ? (
        <div style={{ textAlign: 'center', color: 'var(--primary-color)' }}>Loading your history...</div>
      ) : filteredBookings && filteredBookings.length > 0 ? (
        <CardGrid>
          {filteredBookings.map((booking, index) => (
            <BookingCard
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BookingInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <ServiceName>{booking.serviceCategory}</ServiceName>
                  <StatusBadge $status={booking.status}>{booking.status}</StatusBadge>
                  {isWorker && booking.workerId?.userId === localStorage.getItem('userId') && (
                    <span style={{ fontSize: '0.8rem', background: 'rgba(33, 150, 243, 0.2)', color: '#2196F3', padding: '4px 8px', borderRadius: '4px' }}>Worker View</span>
                  )}
                </div>
                <Detail><strong>Requested:</strong> {new Date(booking.createdAt).toLocaleString()}</Detail>
                <Detail><strong>Address:</strong> {booking.address}</Detail>

                {isWorker && booking.workerId?.userId === localStorage.getItem('userId') ? (
                  <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: 'var(--text-main)', marginBottom: '10px', fontSize: '0.9rem' }}>Earnings Breakdown:</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Base Price:</span> <span>₱ {booking.price?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Tax Paid By User (12%):</span> <span>₱ {booking.tax?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ff5252' }}>
                      <span>Platform Commission (-20%):</span> <span>- ₱ {(booking.price * 0.20).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#4CAF50', fontWeight: 'bold', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <span>Net Earnings:</span> <span>₱ {(booking.price * 0.80).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <Detail style={{ marginTop: '10px', color: 'var(--primary-color)', fontSize: '0.85rem' }}>
                    {booking.status === 'Pending' ? "System Process: Awaiting Payment Confirmation. Please pay to dispatch worker." : "System Process: Worker dispatch in progress."}
                  </Detail>
                )}
              </BookingInfo>
              <ActionSection>
                <TotalAmount>
                  {isWorker && booking.workerId?.userId === localStorage.getItem('userId')
                    ? `₱ ${(booking.price * 0.80).toLocaleString()}`
                    : `₱ ${booking.totalAmount?.toLocaleString()}`}
                </TotalAmount>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {isWorker && booking.workerId?.userId === localStorage.getItem('userId') ? 'Net Earning' : 'Total Paid'}
                </div>
                {booking.status === 'Pending' && booking.paymentUrl && (!isWorker || booking.workerId?.userId !== localStorage.getItem('userId')) ? (
                  <PayButton href={booking.paymentUrl} target="_blank" rel="noopener noreferrer">
                    Pay Now
                  </PayButton>
                ) : (
                  <ViewButton onClick={() => navigate(`/booking/${booking._id}`)}>
                    View Tracker
                  </ViewButton>
                )}
              </ActionSection>
            </BookingCard>
          ))}
        </CardGrid>
      ) : (
        <EmptyState>
          <h3>No bookings yet.</h3>
          <p>Book a skilled professional today to see your transaction history here.</p>
        </EmptyState>
      )}
    </Container>
    </>
  );
};

export default Dashboard;
