import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice.js';
import { Search, Shield, Wrench, Zap, Sparkles, LogOut, Brush, Heart, Star, Compass } from 'lucide-react';

export const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const categories = [
    { name: 'Plumbing Solutions', icon: <Wrench size={24} />, count: 18, color: '#10b981' },
    { name: 'Electrical Engineering', icon: <Zap size={24} />, count: 12, color: '#f59e0b' },
    { name: 'Home Cleaning Services', icon: <Brush size={24} />, count: 25, color: '#06b6d4' },
    { name: 'General Handyman', icon: <Sparkles size={24} />, count: 14, color: '#8b5cf6' },
  ];

  const featuredProviders = [
    { name: 'Robert Vance', rating: 4.9, reviews: 48, specialty: 'Master Plumber', avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=60' },
    { name: 'Marcus Sterling', rating: 4.8, reviews: 36, specialty: 'High-Voltage Electrician', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=60' },
  ];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Dynamic Header */}
      <header className="main-header">
        <div className="logo-container">
          <svg viewBox="0 0 100 100" width="36" height="36" style={{ fill: 'none' }}>
            <circle cx="50" cy="50" r="46" fill="#f0fdf4" stroke="#10b981" strokeWidth="4" />
            <path d="M35 50 L45 60 L65 40" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Fix<span className="logo-highlight">Connect</span></span>
        </div>
        <div className="nav-menu">
          <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={16} style={{ color: 'var(--primary)' }} />
            Hello, {user?.name || 'User'} ({user?.role})
          </span>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* Hero Welcome banner */}
      <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '3rem'
        }}>
          {/* Subtle grid accent overlay */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, white 10%, transparent 10%)', backgroundSize: '20px 20px' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>FixConnect Marketplace</span>
            <h1 style={{ color: 'white', fontSize: '2.5rem', marginTop: '1rem', marginBottom: '0.8rem', lineHeight: '1.2' }}>Find trusted local services instantly</h1>
            <p style={{ opacity: 0.9, fontSize: '1.05rem', marginBottom: '2rem' }}>Every service provider on FixConnect goes through strict background verification checks to guarantee your peace of mind.</p>
            
            {/* Search Frame */}
            <div style={{
              display: 'flex',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              boxShadow: 'var(--shadow-md)',
              alignItems: 'center'
            }}>
              <Search size={20} style={{ color: 'var(--text-muted)', marginLeft: '12px' }} />
              <input 
                type="text" 
                placeholder="What service do you need today? (e.g. plumber, cleaner)" 
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '0.8rem 1rem',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)'
                }}
              />
              <button className="btn btn-primary" style={{ padding: '0.7rem 1.4rem' }}>Discover</button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
            <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Compass style={{ color: 'var(--primary)' }} /> Browse Popular Categories</h2>
            <a href="#" style={{ fontSize: '0.9rem', fontWeight: '600' }}>View All Categories</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="animate-slide"
                style={{
                  background: 'white',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.8rem',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  animationDelay: `${idx * 0.1}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--surface-border)';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  backgroundColor: `${cat.color}15`, 
                  color: cat.color,
                  marginBottom: '1.2rem'
                }}>
                  {cat.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{cat.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cat.count} Verified Providers</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Providers */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
            <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Star style={{ color: 'var(--secondary)' }} /> High-Rated Service Providers</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {featuredProviders.map((prov, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'white',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  gap: '1.2rem',
                  alignItems: 'center'
                }}
              >
                <img 
                  src={prov.avatar} 
                  alt={prov.name} 
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--surface-border)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                    <Star fill="var(--secondary)" size={14} /> {prov.rating} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({prov.reviews} reviews)</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{prov.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>{prov.specialty}</p>
                </div>
                <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>View</button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>&copy; {new Date().getFullYear()} FixConnect Platform. Connecting clients with premium local care. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
