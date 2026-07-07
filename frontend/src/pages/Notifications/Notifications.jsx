import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { Bell, Check, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function Notifications() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.notifications || [];
    }
  });

  // Mark single as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.put(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const handleMarkAllRead = async () => {
    if (!notifications || notifications.length === 0) return;
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    
    try {
      await Promise.all(unread.map(n => api.put(`/notifications/${n._id}/read`)));
      toast.success('All notifications marked as read.');
      queryClient.invalidateQueries(['notifications']);
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '750px', margin: '0 auto' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0 text-dark">Notifications</h4>
        {notifications && notifications.filter(n => !n.read).length > 0 && (
          <button 
            className="btn btn-outline-success btn-sm fw-bold d-flex align-items-center gap-1"
            onClick={handleMarkAllRead}
          >
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-success" role="status" />
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {notifications.map((notif) => (
            <div 
              key={notif._id} 
              className={`card border-0 shadow-sm p-3 position-relative ${!notif.read ? 'border-start border-4 border-success' : ''}`}
              style={{ borderRadius: '12px', backgroundColor: notif.read ? '#FFFFFF' : '#F9FBF9' }}
            >
              <div className="card-body p-1 d-flex gap-3 align-items-start">
                <div 
                  className={`p-2 rounded-circle ${!notif.read ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-secondary'}`}
                  style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justify: 'center' }}
                >
                  <Bell size={18} />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className={`fw-bold mb-1 ${!notif.read ? 'text-dark' : 'text-secondary'}`}>{notif.title}</h6>
                    <span className="text-secondary" style={{ fontSize: 10 }}>
                      {dayjs(notif.created_at).format('MMM DD, hh:mm A')}
                    </span>
                  </div>
                  <p className="text-secondary small mb-0">{notif.message}</p>
                </div>
                {!notif.read && (
                  <button 
                    className="btn btn-light btn-sm rounded-circle p-1 border-0 hover-bg-light"
                    onClick={() => markReadMutation.mutate(notif._id)}
                    title="Mark as read"
                  >
                    <Check size={14} className="text-secondary" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 bg-white rounded shadow-sm border">
          <AlertCircle className="text-secondary mx-auto mb-2" size={48} />
          <h5 className="fw-bold text-dark mb-1">No notifications</h5>
          <p className="text-secondary small">You will receive alerts here regarding booking status and updates.</p>
        </div>
      )}
    </div>
  );
}
