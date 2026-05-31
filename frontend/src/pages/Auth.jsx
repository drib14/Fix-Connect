import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Briefcase, Key, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

const Auth = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [roleSelection, setRoleSelection] = useState('user'); // 'user' | 'worker'
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  
  // View states
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [devFailsafeCode, setDevFailsafeCode] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const API_URL = 'http://localhost:5050/api/auth';

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all details.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        role: roleSelection,
      });

      if (response.data.success) {
        setSuccessMsg(response.data.message);
        setVerificationEmail(email);
        setNeedsVerification(true);
        if (response.data.devCode) {
          setDevFailsafeCode(response.data.devCode);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide your email and password.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('fixconnect_token', response.data.token);
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.notVerified) {
        // Needs email verification
        setVerificationEmail(email);
        setNeedsVerification(true);
        setErrorMsg(err.response.data.message);
        if (err.response.data.devCode) {
          setDevFailsafeCode(err.response.data.devCode);
        }
      } else {
        setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verifyCode || verifyCode.length < 6) {
      setErrorMsg('Please input the complete 6-digit code.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(`${API_URL}/verify`, {
        email: verificationEmail,
        code: verifyCode,
      });

      if (response.data.success) {
        localStorage.setItem('fixconnect_token', response.data.token);
        setSuccessMsg('Account verified successfully!');
        setTimeout(() => {
          onLoginSuccess(response.data.user);
        }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Verification failed. Incorrect code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '85vh',
        padding: '24px',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px 32px',
          transform: 'none', // Override translateY hover bounce
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', color: '#10b981', marginBottom: '8px' }}>FixConnect</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            {needsVerification
              ? 'Verify your account'
              : activeTab === 'login'
              ? 'Sign in to access services'
              : 'Create your FixConnect account'}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px dashed #fee2e2',
              color: '#ef4444',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px dashed #d1fae5',
              color: '#10b981',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Verification View */}
        {needsVerification ? (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">6-Digit Verification Code</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  maxLength={6}
                  className="form-input"
                  placeholder="Enter code"
                  style={{
                    paddingLeft: '44px',
                    letterSpacing: '8px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                />
                <Key
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#10b981',
                  }}
                />
              </div>
            </div>

            {devFailsafeCode && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #10b981',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: '#047857',
                  textAlign: 'center',
                }}
              >
                <span>Failsafe Dev Code: </span>
                <strong style={{ fontSize: '16px', color: '#10b981', letterSpacing: '2px' }}>
                  {devFailsafeCode}
                </strong>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={() => {
                  setNeedsVerification(false);
                  setDevFailsafeCode('');
                  resetMessages();
                }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Login/Register View */
          <div>
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: '6px',
                borderRadius: '12px',
                marginBottom: '24px',
              }}
            >
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'login' ? '#ffffff' : 'transparent',
                  color: activeTab === 'login' ? '#10b981' : '#64748b',
                  boxShadow: activeTab === 'login' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                }}
                onClick={() => {
                  setActiveTab('login');
                  resetMessages();
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'register' ? '#ffffff' : 'transparent',
                  color: activeTab === 'register' ? '#10b981' : '#64748b',
                  boxShadow: activeTab === 'register' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                }}
                onClick={() => {
                  setActiveTab('register');
                  resetMessages();
                }}
              >
                Sign Up
              </button>
            </div>

            <form
              onSubmit={activeTab === 'login' ? handleLogin : handleRegister}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {activeTab === 'register' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '44px' }}
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <User
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#10b981',
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#10b981',
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#10b981',
                    }}
                  />
                </div>
              </div>

              {activeTab === 'register' && (
                <div className="form-group">
                  <label className="form-label">Account Role Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      type="button"
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1.5px solid',
                        borderColor: roleSelection === 'user' ? '#10b981' : '#cbd5e1',
                        background: roleSelection === 'user' ? '#f0fdf4' : 'transparent',
                        color: roleSelection === 'user' ? '#10b981' : '#64748b',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease',
                      }}
                      onClick={() => setRoleSelection('user')}
                    >
                      <User size={16} />
                      Customer
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1.5px solid',
                        borderColor: roleSelection === 'worker' ? '#10b981' : '#cbd5e1',
                        background: roleSelection === 'worker' ? '#f0fdf4' : 'transparent',
                        color: roleSelection === 'worker' ? '#10b981' : '#64748b',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease',
                      }}
                      onClick={() => setRoleSelection('worker')}
                    >
                      <Briefcase size={16} />
                      Worker
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                {loading ? 'Processing...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
