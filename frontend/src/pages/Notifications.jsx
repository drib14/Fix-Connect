import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, Calendar, Check, X, Star, MessageCircle, AlertCircle, CheckCheck } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../store/notificationSlice.js';
import { formatRelativeTime } from '../utils/dateUtils.js';

const iconMap = {
  calendar: Calendar, check: Check, x: X, message: MessageCircle,
  star: Star, bell: Bell, alert: AlertCircle,
};
const colorMap = {
  calendar: '#6366f1', check: '#10b981', x: '#ef4444', message: '#3b82f6',
  star: '#f59e0b', bell: '#8b5cf6', alert: '#f97316',
};

const Notifications = () => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector(state => state.auth);
  const { notifications, unreadCount, loading } = useSelector(state => state.notifications);

  useEffect(() => {
    if (accessToken) dispatch(fetchNotifications(accessToken));
  }, [dispatch, accessToken]);

  const handleMarkAll = () => dispatch(markAllNotificationsRead(accessToken));

  return (
    <div className="page-container animate-fade" style={{ maxWidth: '700px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bell size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)' }} />
            Notifications
          </h1>
          <p className="page-subtitle">Stay up to date with your bookings and messages</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" style={{ fontSize: '0.82rem' }} onClick={handleMarkAll}>
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-center" style={{ padding: '4rem' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px' }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={56} style={{ opacity: 0.15, marginBottom: '1rem' }} />
          <h3>No notifications yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Booking updates, messages, and alerts will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {notifications.map(n => {
            const Icon = iconMap[n.iconType] || Bell;
            const color = colorMap[n.iconType] || '#8b5cf6';
            const nId = n.id || n._id;
            const bookingId = n.relatedBooking?._id || n.relatedBooking;

            return (
              <div
                key={nId}
                className={`notif-full-item ${n.isRead ? '' : 'unread'}`}
                onClick={() => !n.isRead && dispatch(markNotificationRead({ token: accessToken, id: nId }))}
              >
                <div className="notif-full-icon" style={{ backgroundColor: `${color}15`, color }}>
                  <Icon size={20} />
                </div>
                <div className="notif-full-content">
                  <div className="notif-full-title">
                    {n.title}
                    {!n.isRead && <span className="notif-unread-pill">New</span>}
                  </div>
                  <div className="notif-full-body">{n.body}</div>
                  <div className="notif-full-time">{formatRelativeTime(n.createdAt)}</div>
                  {bookingId && (
                    <Link
                      to={`/booking/${bookingId}`}
                      className="notif-booking-link"
                      onClick={e => e.stopPropagation()}
                    >
                      View Booking →
                    </Link>
                  )}
                </div>
                <button
                  className="notif-delete-btn"
                  onClick={e => { e.stopPropagation(); dispatch(deleteNotification({ token: accessToken, id: nId })); }}
                  title="Delete notification"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
