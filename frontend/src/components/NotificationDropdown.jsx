import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Calendar, Check, X, Star, MessageCircle, AlertCircle } from 'lucide-react';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../store/notificationSlice.js';
import { formatRelativeTime } from '../utils/dateUtils.js';

const iconMap = {
  calendar: <Calendar size={16} />,
  check: <Check size={16} />,
  x: <X size={16} />,
  message: <MessageCircle size={16} />,
  star: <Star size={16} />,
  bell: <Bell size={16} />,
  alert: <AlertCircle size={16} />,
};

const colorMap = {
  calendar: '#6366f1',
  check: '#10b981',
  x: '#ef4444',
  message: '#3b82f6',
  star: '#f59e0b',
  bell: '#8b5cf6',
  alert: '#f97316',
};

const NotificationDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector(state => state.auth);
  const { notifications, unreadCount, loading } = useSelector(state => state.notifications);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchNotifications(accessToken));
    }
  }, [dispatch, accessToken]);

  const recent = notifications.slice(0, 6);

  const handleMarkRead = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(markNotificationRead({ token: accessToken, id }));
  };

  const handleMarkAll = () => {
    dispatch(markAllNotificationsRead(accessToken));
  };

  return (
    <div className="notif-dropdown" role="dialog" aria-label="Notifications">
      {/* Header */}
      <div className="notif-dropdown-header">
        <span className="notif-dropdown-title">
          <Bell size={16} /> Notifications
          {unreadCount > 0 && <span className="notif-count-badge">{unreadCount}</span>}
        </span>
        {unreadCount > 0 && (
          <button className="notif-mark-all" onClick={handleMarkAll}>
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="notif-list">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '24px', height: '24px', margin: 'auto' }} />
          </div>
        ) : recent.length === 0 ? (
          <div className="notif-empty">
            <Bell size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>No notifications yet</p>
          </div>
        ) : (
          recent.map((n) => (
            <Link
              key={n.id || n._id}
              to={n.relatedBooking ? `/booking/${n.relatedBooking._id || n.relatedBooking}` : '/notifications'}
              className={`notif-item ${n.isRead ? '' : 'unread'}`}
              onClick={() => { onClose(); if (!n.isRead) dispatch(markNotificationRead({ token: accessToken, id: n.id || n._id })); }}
            >
              <div
                className="notif-icon"
                style={{ backgroundColor: `${colorMap[n.iconType] || '#8b5cf6'}20`, color: colorMap[n.iconType] || '#8b5cf6' }}
              >
                {iconMap[n.iconType] || <Bell size={16} />}
              </div>
              <div className="notif-content">
                <div className="notif-title">{n.title}</div>
                <div className="notif-body">{n.body}</div>
                <div className="notif-time">{formatRelativeTime(n.createdAt)}</div>
              </div>
              {!n.isRead && <div className="notif-dot" />}
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <Link to="/notifications" className="notif-view-all" onClick={onClose}>
        View all notifications →
      </Link>
    </div>
  );
};

export default NotificationDropdown;
