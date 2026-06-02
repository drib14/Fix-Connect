import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Zap, Brush, Sparkles, Star, ShieldCheck, Clock, Users, ArrowRight } from 'lucide-react';

export const Landing = () => {
  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map icon strings to Lucide components dynamically
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Wrench': return <Wrench size={24} />;
      case 'Zap': return <Zap size={24} />;
      case 'Brush': return <Brush size={24} />;
      case 'Sparkles': return <Sparkles size={24} />;
      default: return <Wrench size={24} />;
    }
  };

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catRes.ok) {
          setCategories(catData.data.categories);
        }

        const workRes = await fetch('/api/workers');
        const workData = await workRes.json();
        if (workRes.ok) {
          setWorkers(workData.data.workers);
        }
      } catch (err) {
        console.error('Failed to load dynamic landing resources.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  return (
    <div className="animate-fade" style={{ backgroundColor: 'var(--background)' }}>
      {/* Dynamic Landing Header */}
      <header className="main-header" style={{ padding: '1rem 3rem' }}>
        <div className="logo-container">
          <svg viewBox="0 0 100 100" width="38" height="38" style={{ fill: 'none' }}>
            <circle cx="50" cy="50" r="46" fill="#f0fdf4" stroke="#10b981" strokeWidth="4" />
            <path d="M35 50 L45 60 L65 40" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Fix<span className="logo-highlight">Connect</span></span>
        </div>
        <div className="nav-menu" style={{ gap: '1.2rem' }}>
          <Link to="/login" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            Join FixConnect
          </Link>
        </div>
      </header>

      {/* Hero Welcome Grid */}
      <section style={{
        padding: '6rem 3rem 4rem',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '4rem',
        alignItems: 'center',
      }}>
        <div>
          <span style={{
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
            padding: '0.4rem 0.9rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Premium Service Booking SaaS
          </span>
          
          <h1 style={{
            fontSize: '3.4rem',
            lineHeight: '1.1',
            letterSpacing: '-1.5px',
            color: 'var(--text-primary)',
            marginTop: '1.2rem',
            marginBottom: '1.2rem',
          }}>
            Your marketplace for <span style={{ color: 'var(--primary)' }}>verified local care</span>.
          </h1>
          
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            lineHeight: '1.6',
          }}>
            Connect instantly with top-rated local professionals for plumbing, electrical, cleaning, and general repairs. Background-verified, certified, and fully scheduled for your convenience.
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
              Get Started Instantly <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.9rem 1.8rem', fontSize: '1rem' }}>
              Explore Providers
            </Link>
          </div>

          {/* Social Trust Metrics */}
          <div style={{
            display: 'flex',
            gap: '3rem',
            marginTop: '4rem',
            borderTop: '1px solid var(--surface-border)',
            paddingTop: '2rem',
          }}>
            <div>
              <h4 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>100%</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Background Verified</p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>2.5k+</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Satisfied Bookings</p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>4.9★</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average Care Rating</p>
            </div>
          </div>
        </div>

        {/* Dynamic Graphic Grid */}
        <div style={{ position: 'relative' }}>
          {/* Accent decoration rings */}
          <div style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
            top: '-40px',
            right: '-40px',
            zIndex: 1,
          }}></div>

          <div style={{
            background: 'white',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            zIndex: 2,
          }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck style={{ color: 'var(--primary)' }} /> Why choose FixConnect?
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Strict Background Screening</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Every provider profile maps back to verified identity and credential uploads before matching contracts.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Real-time Booking Schedules</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Book directly into provider calendars. Customize availability hours and dispatch requests seamlessly.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Harmonious Marketplace Matching</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Advanced filter cards matching customers with the exact radius metric, review ratings, and price fits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Live Categories */}
      <section style={{ backgroundColor: 'white', padding: '6rem 3rem', borderTop: '1px solid var(--surface-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.8rem', letterSpacing: '-0.8px' }}>Explore Verified Service Divisions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              We seed and manage multiple domains of professional home care directly inside MongoDB.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '30px', height: '30px', margin: 'auto' }}></div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.8rem' }}>
              {categories.map((cat, idx) => (
                <div 
                  key={cat.id || idx}
                  className="animate-slide"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2rem',
                    transition: 'var(--transition)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--surface-border)';
                    e.currentTarget.style.backgroundColor = 'var(--background)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.2rem',
                  }}>
                    {getIcon(cat.iconName)}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{cat.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Live Providers */}
      <section style={{ padding: '6rem 3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.8rem', letterSpacing: '-0.8px' }}>Meet our Premium Specialists</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              These high-performance profiles are resolved live from MongoDB, displaying real pricing and bio sheets.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '30px', height: '30px', margin: 'auto' }}></div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              {workers.map((worker, idx) => (
                <div 
                  key={worker.id || idx}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                    <img 
                      src={worker.avatar} 
                      alt={worker.name} 
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--primary-soft)',
                      }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{worker.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                        {worker.profile?.specialty || 'General Contractor'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.2rem' }}>
                        <Star fill="#f59e0b" size={12} /> {worker.profile?.rating || '4.8'} 
                        <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({worker.profile?.reviewsCount || '0'} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>
                    {worker.profile?.bio || 'No bio specified.'}
                  </p>

                  <div style={{ 
                    borderTop: '1px solid var(--surface-border)', 
                    paddingTop: '1rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                  }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hourly Rate</span>
                      <h4 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                        ${worker.profile?.hourlyRate || '0'}<span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/hr</span>
                      </h4>
                    </div>
                    <Link to="/register" className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                      Book Care
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="main-footer" style={{ padding: '4rem 3rem', backgroundColor: '#ffffff', borderTop: '1px solid var(--surface-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div className="logo-container">
              <svg viewBox="0 0 100 100" width="30" height="30" style={{ fill: 'none' }}>
                <circle cx="50" cy="50" r="46" fill="#f0fdf4" stroke="#10b981" strokeWidth="4" />
                <path d="M35 50 L45 60 L65 40" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Fix<span className="logo-highlight">Connect</span></span>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem' }}>
              <Link to="/legal?tab=terms" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Terms of Service</Link>
              <Link to="/legal?tab=privacy" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Privacy Policy</Link>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)' }} />

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} FixConnect. All rights reserved. Connecting local care markets under clean SaaS protocols.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
