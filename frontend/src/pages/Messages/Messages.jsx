import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import { Send, Image as ImageIcon, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const providerIdParam = searchParams.get('providerId') || '';

  const user = useSelector((state) => state.auth.user);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState({
    id: providerIdParam || 'system_support',
    name: providerIdParam ? 'Technician Contact' : 'FixConnect Helpdesk',
    avatar: providerIdParam ? 'T' : 'H'
  });

  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const resolvedBase = api.defaults.baseURL || 'http://localhost:5000/api';
    const socketUrl = resolvedBase.replace('/api', '');

    const socket = io(socketUrl, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    if (user?._id) {
      socket.on(`message:${user._id}`, (incomingMsg) => {
        // If the incoming message is from the active conversation, append it
        if (incomingMsg.sender_id === activeChatUser.id || incomingMsg.sender_id === user._id) {
          setMessages((prev) => [...prev, incomingMsg]);
        }
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [user, activeChatUser]);

  // Load chat messages when active conversation user changes
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!activeChatUser.id) return;
      try {
        setLoadingMessages(true);
        const response = await api.get(`/messages/${activeChatUser.id}`);
        setMessages(response.data.messages || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchChatMessages();
  }, [activeChatUser]);

  // Auto Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    try {
      const response = await api.post('/messages', {
        receiver_id: activeChatUser.id,
        text: textToSend,
      });
      // Append the message to the conversation immediately (or let socket push it)
      setMessages((prev) => [...prev, response.data.message]);
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  return (
    <div className="container-fluid p-0 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Active Chat Header */}
      <div className="d-flex align-items-center gap-3 p-3 bg-white border-bottom" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
        <div 
          className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold bg-success"
          style={{ width: 40, height: 40, fontSize: 16 }}
        >
          {activeChatUser.avatar}
        </div>
        <div>
          <h6 className="fw-bold mb-0 text-dark">{activeChatUser.name}</h6>
          <small className="text-success small d-flex align-items-center gap-1">
            <span className="bg-success rounded-circle" style={{ width: 6, height: 6, display: 'inline-block' }} /> Online Support
          </small>
        </div>
      </div>

      {/* Messages Scroll Panel */}
      <div className="flex-grow-1 overflow-auto bg-light p-3" style={{ backgroundImage: 'radial-gradient(circle, #E2E8F0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        {loadingMessages ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-success" role="status" />
          </div>
        ) : messages.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {messages.map((msg, index) => {
              const isMe = msg.sender_id === user?._id;
              return (
                <div 
                  key={msg._id || index}
                  className={`d-flex flex-column max-w-75 p-3 rounded shadow-sm ${isMe ? 'bg-success text-white align-self-end' : 'bg-white text-dark align-self-start'}`}
                  style={{ 
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                    maxWidth: '70%', 
                    wordBreak: 'break-word' 
                  }}
                >
                  <p className="mb-1 small" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  <span 
                    className="text-end d-block" 
                    style={{ fontSize: 9, opacity: 0.7 }}
                  >
                    {dayjs(msg.created_at || Date.now()).format('hh:mm A')}
                  </span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted">
            <AlertCircle size={36} className="text-secondary mb-2" />
            <p className="small mb-0">No messages yet. Send a message to start conversing.</p>
          </div>
        )}
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSendMessage} className="d-flex align-items-center gap-2 p-3 bg-white border-top" style={{ borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
        <input
          type="text"
          placeholder="Type your message here..."
          className="form-control flex-grow-1 border-0 bg-light py-2 px-3 rounded-pill"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="btn btn-success rounded-circle p-2 d-flex align-items-center justify-content-center text-white" style={{ width: 40, height: 40 }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
