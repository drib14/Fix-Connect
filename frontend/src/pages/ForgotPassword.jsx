import React, { useState, useRef } from 'react';
import { Mail, Lock, Key, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function ForgotPassword({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const otpRefs = useRef([]);

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });
      setIsLoading(false);
      setSuccess(data.message || 'OTP verification code sent to your email.');
      setStep(2);
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to send OTP code.');
    }
  };

  // OTP Focus Shifting
  const handleOtpChange = (value, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value.slice(-1);
    setOtp(updatedOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const updatedOtp = [...otp];
        updatedOtp[index - 1] = '';
        setOtp(updatedOtp);
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otpCode,
      });
      setIsLoading(false);
      setSuccess(data.message || 'Verification successful. Choose a new password.');
      setStep(3);
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.join(''),
        newPassword,
      });
      setIsLoading(false);
      setSuccess(data.message || 'Password reset successfully!');
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.backBtn} onClick={() => {
          if (step > 1) {
            setStep(step - 1);
            setError('');
            setSuccess('');
          } else {
            onNavigate('login');
          }
        }}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div style={styles.header}>
          <h2 style={styles.title}>Reset Password</h2>
          <p style={styles.subtitle}>
            {step === 1 && 'Enter your email address to request a 6-digit OTP code.'}
            {step === 2 && `We've sent a 6-digit verification code to ${email}`}
            {step === 3 && 'Choose a strong, new password for your account.'}
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {/* Step 1: Send OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
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
            <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={isLoading}>
              {isLoading ? <Loader2 className="loader-spin" size={18} /> : 'Send Code'}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center', marginBottom: '16px' }}>
                6-Digit Verification Code
              </label>
              <div style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(ref) => (otpRefs.current[index] = ref)}
                    type="text"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    style={{
                      ...styles.otpInput,
                      borderColor: digit ? '#2E7D32' : '#E2E8F0',
                      backgroundColor: digit ? '#FFF' : '#F8FAFC',
                    }}
                    required
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={isLoading}>
              {isLoading ? <Loader2 className="loader-spin" size={18} /> : 'Verify Code'}
            </button>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-container">
                <span className="input-icon"><Lock size={18} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-container">
                <span className="input-icon"><Key size={18} /></span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={isLoading}>
              {isLoading ? <Loader2 className="loader-spin" size={18} /> : 'Reset Password'}
            </button>
          </form>
        )}
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
    position: 'relative',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#64748B',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
    padding: '4px',
    borderRadius: '8px',
    transition: 'color 0.2s',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '24px',
    color: '#1E293B',
    fontWeight: '800',
    fontFamily: "'Outfit', sans-serif",
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    marginTop: '8px',
    lineHeight: '20px',
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
  successBox: {
    backgroundColor: '#F0FDF4',
    border: '1.5px solid #BBF7D0',
    color: '#16A34A',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
    height: '48px',
    marginTop: '12px',
  },
  otpContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
  },
  otpInput: {
    width: '46px',
    height: '52px',
    borderRadius: '12px',
    border: '1.5px solid #E2E8F0',
    fontSize: '22px',
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
};
