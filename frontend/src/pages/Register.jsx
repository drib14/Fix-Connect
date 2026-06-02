import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { registerUser, clearError, clearRegistrationState } from '../store/authSlice.js';
import { Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default customer

  const dispatch = useDispatch();
  const { loading, error, registrationSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear auth state errors on mount
    dispatch(clearError());
    dispatch(clearRegistrationState());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser({ name, email, password, role }));
  };

  return (
    <div className="auth-page animate-fade">
      <div className="auth-card animate-slide">
        {registrationSuccess ? (
          <div className="text-center">
            <div className="feedback-icon-success">
              <CheckCircle />
            </div>
            <h2 className="feedback-title">Verify Your Email</h2>
            <p className="feedback-message">
              We have successfully dispatched a verification email to <strong>{email}</strong>.<br />
              Please verify your account by clicking the link in the message to access the dashboard.
            </p>
            <Link to="/login" className="btn btn-primary w-full">
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h2 className="auth-title">Create your Account</h2>
            <p className="auth-subtitle">Join FixConnect to discover services or build your provider pipeline.</p>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <span className="form-label">I want to join as a:</span>
                <div className="role-switcher">
                  <div 
                    className={`role-option ${role === 'customer' ? 'active' : ''}`}
                    onClick={() => setRole('customer')}
                  >
                    Customer
                  </div>
                  <div 
                    className={`role-option ${role === 'provider' ? 'active' : ''}`}
                    onClick={() => setRole('provider')}
                  >
                    Service Provider
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    style={{ paddingLeft: '45px' }}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    style={{ paddingLeft: '45px' }}
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    id="password"
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
              >
                {loading ? <div className="spinner"></div> : <>Sign Up <ArrowRight size={18} /></>}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Already registered on FixConnect?{' '}
              <Link to="/login" style={{ fontWeight: '600', color: 'var(--primary)' }}>
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
