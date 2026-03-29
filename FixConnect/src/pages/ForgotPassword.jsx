import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import OtpInput from '../components/Auth/OtpInput';
import {
  Container,
  FormBox,
  Title,
  InputGroup,
  Input,
  Button,
  ErrorMsg,
  LinkText,
} from '../components/Auth/AuthStyles';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>{step === 1 ? 'Forgot Password' : 'Enter OTP'}</Title>
        {error && <ErrorMsg>{error}</ErrorMsg>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              Enter your email address to receive a 6-digit verification code.
            </p>
            <InputGroup>
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputGroup>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              Code sent to <strong>{email}</strong>
            </p>
            <OtpInput length={6} onComplete={(val) => setOtp(val)} />
            <Button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>
        )}

        <LinkText>
          Remembered your password? <Link to="/login">Log In</Link>
        </LinkText>
      </FormBox>
    </Container>
  );
};

export default ForgotPassword;
