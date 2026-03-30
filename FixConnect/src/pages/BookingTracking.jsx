import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../utils/axios';
import PageLayout from '../components/Common/PageLayout';
import ReviewModal from '../components/ReviewModal';

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Title = styled.h2`
  color: var(--primary-color);
  margin-bottom: 30px;
`;

const TimelineContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 50px;
  padding: 0 20px;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 40px;
    right: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    z-index: 0;
    transform: translateY(-50%);
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const Circle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.active ? 'var(--primary-color)' : 'var(--bg-main)'};
  border: 4px solid ${props => props.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'};
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: ${props => props.active ? '#fff' : 'var(--text-muted)'};
  margin-bottom: 10px;
  transition: all 0.3s;
`;

const StepLabel = styled.span`
  color: ${props => props.active ? 'var(--text-main)' : 'var(--text-muted)'};
  font-size: 0.9rem;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

const DetailsBox = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 10px;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const Label = styled.span`
  color: var(--text-muted);
`;

const Value = styled.span`
  color: var(--text-main);
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: ${props => props.variant === 'outline' ? 'transparent' : 'var(--primary-color)'};
  border: ${props => props.variant === 'outline' ? '1px solid var(--text-muted)' : 'none'};
  color: ${props => props.variant === 'outline' ? 'var(--text-main)' : 'white'};
`;

const STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Completed'];

const BookingTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    // In a real app we'd have a GET /bookings/:id
    // But since we only have getUserBookings, let's fetch those and find it.
    const fetchBooking = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await api.get(`/bookings/user/${userId}`);
        const found = response.data.find(b => b._id === id);
        setBooking(found);
      } catch (error) {
        console.error('Error fetching booking tracking', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleMockStatusUpdate = async () => {
    if (!booking) return;
    const currentIndex = STATUSES.indexOf(booking.status);
    if (currentIndex < STATUSES.length - 1) {
      const nextStatus = STATUSES[currentIndex + 1];
      try {
        const res = await api.put(`/bookings/${id}/status`, { status: nextStatus });
        setBooking(res.data.booking);
        if (nextStatus === 'Completed') {
          setIsReviewModalOpen(true);
        }
      } catch (err) {
        console.error('Failed to update status', err);
      }
    }
  };

  if (loading) return <PageLayout><Container>Loading tracking info...</Container></PageLayout>;
  if (!booking) return <PageLayout><Container>Booking not found.</Container></PageLayout>;

  const currentStepIndex = STATUSES.indexOf(booking.status);

  return (
    <PageLayout>
      <Container>
        <Title>Track Booking #{booking._id.substring(0, 8)}</Title>

        <TimelineContainer>
          {STATUSES.map((status, index) => (
            <Step key={status}>
              <Circle active={index <= currentStepIndex}>
                {index < currentStepIndex ? '✓' : index + 1}
              </Circle>
              <StepLabel active={index <= currentStepIndex}>{status}</StepLabel>
            </Step>
          ))}
        </TimelineContainer>

        <DetailsBox>
          <DetailRow>
            <Label>Service</Label>
            <Value>{booking.serviceCategory}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Date & Time</Label>
            <Value>{booking.date} at {booking.time}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Address</Label>
            <Value>{booking.address}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Total Amount</Label>
            <Value>₱ {booking.totalAmount?.toLocaleString()}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Payment Type</Label>
            <Value style={{ textTransform: 'capitalize' }}>{booking.paymentType}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Payment Method</Label>
            <Value>{booking.paymentMethod}</Value>
          </DetailRow>
        </DetailsBox>

        <ButtonGroup>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
            <Button onClick={handleMockStatusUpdate}>
              Mock Update Status (Admin)
            </Button>
          )}
          {booking.status === 'Completed' && (
            <Button onClick={() => setIsReviewModalOpen(true)}>Leave a Review</Button>
          )}
        </ButtonGroup>
      </Container>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        workerId={booking.workerId._id || booking.workerId}
        bookingId={booking._id}
        onSuccess={() => console.log('Review submitted successfully')}
      />
    </PageLayout>
  );
};

export default BookingTracking;
