import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/Common/PageLayout';
import api from '../utils/axios';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 30px;
`;

const FormCard = styled(motion.div)`
  background: var(--bg-card);
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$active ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)'};
  transition: background 0.3s ease;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: white;
  &:focus { outline: none; border-color: var(--primary-color); }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: white;
  min-height: 100px;
  resize: vertical;
  &:focus { outline: none; border-color: var(--primary-color); }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  background: ${props => props.variant === 'outline' ? 'transparent' : 'var(--primary-color)'};
  color: ${props => props.variant === 'outline' ? 'var(--text-main)' : 'white'};
  border: ${props => props.variant === 'outline' ? '1px solid var(--text-muted)' : 'none'};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorMsg = styled.div`
  color: #ff5252;
  margin-bottom: 20px;
  text-align: center;
`;

const ApplyWorker = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    jobsOffered: '',
    dailyRate: '',
    monthlyRate: '',
    oneTimeRate: '',
    documents: null
  });

  const nextStep = () => {
    setDirection(1);
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('category', formData.category);
      payload.append('description', formData.description);
      payload.append('jobsOffered', formData.jobsOffered);
      if (formData.dailyRate) payload.append('dailyRate', formData.dailyRate);
      if (formData.monthlyRate) payload.append('monthlyRate', formData.monthlyRate);
      if (formData.oneTimeRate) payload.append('oneTimeRate', formData.oneTimeRate);
      if (formData.documents) {
        payload.append('documents', formData.documents);
      }

      const token = localStorage.getItem('token');
      await api.post('/workers', payload, {
        headers: {
          Authorization: `Bearer ${token}`
          // Let the browser set the content type with the proper boundary
        }
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  if (success) {
    return (
      <PageLayout>
        <Container>
          <FormCard initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '50px 20px' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>Application Submitted!</h2>
            <p style={{ color: 'var(--text-muted)' }}>We are reviewing your profile and documents. You will be redirected shortly...</p>
          </FormCard>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container>
        <Title>Join as a Professional</Title>
        <StepIndicator>
          {[1, 2, 3].map(i => (
            <Dot key={i} $active={step >= i} />
          ))}
        </StepIndicator>

        <div style={{ position: 'relative', height: '450px' }}>
          <AnimatePresence initial={false} custom={direction}>
            <FormCard
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              style={{ position: 'absolute', width: '100%', top: 0, left: 0 }}
            >
              {error && <ErrorMsg>{error}</ErrorMsg>}

              {step === 1 && (
                <div>
                  <h3 style={{ marginBottom: '20px' }}>Basic Information</h3>
                  <InputGroup>
                    <Label>Full Name</Label>
                    <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Juan Dela Cruz" />
                  </InputGroup>
                  <InputGroup>
                    <Label>Job Category</Label>
                    <Input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Plumber, Virtual Assistant" />
                  </InputGroup>
                  <InputGroup>
                    <Label>Services Offered (comma separated)</Label>
                    <Input type="text" name="jobsOffered" value={formData.jobsOffered} onChange={handleChange} placeholder="e.g. Pipe Leak Repair, Drain Cleaning" />
                  </InputGroup>
                  <ButtonRow>
                    <div />
                    <Button onClick={nextStep} disabled={!formData.name || !formData.category}>Next Step</Button>
                  </ButtonRow>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 style={{ marginBottom: '20px' }}>Pricing & Rates</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>Leave blank if a rate type does not apply to your service.</p>
                  <InputGroup>
                    <Label>Daily Rate (₱)</Label>
                    <Input type="number" name="dailyRate" value={formData.dailyRate} onChange={handleChange} placeholder="e.g. 1500" />
                  </InputGroup>
                  <InputGroup>
                    <Label>Monthly Rate (₱)</Label>
                    <Input type="number" name="monthlyRate" value={formData.monthlyRate} onChange={handleChange} placeholder="e.g. 25000" />
                  </InputGroup>
                  <InputGroup>
                    <Label>One-Time Base Fee (₱)</Label>
                    <Input type="number" name="oneTimeRate" value={formData.oneTimeRate} onChange={handleChange} placeholder="e.g. 800" />
                  </InputGroup>
                  <ButtonRow>
                    <Button variant="outline" onClick={prevStep}>Back</Button>
                    <Button onClick={nextStep} disabled={!formData.dailyRate && !formData.monthlyRate && !formData.oneTimeRate}>Next Step</Button>
                  </ButtonRow>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 style={{ marginBottom: '20px' }}>Verification & Details</h3>
                  <InputGroup>
                    <Label>Professional Bio / Description</Label>
                    <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your experience and skills..." />
                  </InputGroup>
                  <InputGroup>
                    <Label>Upload Valid ID / Certificates</Label>
                    <Input type="file" name="documents" onChange={handleChange} accept="image/*,.pdf" />
                  </InputGroup>
                  <ButtonRow>
                    <Button variant="outline" onClick={prevStep}>Back</Button>
                    <Button onClick={handleSubmit} disabled={loading || !formData.description}>
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </ButtonRow>
                </div>
              )}
            </FormCard>
          </AnimatePresence>
        </div>
      </Container>
    </PageLayout>
  );
};

export default ApplyWorker;
