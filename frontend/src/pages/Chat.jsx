import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Clock, Check, CheckCheck } from 'lucide-react';
import { fetchConversations, fetchMessages, addMessage, sendMessageREST, setActiveChat, setTyping } from '../store/chatSlice.js';
import { formatRelativeTime, formatTime } from '../utils/dateUtils.js';
import { initSocket, getSocket } from '../socket.js';

const Chat = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector(state => state.auth);
  const { conversations, messages, activeBookingId, messagesLoading, loading, typing } = useSelector(state => state.chat);
  const [msgInput, setMsgInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    if (accessToken) dispatch(fetchConversations(accessToken));
  }, [dispatch, accessToken]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = (bookingId) => {
    dispatch(setActiveChat(bookingId));
    dispatch(fetchMessages({ token: accessToken, bookingId }));

    // Join socket room
    const socket = initSocket(accessToken);
    socket.emit('join-booking', { bookingId });
    socket.off('new-message');
    socket.on('new-message', (msg) => dispatch(addMessage(msg)));
    socket.off('user-typing');
    socket.on('user-typing', () => { dispatch(setTyping(true)); setTimeout(() => dispatch(setTyping(false)), 2000); });
  };

  const activeConvo = conversations.find(c => String(c.bookingId) === String(activeBookingId));
  const receiverId = activeConvo
    ? user?.role === 'customer'
      ? String(activeConvo.otherParty?._id)
      : String(activeConvo.otherParty?._id)
    : null;

  const handleSend = async () => {
    if (!msgInput.trim() || sendingMsg || !activeBookingId || !receiverId) return;
    setSendingMsg(true);
    try {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('send-message', { bookingId: activeBookingId, receiverId, text: msgInput.trim() });
        setMsgInput('');
      } else {
        await dispatch(sendMessageREST({ token: accessToken, bookingId: activeBookingId, text: msgInput.trim(), receiverId })).unwrap();
        setMsgInput('');
      }
    } catch {} finally { setSendingMsg(false); }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket && activeBookingId) {
      socket.emit('typing-start', { bookingId: activeBookingId });
    }
  };

  return (
    <div className="chat-page animate-fade">
      {/* ── Conversations Sidebar ── */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <MessageCircle size={18} style={{ marginRight: '0.5rem', color: 'var(--primary)', verticalAlign: 'middle' }} />
            Messages
          </h2>
        </div>

        {loading ? (
          <div className="loading-center" style={{ padding: '3rem' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '24px', height: '24px' }} />
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
            <MessageCircle size={36} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No conversations yet</p>
            <Link to="/book" className="btn btn-primary" style={{ marginTop: '1rem', fontSize: '0.82rem' }}>Book a Service</Link>
          </div>
        ) : (
          conversations.map(convo => {
            const isActive = String(convo.bookingId) === String(activeBookingId);
            const avatar = convo.otherParty?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(convo.otherParty?.name || 'U')}&background=e5e7eb&color=374151&size=60`;
            return (
              <button
                key={String(convo.bookingId)}
                className={`convo-item ${isActive ? 'active' : ''}`}
                onClick={() => openConversation(convo.bookingId)}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={avatar} alt={convo.otherParty?.name} className="convo-avatar" />
                  {convo.unreadCount > 0 && (
                    <span className="convo-unread-badge">{convo.unreadCount}</span>
                  )}
                </div>
                <div className="convo-info">
                  <div className="convo-name">{convo.otherParty?.name || 'Unknown'}</div>
                  <div className="convo-preview">
                    {convo.lastMessage ? convo.lastMessage.text?.substring(0, 45) + (convo.lastMessage.text?.length > 45 ? '…' : '') : `${convo.category?.name || 'Booking'} chat`}
                  </div>
                </div>
                <div className="convo-meta">
                  <div className="convo-time">{convo.lastMessage ? formatRelativeTime(convo.lastMessage.createdAt) : ''}</div>
                  <div className="convo-status-chip">{convo.status}</div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* ── Message Thread ── */}
      <div className="chat-thread">
        {!activeBookingId ? (
          <div className="empty-state" style={{ flex: 1 }}>
            <MessageCircle size={56} style={{ opacity: 0.15, marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-muted)' }}>Select a conversation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Choose a booking conversation from the list</p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            {activeConvo && (
              <div className="chat-thread-header">
                <img
                  src={activeConvo.otherParty?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConvo.otherParty?.name || 'U')}&size=60`}
                  alt={activeConvo.otherParty?.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeConvo.otherParty?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Booking #{activeConvo.referenceNumber} · {activeConvo.category?.name}
                  </div>
                </div>
                <Link to={`/booking/${activeConvo.bookingId}`} className="btn btn-outline" style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  View Booking
                </Link>
              </div>
            )}

            {/* Messages */}
            <div className="chat-messages-thread">
              {messagesLoading ? (
                <div className="loading-center" style={{ flex: 1 }}>
                  <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '28px', height: '28px' }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-state" style={{ flex: 1 }}>
                  <MessageCircle size={36} style={{ opacity: 0.15 }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>No messages yet. Say hello!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const isMine = (msg.sender?._id || msg.sender) === user?.id;
                    return (
                      <div key={msg.id || msg._id || i} className={`chat-message-row ${isMine ? 'mine' : 'theirs'}`}>
                        {!isMine && (
                          <img
                            src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || 'U')}&size=40&background=e5e7eb&color=374151`}
                            alt={msg.sender?.name}
                            className="chat-msg-avatar"
                          />
                        )}
                        <div className={`chat-bubble-v2 ${isMine ? 'mine' : 'theirs'}`}>
                          <div className="chat-bubble-v2-text">{msg.text}</div>
                          <div className="chat-bubble-v2-time">
                            {formatTime(msg.createdAt)}
                            {isMine && (msg.isRead ? <CheckCheck size={12} style={{ color: '#60a5fa' }} /> : <Check size={12} />)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {typing && (
                    <div className="chat-message-row theirs">
                      <div className="chat-bubble-v2 theirs">
                        <div className="typing-indicator"><span /><span /><span /></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="chat-input-bar">
              <input
                className="chat-input-full"
                value={msgInput}
                onChange={e => { setMsgInput(e.target.value); handleTyping(); }}
                placeholder="Type a message..."
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
              <button
                className="btn btn-primary"
                style={{ padding: '0.65rem 1rem', borderRadius: '10px' }}
                onClick={handleSend}
                disabled={sendingMsg || !msgInput.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
