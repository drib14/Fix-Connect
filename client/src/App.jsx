import { useState, useEffect, useRef } from 'react';
import {
  Mail, Lock, User as UserIcon, Phone, ArrowRight, LogOut,
  MapPin, Search, Calendar, Clock, DollarSign, Briefcase,
  Star, ShieldAlert, Sparkles, CheckCircle, Trash2, X, PlusCircle,
  CreditCard, Wallet, Navigation
} from 'lucide-react';
import logo from './assets/logo.png';

// API request helper
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'API Error');
  }

  return result;
};

// LocationIQ Search Helper
const searchLocation = async (query) => {
  const token = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN;
  if (!token) return [];
  try {
    const res = await fetch(`https://us1.locationiq.com/v1/search.php?key=${token}&q=${encodeURIComponent(query)}&format=json&countrycodes=ph`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('LocationIQ search error:', err);
    return [];
  }
};

// LocationIQ Reverse Geocode Helper
const reverseGeocode = async (lat, lon) => {
  const token = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN;
  if (!token) return 'Unknown Location';
  try {
    const res = await fetch(`https://us1.locationiq.com/v1/reverse.php?key=${token}&lat=${lat}&lon=${lon}&format=json`);
    if (!res.ok) return 'Unknown Location';
    const data = await res.json();
    return data.display_name || 'Selected coordinates';
  } catch (err) {
    console.error('LocationIQ reverse geocode error:', err);
    return 'Selected coordinates';
  }
};
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './components/AuthScreen';
import AdminPortal from './components/AdminPortal';
import { BookOpen, Shield, ShieldCheck, ArrowRight, ArrowLeft, Loader } from 'lucide-react';
import { getTerms, getPrivacy, getBlogs } from './services/contentService';

const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n\n').map((block, idx) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) {
      return <h2 key={idx} className="text-lg font-bold text-white mt-6 mb-2 font-display">{trimmed.replace('## ', '')}</h2>;
    }
    if (trimmed.startsWith('# ')) {
      return <h1 key={idx} className="text-2xl font-extrabold text-white mt-8 mb-4 font-display">{trimmed.replace('# ', '')}</h1>;
    }
    return <p key={idx} className="text-slate-300 text-sm leading-relaxed mb-4">{trimmed}</p>;
  });
};

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-35 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-35 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl shadow-primary-500/10 mb-6 transform transition hover:scale-105 duration-300 overflow-hidden border-2 border-primary-100">
            <img src={logo} alt="Fix-Connect Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Fix-Connect</h1>
          <p className="text-slate-500 mt-2 font-medium">Your platform for local service workers</p>
        </div>

        <div className="glass-card p-8 sm:p-10">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>

          <form className="space-y-5 animate-slide-up">
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="input-field pl-11"
                  placeholder="Full Name"
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                className="input-field pl-11"
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                className="input-field pl-11"
                placeholder="Password"
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-accent-600 hover:text-accent-500">
                  Forgot password?
                </a>
              </div>
            )}

            <button type="button" className="btn-primary group flex items-center justify-center mt-2">
              <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-accent-600 hover:text-accent-500 hover:underline transition-all"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
