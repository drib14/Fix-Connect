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
  const [activeTab, setActiveTab] = useState('Active');
  const navigate = useNavigate();
  const [isWorker, setIsWorker] = useState(false);

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
    // Check if user is a worker efficiently
    const checkWorkerStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/workers/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data._id) {
          setIsWorker(true);
        }
      } catch(err) {
        // 404 means they are not a worker, which is fine
        if (err.response && err.response.status !== 404) {
          console.error('Failed to check worker status:', err);
        }
      }
    }
    checkWorkerStatus();
    fetchBookings();
  }, []);

  useEffect(() => {
    // Setup polling for live job pool updates
    const interval = setInterval(() => {
        if (isWorker && activeTab === 'JobPool') fetchAvailableJobs();
    }, 5000);
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
        <Title>Your Dashboard</Title>
        <Subtitle>Track your service requests, payments, and system processes.</Subtitle>
      </Header>

      <TabContainer>
        <Tab $active={activeTab === 'Active'} onClick={() => setActiveTab('Active')}>Active</Tab>
        <Tab $active={activeTab === 'Completed'} onClick={() => setActiveTab('Completed')}>Completed</Tab>
        <Tab $active={activeTab === 'Cancelled'} onClick={() => setActiveTab('Cancelled')}>Cancelled</Tab>
        {isWorker && (
          <Tab $active={activeTab === 'JobPool'} onClick={() => { setActiveTab('JobPool'); fetchAvailableJobs(); }}>Job Pool</Tab>
        )}
      </TabContainer>

      {activeTab === 'JobPool' ? (
        <CardGrid>
          {availableJobs.length === 0 ? (
            <EmptyState>
              <h3>No jobs available.</h3>
              <p>We are searching the network. New job requests in your category will appear here.</p>
            </EmptyState>
          ) : availableJobs.map((job) => (
            <BookingCard key={job._id}>
              <BookingInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <ServiceName>{job.serviceCategory}</ServiceName>
                  <StatusBadge $status={job.status}>{job.status}</StatusBadge>
                </div>
                <Detail><strong>Client:</strong> {job.userId?.name || 'Guest'}</Detail>
                <Detail><strong>Date:</strong> {job.date}</Detail>
                <Detail><strong>Time:</strong> {job.time}</Detail>
                <Detail><strong>Address:</strong> {job.address}</Detail>
                <Detail><strong>Total Value:</strong> ₱ {job.price?.toLocaleString()}</Detail>
              </BookingInfo>
              <ActionSection>
                <ViewButton onClick={() => handleAcceptJob(job._id)} style={{ background: '#2196F3', border: 'none', color: 'white' }}>
                  Accept Job
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
                <Detail><strong>Date:</strong> {booking.date}</Detail>
                <Detail><strong>Time:</strong> {booking.time}</Detail>
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
