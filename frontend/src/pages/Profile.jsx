import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Save, User, Phone, MapPin, Globe, Briefcase, Clock, Star, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { setCredentials } from '../store/authSlice.js';
import CurrencySelector from '../components/CurrencySelector.jsx';
import StarRating from '../components/StarRating.jsx';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Profile = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector(state => state.auth);
  const isProvider = user?.role === 'provider';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const fileInputRef = useRef(null);

  // Form fields
  const [form, setForm] = useState({ name: '', phone: '', bio: '' });
  const [providerForm, setProviderForm] = useState({
    businessName: '',
    specialty: '',
    hourlyRate: 0,
    bio: '',
    serviceRadius: 15,
    yearsOfExperience: 0,
    languages: ['English'],
    availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], startTime: '08:00', endTime: '17:00' },
    certifications: [],
    isAvailable: true,
  });
  const [newLang, setNewLang] = useState('');
  const [newCert, setNewCert] = useState({ name: '', issuedBy: '', year: new Date().getFullYear() });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (res.ok) {
          const u = data.data.user;
          const p = data.data.profile;
          setProfile(data.data);
          setForm({ name: u.name || '', phone: u.phone || '', bio: u.bio || '' });
          if (p && isProvider) {
            setProviderForm({
              businessName: p.businessName || '',
              specialty: p.specialty || '',
              hourlyRate: p.hourlyRate || 0,
              bio: p.bio || '',
              serviceRadius: p.serviceRadius || 15,
              yearsOfExperience: p.yearsOfExperience || 0,
              languages: p.languages?.length ? p.languages : ['English'],
              availability: p.availability || { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], startTime: '08:00', endTime: '17:00' },
              certifications: p.certifications || [],
              isAvailable: p.isAvailable !== false,
            });
          }
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchProfile();
  }, [accessToken, isProvider]);

  const handleSavePersonal = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(setCredentials({ accessToken, user: { ...user, ...data.data.user } }));
        toast.success('Profile updated!');
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch { toast.error('Network error'); }
    finally { setSaving(false); }
  };

  const handleSaveProvider = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile/provider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(providerForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Provider profile updated!');
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch { toast.error('Network error'); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(setCredentials({ accessToken, user: { ...user, avatar: data.data.avatarUrl } }));
        toast.success('Avatar updated!');
      } else {
        toast.error('Upload failed');
      }
    } catch { toast.error('Upload error'); }
    finally { setUploadingAvatar(false); }
  };

  const toggleDay = (day) => {
    setProviderForm(f => ({
      ...f,
      availability: {
        ...f.availability,
        days: f.availability.days.includes(day)
          ? f.availability.days.filter(d => d !== day)
          : [...f.availability.days, day],
      },
    }));
  };

  const avatarUrl = user?.avatar
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=10b981&color=fff&size=200`;

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information and settings</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* ── Left: Avatar & Stats Panel ── */}
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={avatarUrl} alt={user?.name} className="profile-avatar" />
              <button
                className="avatar-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Change photo"
              >
                {uploadingAvatar ? (
                  <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: 'white' }} />
                ) : (
                  <Camera size={14} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
              />
            </div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-role-badge">
              {isProvider ? '🔧 Service Provider' : '👤 Customer'}
            </p>
            {user?.email && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{user.email}</p>
            )}
          </div>

          {isProvider && profile?.profile && (
            <div className="profile-stats-card">
              <div className="profile-stat">
                <Star size={16} style={{ color: '#f59e0b' }} />
                <span className="profile-stat-value">{profile.profile.rating?.toFixed(1) || '—'}</span>
                <span className="profile-stat-label">Rating</span>
              </div>
              <div className="profile-stat-divider" />
              <div className="profile-stat">
                <CheckCircle size={16} style={{ color: 'var(--primary)' }} />
                <span className="profile-stat-value">{profile.profile.completedJobs || 0}</span>
                <span className="profile-stat-label">Jobs Done</span>
              </div>
              <div className="profile-stat-divider" />
              <div className="profile-stat">
                <Clock size={16} style={{ color: '#6366f1' }} />
                <span className="profile-stat-value">{profile.profile.reviewsCount || 0}</span>
                <span className="profile-stat-label">Reviews</span>
              </div>
            </div>
          )}

          {/* Currency Preference */}
          <div className="profile-currency-card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Globe size={13} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
              Display Currency
            </div>
            <CurrencySelector />
          </div>
        </div>

        {/* ── Right: Edit Forms ── */}
        <div className="profile-main">
          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: '2rem' }}>
            <button className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
              <User size={15} /> Personal Info
            </button>
            {isProvider && (
              <button className={`tab-btn ${activeTab === 'provider' ? 'active' : ''}`} onClick={() => setActiveTab('provider')}>
                <Briefcase size={15} /> Provider Details
              </button>
            )}
          </div>

          {/* ── Personal Info Tab ── */}
          {activeTab === 'personal' && (
            <div className="profile-form">
              <div className="form-section">
                <h3 className="form-section-title">Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-input"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell us a little about yourself..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSavePersonal}
                disabled={saving}
                id="save-personal-btn"
              >
                {saving ? (
                  <><div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: 'white' }} /> Saving...</>
                ) : (
                  <><Save size={16} /> Save Changes</>
                )}
              </button>
            </div>
          )}

          {/* ── Provider Details Tab ── */}
          {activeTab === 'provider' && isProvider && (
            <div className="profile-form">
              <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 className="form-section-title" style={{ margin: 0 }}>Business Information</h3>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={providerForm.isAvailable}
                      onChange={e => setProviderForm(f => ({ ...f, isAvailable: e.target.checked }))}
                    />
                    <span className="toggle-slider" />
                    <span className="toggle-label">{providerForm.isAvailable ? '🟢 Available' : '🔴 Unavailable'}</span>
                  </label>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Business Name</label>
                    <input className="form-input" value={providerForm.businessName} onChange={e => setProviderForm(f => ({ ...f, businessName: e.target.value }))} placeholder="Your business or trade name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialty / Trade</label>
                    <input className="form-input" value={providerForm.specialty} onChange={e => setProviderForm(f => ({ ...f, specialty: e.target.value }))} placeholder="e.g. Electrician, Plumber" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hourly Rate (USD)</label>
                    <input className="form-input" type="number" min={0} value={providerForm.hourlyRate} onChange={e => setProviderForm(f => ({ ...f, hourlyRate: Number(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input className="form-input" type="number" min={0} value={providerForm.yearsOfExperience} onChange={e => setProviderForm(f => ({ ...f, yearsOfExperience: Number(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Radius (km)</label>
                    <input className="form-input" type="number" min={1} value={providerForm.serviceRadius} onChange={e => setProviderForm(f => ({ ...f, serviceRadius: Number(e.target.value) }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Professional Bio</label>
                  <textarea className="form-input" rows={4} value={providerForm.bio} onChange={e => setProviderForm(f => ({ ...f, bio: e.target.value }))} placeholder="Describe your expertise, experience, and what makes you stand out..." style={{ resize: 'vertical' }} />
                </div>
              </div>

              {/* Availability */}
              <div className="form-section">
                <h3 className="form-section-title">Availability</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Working Days</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`day-toggle ${providerForm.availability.days.includes(day) ? 'selected' : ''}`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input className="form-input" type="time" value={providerForm.availability.startTime} onChange={e => setProviderForm(f => ({ ...f, availability: { ...f.availability, startTime: e.target.value } }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input className="form-input" type="time" value={providerForm.availability.endTime} onChange={e => setProviderForm(f => ({ ...f, availability: { ...f.availability, endTime: e.target.value } }))} />
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="form-section">
                <h3 className="form-section-title">Languages</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  {providerForm.languages.map(lang => (
                    <span key={lang} className="tag-chip">
                      {lang}
                      <button onClick={() => setProviderForm(f => ({ ...f, languages: f.languages.filter(l => l !== lang) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.3rem', color: 'inherit' }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="form-input" value={newLang} onChange={e => setNewLang(e.target.value)} placeholder="Add language..." style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter' && newLang.trim()) { setProviderForm(f => ({ ...f, languages: [...f.languages, newLang.trim()] })); setNewLang(''); }}} />
                  <button className="btn btn-outline" onClick={() => { if (newLang.trim()) { setProviderForm(f => ({ ...f, languages: [...f.languages, newLang.trim()] })); setNewLang(''); }}}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleSaveProvider} disabled={saving} id="save-provider-btn">
                {saving ? <><div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: 'white' }} /> Saving...</> : <><Save size={16} /> Save Provider Profile</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
