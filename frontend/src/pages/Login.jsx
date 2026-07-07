import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import logo from '../../assets/logo.png';
import api from '../utils/api';

export default function Login({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      setIsLoading(false);
      onLoginSuccess(data.user);
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img src={logo} alt="FixConnect Logo" style={styles.logo} />
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to book your next home service</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-container">
              <span className="input-icon"><Mail size={18} /></span>
              <input
                type="email"
                className="form-control"
                placeholder="yourname@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-container">
              <span className="input-icon"><Lock size={18} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={styles.forgotRow}>
            <span
              style={styles.forgotLink}
              onClick={() => onNavigate('forgot-password')}
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="loader-spin" size={18} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Don't have an account? </span>
          <span
            style={styles.navigateLink}
            onClick={() => onNavigate('register')}
          >
            Create Account
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#F4F6F8',
    padding: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    width: '100%',
    maxWidth: '420px',
    padding: '36px',
    border: '1px solid #E2E8F0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logo: {
    width: '80px',
    height: '80px',
    borderRadius: '40px',
    marginBottom: '16px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: '26px',
    color: '#1E293B',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    marginTop: '6px',
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    border: '1.5px solid #FEB2B2',
    color: '#C53030',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'center',
  },
  forgotRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  },
  forgotLink: {
    fontSize: '13px',
    color: '#2E7D32',
    fontWeight: '700',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    height: '48px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
  },
  footerText: {
    color: '#64748B',
  },
  navigateLink: {
    color: '#2E7D32',
    fontWeight: '700',
    cursor: 'pointer',
    marginLeft: '4px',
  },
};
