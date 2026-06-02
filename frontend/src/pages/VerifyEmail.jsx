import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token in URL path.');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email address has been successfully verified!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification link is invalid or has already expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Please try verifying again later.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="auth-page animate-fade">
      <div className="feedback-card animate-slide">
        {status === 'verifying' && (
          <div>
            <div className="feedback-icon-success" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <Loader className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
            </div>
            <h2 className="feedback-title">Verifying your Account</h2>
            <p className="feedback-message">We are securely verifying your credentials with the database. Please hold on...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="feedback-icon-success">
              <CheckCircle />
            </div>
            <h2 className="feedback-title">Email Verified!</h2>
            <p className="feedback-message">{message}</p>
            <Link to="/login" className="btn btn-primary w-full" style={{ width: '100%' }}>
              Proceed to Sign In
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="feedback-icon-success" style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }}>
              <XCircle />
            </div>
            <h2 className="feedback-title">Verification Failed</h2>
            <p className="feedback-message">{message}</p>
            <Link to="/register" className="btn btn-primary w-full" style={{ width: '100%', marginBottom: '1rem' }}>
              Create a New Account
            </Link>
            <Link to="/login" className="btn btn-outline w-full" style={{ width: '100%' }}>
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
