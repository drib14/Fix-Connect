import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, CheckCircle, XCircle, MessageCircle, Star, TrendingUp, AlertCircle } from 'lucide-react';
import { fetchBookings } from '../store/bookingSlice.js';
import { formatPrice } from '../store/currencySlice.js';
import BookingCard from '../components/BookingCard.jsx';
import Modal from '../components/Modal.jsx';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Upcoming' },
  { key: 'in-progress', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector(state => state.auth);
  const { bookings, loading, error } = useSelector(state => state.bookings);
  const { selected, rates, currencies } = useSelector(state => state.currency);
  const [activeTab, setActiveTab] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    if (accessToken) dispatch(fetchBookings({ token: accessToken, status: activeTab || undefined }));
  }, [dispatch, accessToken, activeTab]);

  // Stats
  const completed = bookings.filter(b => b.status === 'completed');
  const active = bookings.filter(b => ['accepted', 'in-progress'].includes(b.status));
  const pending = bookings.filter(b => b.status === 'pending');
  const totalSpent = completed.reduce((s, b) => s + (b.totalAmount || 0), 0);

  const statCards = [
    { label: 'Total Bookings', value: bookings.length, icon: <Calendar size={20} />, color: '#6366f1' },
    { label: 'Active Now', value: active.length, icon: <Clock size={20} />, color: '#10b981' },
    { label: 'Completed', value: completed.length, icon: <CheckCircle size={20} />, color: '#059669' },
    { label: 'Total Spent', value: formatPrice(totalSpent, rates, selected, currencies), icon: <TrendingUp size={20} />, color: '#f59e0b' },
  ];

  const filtered = activeTab ? bookings.filter(b => b.status === activeTab) : bookings;

  return (
    <div className="page-container animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track and manage all your service bookings</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${s.color}18`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="tab-bar">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key && (
              <span className="tab-count">
                {bookings.filter(b => b.status === tab.key).length || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading bookings...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <AlertCircle size={18} /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '1rem' }} />
          <h3>No {activeTab || ''} bookings yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {activeTab === '' ? 'Start by booking a service from our home page.' : `You have no ${activeTab} bookings.`}
          </p>
          <a href="/book" className="btn btn-primary">Book a Service</a>
        </div>
      ) : (
        <div className="bookings-grid">
          {filtered.map(booking => (
            <BookingCard
              key={booking.id || booking._id}
              booking={booking}
              viewerRole="customer"
              onActionClick={(b, action) => {
                if (action === 'cancelled') setCancelTarget(b);
              }}
            />
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        title="Cancel Booking"
        description={`Are you sure you want to cancel booking #${cancelTarget?.referenceNumber}? This action cannot be undone.`}
        confirmText="Yes, Cancel"
        cancelText="Keep Booking"
        onConfirm={() => setCancelTarget(null)}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default CustomerDashboard;
