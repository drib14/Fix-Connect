import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axios';

const Container = styled.div`
  min-height: calc(100vh - 80px);
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormBox = styled(motion.div)`
  background: var(--bg-card);
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Title = styled.h2`
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 30px;
  font-size: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: var(--text-muted);
  margin-bottom: 8px;
  font-size: 0.95rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  option {
    background: var(--bg-card);
    color: var(--text-main);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const PriceDisplay = styled.div`
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid var(--primary-color);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;

  h3 {
    color: var(--text-main);
    font-size: 1.1rem;
    margin-bottom: 5px;
  }

  p {
    color: var(--primary-color);
    font-size: 1.5rem;
    font-weight: bold;
  }

  small {
    color: var(--text-muted);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled(motion.div)`
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  background: ${props => props.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
  color: ${props => props.success ? 'var(--primary-color)' : '#f44336'};
  border: 1px solid ${props => props.success ? 'var(--primary-color)' : '#f44336'};
`;

const BASE_PRICES = {
  'Plumber': 800,
  'Carpenter': 1000,
  'Electrician': 900,
  'Web Developer': 2500,
  'Virtual Assistant': 1500,
  'Graphic Designer': 2000,
  'Cleaner': 500
};

const Booking = () => {
  const [formData, setFormData] = useState({
    serviceCategory: '',
    date: '',
    time: '',
    address: '',
    details: ''
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const currentPrice = formData.serviceCategory ? BASE_PRICES[formData.serviceCategory] : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceCategory || !formData.date || !formData.time || !formData.address) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Simulate booking delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      await api.post('/bookings', {
        ...formData,
        price: currentPrice,
        userId: localStorage.getItem('userId') || null // send optional mock user ID if applicable
      });

      setStatus({ type: 'success', message: 'Booking confirmed! A professional will contact you soon.' });
      setFormData({ serviceCategory: '', date: '', time: '', address: '', details: '' }); // reset form
    } catch (error) {
      console.error('Booking failed:', error);
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to process booking. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>Book a Service</Title>

        <AnimatePresence>
          {status.message && (
            <StatusMessage
              success={status.type === 'success'}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {status.message}
            </StatusMessage>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>What service do you need?</Label>
            <Select
              name="serviceCategory"
              value={formData.serviceCategory}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a professional...</option>
              {Object.keys(BASE_PRICES).map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </Select>
          </InputGroup>

          <InputGroup style={{ flexDirection: 'row', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Label>Date</Label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Label>Time</Label>
              <Input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </InputGroup>

          <InputGroup>
            <Label>Complete Address</Label>
            <Textarea
              name="address"
              placeholder="House/Unit No., Street, Barangay, City/Municipality, Province"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Additional Details (Optional)</Label>
            <Textarea
              name="details"
              placeholder="Describe the issue or any specific requirements..."
              value={formData.details}
              onChange={handleChange}
            />
          </InputGroup>

          <AnimatePresence>
            {currentPrice > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <PriceDisplay>
                  <h3>Estimated Base Price</h3>
                  <p>₱ {currentPrice.toLocaleString()}</p>
                  <small>Final price may vary based on actual assessment.</small>
                </PriceDisplay>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </form>
      </FormBox>
    </Container>
  );
};

export default Booking;
