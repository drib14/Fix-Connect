import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../utils/axios';
import PasswordStrength from '../components/Auth/PasswordStrength';
import {
  Container,
  FormBox,
  Title,
  InputGroup,
  Input,
  IconWrapper,
  Button,
  ErrorMsg,
  LinkText,
} from '../components/Auth/AuthStyles';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { email, otp } = location.state || {};

  if (!email || !otp) {
    return (
      <Container>
        <FormBox>
          <Title>Error</Title>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Invalid session. Please request a new OTP.</p>
          <LinkText><Link to="/forgot-password">Go to Forgot Password</Link></LinkText>
        </FormBox>
      </Container>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      alert('Password reset successfully! Please login with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Set New Password</Title>
        {error && <ErrorMsg>{error}</ErrorMsg>}

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <IconWrapper onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </IconWrapper>
            <PasswordStrength password={newPassword} />
          </InputGroup>

          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <LinkText>
            <Link to="/login">Back to Login</Link>
          </LinkText>
        </form>
      </FormBox>
    </Container>
  );
};

export default ResetPassword;
