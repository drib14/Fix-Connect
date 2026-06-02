import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart2, CheckCircle, Clock, Star, TrendingUp, AlertCircle,
  Calendar, Users, Zap, Bell
} from 'lucide-react';
import { fetchBookings, updateBookingStatus } from '../store/bookingSlice.js';
import { formatPrice } from '../store/currencySlice.js';
import BookingCard from '../components/BookingCard.jsx';
import Modal from '../components/Modal.jsx';
import toast from 'react-hot-toast';

const ProviderDashboard = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { accessToken } = useSelector(state => state.auth);
  const { bookings, loading, error } = useSelector(state => state.bookings);
  const { selected, rates, currencies } = useSelector(state => state.currency);

  const defaultTab = searchParams.get('tab') || 'requests';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [actionModal, setActionModal] = useState(null); // { booking, action }

  useEffect(() => {
    if (accessToken) dispatch(fetchBookings({ token: accessToken }));
  }, [dispatch, accessToken]);

  // Stats
  const pending = bookings.filter(b => b.status === 'pending');
  const accepted = bookings.filter(b => b.status === 'accepted');
  const active = bookings.filter(b => b.status === 'in-progress');
  const completed = bookings.filter(b => b.status === 'completed');
  const totalEarned = completed.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const avgRating = completed.length ? 4.8 : 0; // Will come from worker profile

  const statCards = [
    { label: 'Pending Requests', value: pending.length, icon: <Bell size={20} />, color: '#f59e0b', urgent: pending.length > 0 },
    { label: 'Active Jobs', value: active.length, icon: <Zap size={20} />, color: '#6366f1' },
    { label: 'Completed Jobs', value: completed.length, icon: <CheckCircle size={20} />, color: '#10b981' },
    { label: 'Total Earnings', value: formatPrice(totalEarned, rates, selected, currencies), icon: <TrendingUp size={20} />, color: '#059669' },
  ];

  const tabs = [
    { key: 'requests', label: 'Requests', count: pending.length },
    { key: 'upcoming', label: 'Upcoming', count: accepted.length },
    { key: 'active', label: 'Active', count: active.length },
    { key: 'history', label: 'History', count: completed.length },
  ];

  const tabBookings = {
    requests: pending,
    upcoming: accepted,
    active,
    history: completed,
  };

  const handleAction = async () => {
    if (!actionModal) return;
    try {
      await dispatch(updateBookingStatus({
        token: accessToken,
        id: actionModal.booking.id || actionModal.booking._id,
        status: actionModal.action,
      })).unwrap();
      toast.success(`Booking ${actionModal.action}!`);
    } catch (err) {
      toast.error(err || 'Action failed');
    } finally {
      setActionModal(null);
      dispatch(fetchBookings({ token: accessToken }));
    }
  };

  const displayedBookings = tabBookings[activeTab] || [];

  return (
    <div className="page-container animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Provider Dashboard</h1>
          <p className="page-subtitle">Manage requests, track jobs, monitor earnings</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className={`stat-card ${s.urgent ? 'stat-card-urgent' : ''}`}>
            <div className="stat-icon" style={{ backgroundColor: `${s.color}18`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
            {s.urgent && <div className="stat-urgent-dot" />}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Bookings */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px' }} />
        </div>
      ) : error ? (
        <div className="alert alert-danger"><AlertCircle size={18} /> {error}</div>
      ) : displayedBookings.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '1rem' }} />
          <h3>No {activeTab} bookings</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'requests' ? 'New booking requests will appear here.' : `No ${activeTab} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="bookings-grid">
          {displayedBookings.map(booking => (
            <BookingCard
              key={booking.id || booking._id}
              booking={booking}
              viewerRole="provider"
              onActionClick={(b, action) => setActionModal({ booking: b, action })}
            />
          ))}
        </div>
      )}

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={!!actionModal}
        title={actionModal?.action === 'accepted' ? 'Accept Booking' : actionModal?.action === 'declined' ? 'Decline Booking' : actionModal?.action === 'in-progress' ? 'Start Job' : 'Complete Job'}
        description={`Are you sure you want to ${actionModal?.action} booking #${actionModal?.booking?.referenceNumber}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={handleAction}
        onCancel={() => setActionModal(null)}
      />
    </div>
  );
};

export default ProviderDashboard;
