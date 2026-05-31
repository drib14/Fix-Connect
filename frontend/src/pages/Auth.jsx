import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Logo from '../components/Logo';
import {
  Mail,
  Lock,
  User,
  Briefcase,
  Key,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';

const Auth = ({ onLoginSuccess, onBackToLanding }) => {
  // Navigation states: 'login' | 'register' | 'forgot-request' | 'forgot-verify' | 'forgot-reset'
  const [activeView, setActiveView] = useState('login'); 
  const [roleSelection, setRoleSelection] = useState('user');
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Eye show/hide passwords toggles
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // verification alerts
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [devFailsafeCode, setDevFailsafeCode] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto focus ref for 6-digit code input
  const codeInputRef = useRef(null);

  const API_URL = 'http://localhost:5050/api/auth';

  // Force autofocus on code verification view entry
  useEffect(() => {
    if ((activeView === 'forgot-verify' || needsVerification) && codeInputRef.current) {
      const focusTimer = setTimeout(() => {
        codeInputRef.current.focus();
      }, 150);
      return () => clearTimeout(focusTimer);
    }
  }, [activeView, needsVerification]);

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Real-time password standardizer / strength validator
  const checkPasswordStrength = (pass) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[@$!%*?&]/.test(pass),
    };
  };

  const regStrength = checkPasswordStrength(password);
  const isRegPasswordValid =
    regStrength.length && regStrength.uppercase && regStrength.number && regStrength.special;

  const resetStrength = checkPasswordStrength(newPassword);
  const isResetPasswordValid =
    resetStrength.length &&
    resetStrength.uppercase &&
    resetStrength.number &&
    resetStrength.special &&
    newPassword === confirmPassword;

  // Render password standards instructions box
  const renderPasswordStandardizer = (strength, matches = true) => {
    return (
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          marginTop: '8px',
        }}
      >
        <span style={{ fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>
          Password Complexity Requirements:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: strength.length ? '#10b981' : '#64748b' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: strength.length ? '#10b981' : '#cbd5e1' }} />
          <span>At least 8 characters</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: strength.uppercase ? '#10b981' : '#64748b' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: strength.uppercase ? '#10b981' : '#cbd5e1' }} />
          <span>At least one uppercase letter (A-Z)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: strength.number ? '#10b981' : '#64748b' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: strength.number ? '#10b981' : '#cbd5e1' }} />
          <span>At least one numeric digit (0-9)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: strength.special ? '#10b981' : '#64748b' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: strength.special ? '#10b981' : '#cbd5e1' }} />
          <span>At least one special character (@$!%*?&)</span>
        </div>
        {!matches && (
          <div style={{ color: '#ef4444', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
            Passwords do not match!
          </div>
        )}
      </div>
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all details.');
      return;
    }
    if (!isRegPasswordValid) {
      setErrorMsg('Please satisfy all password complexity standards.');
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

  // FORGOT PASSWORD FLOW
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please specify your registered email address.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      if (response.data.success) {
        setSuccessMsg(response.data.message);
        setVerificationEmail(email);
        setActiveView('forgot-verify');
        if (response.data.devCode) {
          setDevFailsafeCode(response.data.devCode);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to dispatch reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerify = async (e) => {
    e.preventDefault();
    if (!verifyCode || verifyCode.length < 6) {
      setErrorMsg('Please input the complete 6-digit code.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(`${API_URL}/verify-reset-code`, {
        email: verificationEmail,
        code: verifyCode,
      });
      if (response.data.success) {
        setSuccessMsg('Code verified. Set your new secure password.');
        setActiveView('forgot-reset');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Incorrect verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    if (!isResetPasswordValid) {
      setErrorMsg('Please satisfy complexity and confirm password match.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        email: verificationEmail,
        code: verifyCode,
        newPassword,
      });

      if (response.data.success) {
        setSuccessMsg(response.data.message);
        setTimeout(() => {
          setActiveView('login');
          setPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setVerifyCode('');
          setDevFailsafeCode('');
          resetMessages();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to override password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '85vh',
        padding: '24px',
      }}
    >
      {/* Universal header back button */}
      {onBackToLanding && activeView === 'login' && (
        <button
          onClick={onBackToLanding}
          style={{
            background: 'none',
            border: 'none',
            color: '#10b981',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
            alignSelf: 'center',
          }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      )}

      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px 32px',
          transform: 'none',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Logo size={48} showText={true} vertical={true} />
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>
            {needsVerification
              ? 'Verification Code Needed'
              : activeView === 'forgot-request'
              ? 'Recover your Password'
              : activeView === 'forgot-verify'
              ? 'Autofocus Recovery Check'
              : activeView === 'forgot-reset'
              ? 'Configure New Password'
              : activeView === 'login'
              ? 'Access Your Account'
              : 'Create Account'}
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
              fontSize: '13px',
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
              fontSize: '13px',
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

        {/* ==========================================
            A. REGISTRATION CODE VERIFICATION OVERLAY
            ========================================== */}
        {needsVerification ? (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">6-Digit Verification Code</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  maxLength={6}
                  ref={codeInputRef}
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
          <>
            {/* ==========================================
                B. FORGOT PASSWORD FLOW
                ========================================== */}
            {activeView === 'forgot-request' && (
              <form onSubmit={handleForgotRequest} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                  Specify your registered email address below, and we will send a 6-digit recovery code.
                </p>
                <div className="form-group">
                  <label className="form-label">Registered Email</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '44px' }}
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Sending Code...' : 'Send Recovery Code'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setActiveView('login');
                    resetMessages();
                  }}
                >
                  Cancel & Back
                </button>
              </form>
            )}

            {activeView === 'forgot-verify' && (
              <form onSubmit={handleForgotVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                  Enter the 6-digit verification code. The input is autofocused for your convenience.
                </p>
                <div className="form-group">
                  <label className="form-label">Recovery Code</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      maxLength={6}
                      ref={codeInputRef}
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
                      required
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
                    <span>Failsafe Recovery Code: </span>
                    <strong style={{ fontSize: '16px', color: '#10b981', letterSpacing: '2px' }}>
                      {devFailsafeCode}
                    </strong>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Validating...' : 'Verify Recovery Code'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setActiveView('forgot-request');
                    setVerifyCode('');
                    setDevFailsafeCode('');
                    resetMessages();
                  }}
                >
                  Back
                </button>
              </form>
            )}

            {activeView === 'forgot-reset' && (
              <form onSubmit={handleForgotReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                  Choose a new strong password. Make sure to satisfy the standard complexity requirements.
                </p>

                {/* New Password */}
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
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
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                      }}
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
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
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                      }}
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Render Password standardizer */}
                {renderPasswordStandardizer(resetStrength, newPassword === confirmPassword || !confirmPassword)}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={loading || !isResetPasswordValid}
                >
                  {loading ? 'Overwriting...' : 'Reset & Save Password'}
                </button>
              </form>
            )}

            {/* ==========================================
                C. STANDARD SIGN IN / SIGN UP VIEWS
                ========================================== */}
            {(activeView === 'login' || activeView === 'register') && (
              <div>
                {/* Tabs selection */}
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
                      background: activeView === 'login' ? '#ffffff' : 'transparent',
                      color: activeView === 'login' ? '#10b981' : '#64748b',
                      boxShadow: activeView === 'login' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                    }}
                    onClick={() => {
                      setActiveView('login');
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
                      background: activeView === 'register' ? '#ffffff' : 'transparent',
                      color: activeView === 'register' ? '#10b981' : '#64748b',
                      boxShadow: activeView === 'register' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                    }}
                    onClick={() => {
                      setActiveView('register');
                      resetMessages();
                    }}
                  >
                    Sign Up
                  </button>
                </div>

                <form
                  onSubmit={activeView === 'login' ? handleLogin : handleRegister}
                  style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                  {activeView === 'register' && (
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
                          required
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
                        required
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label">Password</label>
                      {activeView === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveView('forgot-request');
                            resetMessages();
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#10b981',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input
                        type={activeView === 'login' ? (showLoginPass ? 'text' : 'password') : (showRegPass ? 'text' : 'password')}
                        className="form-input"
                        style={{ paddingLeft: '44px', paddingRight: '44px' }}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                        }}
                        onClick={() => {
                          if (activeView === 'login') {
                            setShowLoginPass(!showLoginPass);
                          } else {
                            setShowRegPass(!showRegPass);
                          }
                        }}
                      >
                        {activeView === 'login' ? (
                          showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />
                        ) : (
                          showRegPass ? <EyeOff size={16} /> : <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {/* Registration password complexity checker */}
                    {activeView === 'register' && renderPasswordStandardizer(regStrength)}
                  </div>

                  {activeView === 'register' && (
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

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '8px' }}
                    disabled={loading || (activeView === 'register' && !isRegPasswordValid)}
                  >
                    {loading ? 'Processing...' : activeView === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
