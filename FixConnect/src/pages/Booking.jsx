import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axios';
import Navbar from '../components/Common/Navbar';

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

const PaymentMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const PaymentCard = styled.div`
  background: ${props => props.selected ? 'rgba(76, 175, 80, 0.15)' : 'var(--bg-card)'};
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'};
  border-radius: 12px;
  padding: 15px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    border-color: var(--primary-color);
    background: rgba(76, 175, 80, 0.05);
  }

  img {
    height: 30px;
    object-fit: contain;
  }

  span {
    color: var(--text-main);
    font-size: 0.9rem;
    font-weight: 600;
  }
`;

const PAYMENT_OPTIONS = [
  { id: 'PayMongo', name: 'Online Payment (PayMongo, GCash, Maya, Cards)', icon: 'https://cdn-icons-png.flaticon.com/512/6001/6001368.png' },
  { id: 'Cash', name: 'Cash', icon: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' }
];

const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [formData, setFormData] = useState({
    workerId: '',
    serviceCategory: '',
    date: '',
    time: '',
    address: '',
    details: '',
    paymentMethod: 'PayMongo',
    paymentType: 'one-time'
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [paymentLink, setPaymentLink] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await api.get('/workers');
        setWorkers(response.data);

        // Auto-select worker if passed via query param (e.g. from Hire Contract)
        const presetWorkerId = searchParams.get('workerId');
        if (presetWorkerId) {
          const worker = response.data.find(w => w._id === presetWorkerId);
          if (worker) {
            setFormData(prev => ({
              ...prev,
              workerId: worker._id,
              serviceCategory: worker.category
            }));
            const rateInfo = getWorkerRate(worker);
            setCurrentPrice(rateInfo.price);
          }
        }
      } catch (error) {
        console.error('Failed to fetch workers:', error);
      }
    };
    fetchWorkers();
  }, [searchParams]);
  const currentTax = currentPrice * 0.12;
  const currentTotal = currentPrice + currentTax;

  const getWorkerRate = (worker) => {
    if (worker.oneTimeRate) return { price: worker.oneTimeRate, type: 'One-time' };
    if (worker.dailyRate) return { price: worker.dailyRate, type: 'Daily' };
    if (worker.monthlyRate) return { price: worker.monthlyRate, type: 'Monthly' };
    return { price: 0, type: 'Unknown' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'workerId') {
      const selectedWorker = workers.find(w => w._id === value);
      if (selectedWorker) {
        const { price } = getWorkerRate(selectedWorker);
        setFormData(prev => ({
          ...prev,
          workerId: value,
          serviceCategory: selectedWorker.category
        }));
        setCurrentPrice(price);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workerId || !formData.date || !formData.time || !formData.address) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });
    setPaymentLink(''); // Reset payment link

    try {
      // Simulate booking delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const selectedWorker = workers.find(w => w._id === formData.workerId);
      const rateInfo = getWorkerRate(selectedWorker);
      const payload = {
        ...formData,
        price: currentPrice,
        paymentType: rateInfo.type.toLowerCase(),
        userId: localStorage.getItem('userId') // Remove fallback string that breaks ObjectId cast
      };

      const response = await api.post('/bookings', payload);

      if (response.data.booking?.paymentUrl && (formData.paymentMethod === 'PayMongo' || formData.paymentMethod === 'GCash' || formData.paymentMethod === 'Maya' || formData.paymentMethod === 'Credit / Debit')) {
        setPaymentLink(response.data.booking.paymentUrl);
        setStatus({ type: 'success', message: 'Booking submitted! Proceed to payment to confirm your professional.' });
      } else {
        setStatus({ type: 'success', message: 'Booking confirmed! Redirecting to Dashboard...' });
        // Redirect to dashboard after a brief delay so they see the success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to process booking. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
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
            <Label>Select Job Category</Label>
            <Select
              name="categoryFilter"
              value={formData.serviceCategory || ''}
              onChange={(e) => {
                const category = e.target.value;
                setFormData(prev => ({ ...prev, serviceCategory: category, workerId: '' }));
                setCurrentPrice(0);
              }}
              required
            >
              <option value="" disabled>Choose a job category...</option>
              {Array.from(new Set(workers.map(w => w.category))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </InputGroup>

          {formData.serviceCategory && (
            <InputGroup>
              <Label>Select Professional (Prices based on {formData.serviceCategory})</Label>
              <PaymentMethodsGrid style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {workers.filter(w => w.category === formData.serviceCategory).map(worker => {
                  const rateInfo = getWorkerRate(worker);
                  return (
                    <PaymentCard
                      key={worker._id}
                      selected={formData.workerId === worker._id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, workerId: worker._id }));
                        setCurrentPrice(rateInfo.price);
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
                    >
                      <strong>{worker.name}</strong>
                      <span style={{ color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        ₱{rateInfo.price.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Rate: {rateInfo.type}
                      </span>
                    </PaymentCard>
                  );
                })}
              </PaymentMethodsGrid>
            </InputGroup>
          )}

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

          {/* Payment Type is now determined by the worker's rateType */}

          <InputGroup>
            <Label>Payment Method</Label>
            <PaymentMethodsGrid>
              {PAYMENT_OPTIONS.map(option => (
                <PaymentCard
                  key={option.id}
                  selected={formData.paymentMethod === option.id}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: option.id }))}
                >
                  <img src={option.icon} alt={option.name} />
                  <span>{option.name}</span>
                </PaymentCard>
              ))}
            </PaymentMethodsGrid>
          </InputGroup>

          <AnimatePresence>
            {currentPrice > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <PriceDisplay>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Base Price:</span>
                    <span style={{ color: 'var(--text-main)' }}>₱ {currentPrice.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tax (12%):</span>
                    <span style={{ color: 'var(--text-main)' }}>₱ {currentTax.toLocaleString()}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                    <h3>Total Amount Due</h3>
                    <p>₱ {currentTotal.toLocaleString()}</p>
                  </div>
                </PriceDisplay>
              </motion.div>
            )}
          </AnimatePresence>

          {!paymentLink ? (
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Book Service'}
            </Button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Button type="button" onClick={() => window.open(paymentLink, '_blank')} style={{ background: '#4CAF50', width: '100%' }}>
                Pay via PayMongo checkout page
              </Button>
              <Button type="button" onClick={() => navigate('/dashboard')} style={{ background: 'var(--bg-card)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', width: '100%' }}>
                View Dashboard
              </Button>
            </div>
          )}
        </form>

        {paymentLink && (
          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>What's Next? Systematize Process:</h4>
            <ol style={{ color: 'var(--text-muted)', marginLeft: '20px', lineHeight: '1.6' }}>
              <li><strong>Pay the Total Amount:</strong> Click the button above to safely complete your payment via {formData.paymentMethod}.</li>
              <li><strong>Confirmation:</strong> Once paid, your booking status will update to "Confirmed".</li>
              <li><strong>Worker Dispatch:</strong> A highly skilled professional will be assigned and dispatched to your address on the scheduled date.</li>
              <li><strong>Job Completion:</strong> Review the work and mark the job as completed in your Dashboard.</li>
            </ol>
          </div>
        )}
      </FormBox>
    </Container>
    </>
  );
};

export default Booking;
