import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, MessageCircle, Calendar, MapPin, Clock, User,
  CheckCircle, XCircle, AlertCircle, Star, Send, Navigation
} from 'lucide-react';
import { fetchBookingById, updateBookingStatus } from '../store/bookingSlice.js';
import { fetchMessages, addMessage, setActiveChat, sendMessageREST } from '../store/chatSlice.js';
import { formatPrice } from '../store/currencySlice.js';
import { formatBookingDate, formatRelativeTime, formatTime } from '../utils/dateUtils.js';
import StarRating from '../components/StarRating.jsx';
import Modal from '../components/Modal.jsx';
import { initSocket, getSocket } from '../socket.js';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'pending', label: 'Request Sent', icon: <AlertCircle size={18} />, color: '#f59e0b' },
  { key: 'accepted', label: 'Accepted', icon: <CheckCircle size={18} />, color: '#10b981' },
  { key: 'in-progress', label: 'In Progress', icon: <Clock size={18} />, color: '#6366f1' },
  { key: 'completed', label: 'Completed', icon: <CheckCircle size={18} />, color: '#059669' },
];

const BookingDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken, user } = useSelector(state => state.auth);
  const { activeBooking } = useSelector(state => state.bookings);
  const { messages, messagesLoading } = useSelector(state => state.chat);
  const { selected, rates, currencies } = useSelector(state => state.currency);

  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '', tags: [] });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const booking = activeBooking;
  const isCustomer = booking && String(booking.customer?._id || booking.customer) === user?.id;
  const isProvider = booking && String(booking.provider?._id || booking.provider) === user?.id;
  const otherParty = isCustomer ? booking?.provider : booking?.customer;
  const otherPartyId = isCustomer ? (booking?.provider?._id || booking?.provider) : (booking?.customer?._id || booking?.customer);

  useEffect(() => {
    const load = async () => {
      try {
        await dispatch(fetchBookingById({ token: accessToken, id })).unwrap();
      } catch { navigate('/dashboard'); }
      finally { setLoading(false); }
    };
    if (accessToken) load();
  }, [id, accessToken, dispatch, navigate]);

  // Socket.IO — join booking room
  useEffect(() => {
    if (!accessToken || !id) return;
    const socket = initSocket(accessToken);
    socket.emit('join-booking', { bookingId: id });
    dispatch(setActiveChat(id));

    socket.on('new-message', (msg) => {
      dispatch(addMessage(msg));
    });

    socket.on('booking-updated', (data) => {
      if (data.bookingId === id) {
        dispatch(fetchBookingById({ token: accessToken, id }));
        toast.success(`Booking status updated to ${data.status}`);
      }
    });

    return () => {
      const s = getSocket();
      if (s) {
        s.emit('leave-booking', { bookingId: id });
        s.off('new-message');
        s.off('booking-updated');
      }
    };
  }, [id, accessToken, dispatch]);

  // Load messages when chat opens
  useEffect(() => {
    if (chatOpen && accessToken && id) {
      dispatch(fetchMessages({ token: accessToken, bookingId: id }));
    }
  }, [chatOpen, id, accessToken, dispatch]);

  const handleSendMessage = async () => {
    if (!msgInput.trim() || sendingMsg) return;
    setSendingMsg(true);
    try {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('send-message', { bookingId: id, receiverId: String(otherPartyId), text: msgInput.trim() });
        setMsgInput('');
      } else {
        await dispatch(sendMessageREST({ token: accessToken, bookingId: id, text: msgInput.trim(), receiverId: String(otherPartyId) })).unwrap();
        setMsgInput('');
      }
    } catch { toast.error('Message failed to send'); }
    finally { setSendingMsg(false); }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await dispatch(updateBookingStatus({ token: accessToken, id, status: newStatus })).unwrap();
      toast.success(`Booking ${newStatus}!`);
      dispatch(fetchBookingById({ token: accessToken, id }));
    } catch (err) { toast.error(err || 'Action failed'); }
    finally { setCancelModal(false); }
  };

  const handleReviewSubmit = async () => {
    setReviewLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ bookingId: id, ...reviewData }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Review submitted! Thank you.');
        setReviewModal(false);
        dispatch(fetchBookingById({ token: accessToken, id }));
      } else {
        toast.error(data.message || 'Review failed');
      }
    } catch { toast.error('Network error'); }
    finally { setReviewLoading(false); }
  };

  const currentStatusIdx = STATUS_STEPS.findIndex(s => s.key === booking?.status);

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <AlertCircle size={48} style={{ opacity: 0.3 }} />
          <h3>Booking not found</h3>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const otherAvatar = otherParty?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParty?.name || 'U')}&background=e5e7eb&color=374151&size=80`;

  return (
    <div className="page-container animate-fade">
      {/* Back Button */}
      <button className="btn btn-outline" style={{ marginBottom: '1.5rem', alignSelf: 'flex-start' }} onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="booking-detail-layout">
        {/* ── Main Panel ── */}
        <div className="booking-detail-main">
          {/* Status Timeline */}
          <div className="status-timeline-card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '1rem' }}>
              Booking #{booking.referenceNumber}
            </div>
            <div className="status-timeline">
              {STATUS_STEPS.map((s, i) => {
                const isDone = i <= currentStatusIdx && booking.status !== 'cancelled';
                const isCurrent = i === currentStatusIdx && booking.status !== 'cancelled';
                return (
                  <React.Fragment key={s.key}>
                    <div className="timeline-step">
                      <div className={`timeline-dot ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`} style={{ color: isDone ? s.color : undefined, borderColor: isDone ? s.color : undefined }}>
                        {isDone ? s.icon : <span style={{ width: '18px', height: '18px', borderRadius: '50%', display: 'block' }} />}
                      </div>
                      <span className={`timeline-label ${isCurrent ? 'current' : ''}`}>{s.label}</span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div className={`timeline-connector ${i < currentStatusIdx ? 'done' : ''}`} />}
                  </React.Fragment>
                );
              })}
              {booking.status === 'cancelled' && (
                <div className="timeline-step">
                  <div className="timeline-dot done" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                    <XCircle size={18} />
                  </div>
                  <span className="timeline-label current" style={{ color: '#ef4444' }}>Cancelled</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Card */}
          <div className="detail-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img src={otherAvatar} alt={otherParty?.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{otherParty?.name || 'Unknown'}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {isCustomer ? 'Your Service Provider' : 'Customer'}
                </p>
                {otherParty?.phone && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{otherParty.phone}</p>
                )}
              </div>
              <button className="btn btn-outline" style={{ marginLeft: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} onClick={() => setChatOpen(v => !v)}>
                <MessageCircle size={16} /> Chat
              </button>
            </div>

            <div className="detail-info-grid">
              <div className="detail-info-item">
                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled</div>
                  <div style={{ fontWeight: 600 }}>{formatBookingDate(booking.scheduledAt)}</div>
                </div>
              </div>
              <div className="detail-info-item">
                <Clock size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration</div>
                  <div style={{ fontWeight: 600 }}>{booking.estimatedDuration || 1}hr estimated</div>
                </div>
              </div>
              {booking.address?.formatted && (
                <div className="detail-info-item" style={{ gridColumn: '1 / -1' }}>
                  <MapPin size={16} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address</div>
                    <div style={{ fontWeight: 600 }}>{booking.address.formatted}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: 'var(--background)', borderRadius: '10px', padding: '1rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Description</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{booking.description}</p>
            </div>

            {/* Estimated Cost */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Estimated Cost</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                {formatPrice(booking.totalAmount || 0, rates, selected, currencies)}
              </span>
            </div>
          </div>

          {/* Provider Notes */}
          {booking.providerNotes && (
            <div className="detail-card" style={{ borderLeft: '3px solid var(--primary)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Provider Notes</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{booking.providerNotes}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {isCustomer && booking.status === 'pending' && (
              <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => setCancelModal(true)}>
                <XCircle size={16} /> Cancel Booking
              </button>
            )}
            {isCustomer && booking.status === 'completed' && !booking.isReviewed && (
              <button className="btn btn-primary" onClick={() => setReviewModal(true)}>
                <Star size={16} /> Leave a Review
              </button>
            )}
          </div>
        </div>

        {/* ── Chat Panel ── */}
        {chatOpen && (
          <div className="chat-panel animate-fade">
            <div className="chat-header">
              <img src={otherAvatar} alt={otherParty?.name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{otherParty?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In-booking chat</div>
              </div>
              <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setChatOpen(false)}>✕</button>
            </div>

            <div className="chat-messages">
              {messagesLoading ? (
                <div className="loading-center">
                  <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '24px', height: '24px' }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '200px' }}>
                  <MessageCircle size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = (msg.sender?._id || msg.sender) === user?.id;
                  return (
                    <div key={msg.id || msg._id || i} className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                      <div className="chat-bubble-text">{msg.text}</div>
                      <div className="chat-bubble-time">{formatTime(msg.createdAt)}</div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="chat-input-row">
              <input
                className="chat-input"
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              />
              <button className="btn btn-primary" style={{ padding: '0.6rem 0.9rem' }} onClick={handleSendMessage} disabled={sendingMsg || !msgInput.trim()}>
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation */}
      <Modal isOpen={cancelModal} title="Cancel Booking" description={`Are you sure you want to cancel booking #${booking?.referenceNumber}?`} confirmText="Yes, Cancel" cancelText="Keep It" onConfirm={() => handleStatusUpdate('cancelled')} onCancel={() => setCancelModal(false)} />

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Leave a Review</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              How was your experience with {booking.provider?.name}?
            </p>
            <div style={{ marginBottom: '1.2rem' }}>
              <label className="form-label">Rating</label>
              <StarRating value={reviewData.rating} onChange={r => setReviewData(d => ({ ...d, rating: r }))} size={32} />
            </div>
            <div style={{ marginBottom: '1.2rem' }}>
              <label className="form-label">Comment (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                value={reviewData.comment}
                onChange={e => setReviewData(d => ({ ...d, comment: e.target.value }))}
                placeholder="Share details of your experience..."
              />
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReviewModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleReviewSubmit} disabled={reviewLoading}>
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
