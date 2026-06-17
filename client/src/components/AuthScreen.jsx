import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Hammer, Users } from 'lucide-react';
import logo from '../assets/logo.png';

const AuthScreen = ({ onDemoLogin }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('USER');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.password) {
          throw new Error('All fields are required');
        }
        await register(
          formData.fullName,
          formData.email,
          formData.phoneNumber,
          formData.password,
          role
        );
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeed = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      if (onDemoLogin) {
        await onDemoLogin(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col justify-center min-h-[700px]">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4 overflow-hidden border border-slate-100">
          <img src={logo} alt="Fix-Connect Logo" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fix-Connect</h2>
        <p className="text-slate-500 mt-1 text-sm font-medium">Local service worker connection hub</p>
      </div>

      <div className="glass-card p-6 shadow-xl relative overflow-hidden bg-white/90">
        <div className="flex border-b border-slate-100 mb-6">
          <div className="flex-1 pb-3 text-sm font-bold text-center text-primary-600 border-b-2 border-primary-600">
            System Operator Sign In
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input-field pl-10 py-2.5 text-sm bg-white border-slate-200"
              placeholder="Email address"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="input-field pl-10 py-2.5 text-sm bg-white border-slate-200"
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary group flex items-center justify-center mt-4 py-2.5 text-sm cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
