import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade">
      <div className="auth-card animate-slide">
        {success ? (
          <div className="text-center">
            <div className="feedback-icon-success">
              <CheckCircle />
            </div>
            <h2 className="feedback-title">Instructions Sent</h2>
            <p className="feedback-message">
              If the email address <strong>{email}</strong> is associated with an active account, password reset instructions have been successfully dispatched. Please check your inbox shortly.
            </p>
            <Link to="/login" className="btn btn-primary w-full" style={{ width: '100%' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">Provide your registered email address and we'll dispatch password recovery instructions.</p>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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

              <button 
                type="submit" 
                className="btn btn-primary w-full" 
                style={{ marginTop: '1.2rem', width: '100%' }}
                disabled={loading}
              >
                {loading ? <div className="spinner"></div> : <>Send Reset Instructions <ArrowRight size={18} /></>}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Remembered your credentials?{' '}
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

export default ForgotPassword;
