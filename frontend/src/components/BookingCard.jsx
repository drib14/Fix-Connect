import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { formatBookingDate } from '../utils/dateUtils.js';
import { useSelector } from 'react-redux';
import { formatPrice } from '../store/currencySlice.js';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',      color: '#f59e0b', bg: '#fef3c7' },
  accepted:    { label: 'Accepted',     color: '#10b981', bg: '#d1fae5' },
  declined:    { label: 'Declined',     color: '#ef4444', bg: '#fee2e2' },
  'in-progress': { label: 'In Progress', color: '#6366f1', bg: '#ede9fe' },
  completed:   { label: 'Completed',    color: '#059669', bg: '#a7f3d0' },
  cancelled:   { label: 'Cancelled',    color: '#9ca3af', bg: '#f3f4f6' },
};

const BookingCard = ({ booking, viewerRole = 'customer', onActionClick }) => {
  const { selected, rates, currencies } = useSelector(state => state.currency);
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

  const otherParty = viewerRole === 'customer' ? booking.provider : booking.customer;
  const otherAvatar = otherParty?.avatar
    ? otherParty.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParty?.name || 'U')}&background=e5e7eb&color=374151&size=60`;

  return (
    <div className="booking-card" id={`booking-${booking.id || booking._id}`}>
      {/* Status Bar */}
      <div
        className="booking-card-status-bar"
        style={{ backgroundColor: status.bg, borderLeftColor: status.color }}
      >
        <span style={{ color: status.color, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {status.label}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          #{booking.referenceNumber}
        </span>
      </div>

      {/* Card Body */}
      <div className="booking-card-body">
        {/* Other Party */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
          <img src={otherAvatar} alt={otherParty?.name} className="booking-card-avatar" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {otherParty?.name || 'Unknown'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              {booking.category?.name || 'Service'}
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatPrice(booking.totalAmount || 0, rates, selected, currencies)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              est. total
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="booking-card-meta">
          <div className="booking-meta-item">
            <Calendar size={14} />
            <span>{formatBookingDate(booking.scheduledAt)}</span>
          </div>
          {booking.address?.formatted && (
            <div className="booking-meta-item">
              <MapPin size={14} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                {booking.address.formatted}
              </span>
            </div>
          )}
          {booking.estimatedDuration && (
            <div className="booking-meta-item">
              <Clock size={14} />
              <span>{booking.estimatedDuration}hr estimated</span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        {booking.description && (
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            margin: '0.8rem 0',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {booking.description}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
          <Link
            to={`/booking/${booking.id || booking._id}`}
            className="btn btn-outline"
            style={{ flex: 1, justifyContent: 'center', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }}
          >
            View Details <ChevronRight size={14} />
          </Link>

          {/* Provider quick actions */}
          {viewerRole === 'provider' && booking.status === 'pending' && onActionClick && (
            <>
              <button
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem', backgroundColor: 'var(--primary)' }}
                onClick={() => onActionClick(booking, 'accepted')}
              >
                Accept
              </button>
              <button
                className="btn btn-outline"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                onClick={() => onActionClick(booking, 'declined')}
              >
                Decline
              </button>
            </>
          )}

          {viewerRole === 'provider' && booking.status === 'accepted' && onActionClick && (
            <button
              className="btn btn-primary"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
              onClick={() => onActionClick(booking, 'in-progress')}
            >
              Start Job
            </button>
          )}

          {viewerRole === 'provider' && booking.status === 'in-progress' && onActionClick && (
            <button
              className="btn btn-primary"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
              onClick={() => onActionClick(booking, 'completed')}
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
