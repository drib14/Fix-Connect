import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, clearError, setCredentials } from '../store/authSlice.js';
import { Mail, Lock, ArrowRight, Users, ChevronRight } from 'lucide-react';
import { getSavedAccounts } from '../components/AccountSwitchBanner.jsx';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showManual, setShowManual] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, accessToken } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/';
  const isSwitchMode = new URLSearchParams(location.search).get('switch') === 'true';

  useEffect(() => {
    dispatch(clearError());
    const accounts = getSavedAccounts();
    setSavedAccounts(accounts);
    // Show manual login if no saved accounts or not in switch mode
    if (accounts.length === 0) setShowManual(true);
  }, [dispatch]);

  useEffect(() => {
    if (accessToken) navigate(from, { replace: true });
  }, [accessToken, navigate, from]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const handleSavedAccountClick = (account) => {
    // Pre-fill email and show password field
    setEmail(account.email);
    setShowManual(true);
    // Try silent refresh for this account
    attemptSilentLogin(account.email);
  };

  const attemptSilentLogin = async (emailAddr) => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.data?.accessToken) {
        const userRes = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${data.data.accessToken}` } });
        const userData = await userRes.json();
        if (userRes.ok && userData.data.user.email === emailAddr) {
          dispatch(setCredentials({ accessToken: data.data.accessToken, user: userData.data.user }));
          navigate(from, { replace: true });
          return;
        }
      }
    } catch (_) {}
    // Silent login failed — stay on manual login form with pre-filled email
    setShowManual(true);
  };

  return (
    <div className="auth-page animate-fade">
      <div className="auth-card animate-slide">
        <div className="auth-logo">
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>FC</span>
          </div>
          <h2 className="auth-title">{isSwitchMode ? 'Switch Account' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {isSwitchMode ? 'Select an account or sign in with a different email.' : 'Sign in to your FixConnect account.'}
          </p>
        </div>

        {/* ── Saved Accounts Section ── */}
        {savedAccounts.length > 0 && !showManual && (
          <div className="saved-accounts-section">
            <div className="saved-accounts-label">
              <Users size={14} /> Saved Accounts
            </div>
            {savedAccounts.map((account, i) => {
              const avatarUrl = account.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=10b981&color=fff&size=60`;
              return (
                <button
                  key={i}
                  className="saved-account-btn"
                  onClick={() => handleSavedAccountClick(account)}
                >
                  <img src={avatarUrl} alt={account.name} className="saved-account-avatar" />
                  <div className="saved-account-info">
                    <div className="saved-account-name">{account.name}</div>
                    <div className="saved-account-email">{account.email}</div>
                  </div>
                  <div className="saved-account-role">
                    {account.role === 'provider' ? '🔧' : '👤'} {account.role}
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              );
            })}
            <button
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '0.8rem', fontSize: '0.85rem' }}
              onClick={() => setShowManual(true)}
            >
              Use a different account
            </button>
          </div>
        )}

        {/* ── Manual Login Form ── */}
        {(showManual || savedAccounts.length === 0) && (
          <>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} style={{ marginTop: savedAccounts.length > 0 ? '1rem' : '0' }}>
              {savedAccounts.length > 0 && showManual && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}
                  onClick={() => setShowManual(false)}
                >
                  ← Back to saved accounts
                </button>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    id="login-email"
                    className="form-input"
                    style={{ paddingLeft: '45px' }}
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--primary)' }}>
                    Forgot Password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    id="login-password"
                    className="form-input"
                    style={{ paddingLeft: '45px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop: '1.2rem', width: '100%' }}
                disabled={loading}
                id="login-submit-btn"
              >
                {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          New to FixConnect?{' '}
          <Link to="/register" style={{ fontWeight: '600', color: 'var(--primary)' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
