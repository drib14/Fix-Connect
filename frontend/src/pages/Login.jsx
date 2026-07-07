import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { setCredentials } from '../store/authSlice';
import logo from '../assets/logo.png';
import api from '../utils/api';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      dispatch(setCredentials({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }));

      toast.success('Signed in successfully!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
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

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div className="form-group mb-3">
            <label className="form-label small fw-bold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light"><Mail size={18} /></span>
              <input
                type="email"
                className={`form-control bg-light ${errors.email ? 'is-invalid' : ''}`}
                placeholder="yourname@example.com"
                {...register('email')}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="form-group mb-3">
            <label className="form-label small fw-bold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light"><Lock size={18} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control bg-light ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                {...register('password')}
              />
              <button
                type="button"
                className="btn btn-outline-secondary border-start-0"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && (
                <div className="invalid-feedback">{errors.password.message}</div>
              )}
            </div>
          </div>

          {/* Forgot Password */}
          <div className="d-flex justify-content-end mb-4">
            <Link to="/forgot-password" className="text-success small fw-bold text-decoration-none">
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-success w-100 py-2.5 fw-bold text-white shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="loader-spin mx-auto animate-spin" size={20} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-4 small text-secondary">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-success fw-bold text-decoration-none ms-1">
            Create Account
          </Link>
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
};
