import React, { useState, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../utils/axios';
import PasswordStrength from '../components/Auth/PasswordStrength';
import PHLocationPicker from '../components/Auth/PHLocationPicker';
import TermsPopup from '../components/Auth/TermsPopup';
import {
  Container,
  FormBox,
  Title,
  InputGroup,
  InputWrapper,
  Input,
  IconWrapper,
  Button,
  CheckboxGroup,
  ErrorMsg,
  LinkText,
} from '../components/Auth/AuthStyles';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState({ region: '', province: '', city: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const routeLocation = useLocation();

  const handleLocationChange = useCallback((newLocation) => {
    setLocation(newLocation);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('You must agree to the Terms and Conditions.');
      return;
    }

    if (!location.region || !location.province || !location.city) {
      setError('Please select your complete location.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        location,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data._id);

      if (routeLocation.state?.redirectToApply) {
        navigate('/apply');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
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
        <Title>Create Account</Title>
        {error && <ErrorMsg>{error}</ErrorMsg>}

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputWrapper>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <IconWrapper onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </IconWrapper>
            </InputWrapper>
            <PasswordStrength password={password} />
          </InputGroup>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Select Location</h4>
            <PHLocationPicker onLocationChange={handleLocationChange} />
          </div>

          <CheckboxGroup>
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => {
                if (e.target.checked) {
                  // Only open popup if they are trying to check it and haven't agreed yet
                  if (!agreedToTerms) setIsTermsOpen(true);
                } else {
                  setAgreedToTerms(false);
                }
              }}
            />
            <label htmlFor="terms" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
              I agree to the <Link to="/terms" style={{ color: 'var(--primary-color)' }}>Terms & Privacy Policy</Link>
            </label>
          </CheckboxGroup>

          <Button type="submit" disabled={loading || !agreedToTerms}>
            {loading ? 'Creating...' : 'Register'}
          </Button>

          <LinkText>
            Already have an account? <Link to="/login">Log In</Link>
          </LinkText>
        </form>
      </FormBox>

      <TermsPopup
        isOpen={isTermsOpen}
        onClose={() => {
            setIsTermsOpen(false);
        }}
        onAgree={() => {
            setAgreedToTerms(true);
            setIsTermsOpen(false);
        }}
      />
    </Container>
  );
};

export default Register;
