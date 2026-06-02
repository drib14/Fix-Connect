import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice.js';
import { Search, Shield, Wrench, Zap, Sparkles, LogOut, Brush, Star, Compass, AlertCircle, Calendar, MapPin, Navigation } from 'lucide-react';
import Drawer from '../components/Drawer.jsx';
import Modal from '../components/Modal.jsx';

export const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // States
  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Overlays
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Map icon names to Lucide icons
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
    const fetchDashboardData = async () => {
      try {
        setError('');
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
        setError('Failed to resolve dynamic resources from MERN backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    setIsModalOpen(false);
    dispatch(logoutUser());
  };

  // Filters
  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (worker.profile?.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (worker.profile?.businessName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory 
      ? (worker.profile?.specialty || '').toLowerCase().includes(selectedCategory.slug.toLowerCase())
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      
      {/* Premium Header */}
      <header className="main-header" style={{ padding: '0.8rem 3rem' }}>
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
            Hello, {user?.name || 'User'}
          </span>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }} onClick={() => setIsModalOpen(true)}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem 3rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '2rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Hero Section */}
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
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, white 10%, transparent 10%)', backgroundSize: '20px 20px' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Logged In: {user?.role === 'customer' ? 'Customer Dashboard' : 'Provider Panel'}
            </span>
            <h1 style={{ color: 'white', fontSize: '2.5rem', marginTop: '1rem', marginBottom: '0.8rem', lineHeight: '1.2' }}>
              Discover background-screened care
            </h1>
            <p style={{ opacity: 0.9, fontSize: '1.05rem', marginBottom: '2rem' }}>
              Your current profile location: <strong>{user?.location?.address || 'Onboarding Location'}</strong>
            </p>
            
            {/* Live Search */}
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
                placeholder="Search specialty, business name, or provider name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '0.8rem 1rem',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)'
                }}
              />
              {selectedCategory && (
                <button 
                  className="btn btn-outline" 
                  style={{ marginRight: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => setSelectedCategory(null)}
                >
                  Clear Category
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px', margin: 'auto' }}></div>
          </div>
        ) : (
          <>
            {/* Dynamic Categories Selection */}
            <section style={{ marginBottom: '4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
                <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Compass style={{ color: 'var(--primary)' }} /> Divisions of Care
                </h2>
                {selectedCategory && (
                  <button onClick={() => setSelectedCategory(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    View All Divisions
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {categories.map((cat, idx) => (
                  <div 
                    key={cat.id || idx}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      background: 'white',
                      border: '1px solid var(--surface-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.8rem',
                      boxShadow: selectedCategory?.id === cat.id ? '0 0 0 3px var(--primary)' : 'var(--shadow-sm)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory?.id !== cat.id) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory?.id !== cat.id) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--surface-border)';
                      }
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      backgroundColor: 'var(--primary-soft)', 
                      color: 'var(--primary)',
                      marginBottom: '1.2rem'
                    }}>
                      {getIcon(cat.iconName)}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{cat.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Background Verified</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Providers Grid */}
            <section style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
                <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Star style={{ color: 'var(--secondary)' }} /> 
                  {selectedCategory ? `${selectedCategory.name} Contractors` : 'Verified Active Specialists'}
                </h2>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Showing {filteredWorkers.length} Providers
                </span>
              </div>

              {filteredWorkers.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  backgroundColor: 'white',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '4rem 2rem',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <AlertCircle size={38} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No specialists match filters</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try clearing your category tag or updating search keywords.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                  {filteredWorkers.map((worker, idx) => (
                    <div 
                      key={worker.id || idx}
                      style={{
                        background: 'white',
                        border: '1px solid var(--surface-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.8rem',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.2rem',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                        <img 
                          src={worker.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'} 
                          alt={worker.name} 
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid var(--surface-border)'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            <Star fill="var(--secondary)" size={12} /> {worker.profile?.rating || '4.8'} 
                            <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({worker.profile?.reviewsCount || '0'})</span>
                          </div>
                          <h3 style={{ fontSize: '1.05rem', margin: '0.1rem 0' }}>{worker.name}</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                            {worker.profile?.specialty ? worker.profile.specialty.toUpperCase() : 'SPECIALIST'}
                          </p>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {worker.profile?.bio || 'No professional bio description completed.'}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '0.8rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rate/hr</span>
                          <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                            ${worker.profile?.hourlyRate || '30'}
                          </h4>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem' }} onClick={() => setSelectedWorker(worker)}>
                          Profile details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Global Confirmation Modal */}
      <Modal 
        isOpen={isModalOpen}
        title="Sign Out"
        description="Are you sure you want to end your active session and sign out of your FixConnect dashboard?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setIsModalOpen(false)}
      />

      {/* Global slide-out Drawer for Specialist Profile Details */}
      <Drawer
        isOpen={selectedWorker !== null}
        title={selectedWorker?.name || 'Specialist Profile'}
        onClose={() => setSelectedWorker(null)}
      >
        {selectedWorker && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <img 
                src={selectedWorker.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'} 
                alt={selectedWorker.name} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-soft)' }}
              />
              <div>
                <h4 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{selectedWorker.name}</h4>
                <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                  {selectedWorker.profile?.specialty ? selectedWorker.profile.specialty.toUpperCase() : 'SPECIALIST'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.4rem' }}>
                  <Star fill="#f59e0b" size={14} /> {selectedWorker.profile?.rating || '4.8'}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({selectedWorker.profile?.reviewsCount || '0'} reviews)</span>
                </div>
              </div>
            </div>

            <div>
              <h5 style={{ fontFamily: 'Outfit', fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Business Entity</h5>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedWorker.profile?.businessName || 'Independent Contractor'}</p>
            </div>

            <div>
              <h5 style={{ fontFamily: 'Outfit', fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Professional Bio</h5>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selectedWorker.profile?.bio || 'No professional bio details completed.'}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', backgroundColor: 'var(--background)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
              <div>
                <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking Charge</h5>
                <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                  ${selectedWorker.profile?.hourlyRate || '30'}<span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/hr</span>
                </h4>
              </div>
              <div>
                <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dispatch Travel Radius</h5>
                <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Navigation size={18} style={{ color: 'var(--primary)' }} /> {selectedWorker.profile?.serviceRadius || '15'} km
                </h4>
              </div>
            </div>

            <div>
              <h5 style={{ fontFamily: 'Outfit', fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} /> Standard Availability Shifts
              </h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.8rem' }}>
                {(selectedWorker.profile?.availability?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']).map((day) => (
                  <span 
                    key={day} 
                    style={{ 
                      padding: '0.3rem 0.6rem', 
                      fontSize: '0.75rem', 
                      backgroundColor: 'white', 
                      border: '1px solid var(--surface-border)', 
                      borderRadius: '6px', 
                      fontWeight: '600',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {day.substring(0, 3)}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Active Shifts: <strong>{selectedWorker.profile?.availability?.startTime || '08:00'}</strong> to <strong>{selectedWorker.profile?.availability?.endTime || '17:00'}</strong>
              </p>
            </div>

            <button className="btn btn-primary w-full" style={{ width: '100%', marginTop: '1rem' }} onClick={() => alert('Booking request sent successfully to specialist!')}>
              Initiate Booking Match
            </button>
          </div>
        )}
      </Drawer>

      <footer className="main-footer">
        <p>&copy; {new Date().getFullYear()} FixConnect Platform. Dynamic seeding solved live from MongoDB.</p>
      </footer>
    </div>
  );
};

export default Home;
