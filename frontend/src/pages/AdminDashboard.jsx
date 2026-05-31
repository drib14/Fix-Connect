import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  Users,
  Briefcase,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle,
  FileText,
  UserCheck,
  UserX,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { SkeletonMetrics } from '../components/Skeleton';

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'verify' | 'moderate'

  const API_URL = 'http://localhost:5050/api/admin';

  useEffect(() => {
    fetchAdminData();
  }, [activeSubTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fixconnect_token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activeSubTab === 'overview') {
        const statsResponse = await axios.get(`${API_URL}/stats`, { headers });
        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }
      } else if (activeSubTab === 'verify') {
        const verifyResponse = await axios.get(`${API_URL}/workers/pending`, { headers });
        if (verifyResponse.data.success) {
          setPendingWorkers(verifyResponse.data.data);
        }
      } else if (activeSubTab === 'moderate') {
        const usersResponse = await axios.get(`${API_URL}/users`, { headers });
        if (usersResponse.data.success) {
          setUsersList(usersResponse.data.users);
        }
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Worker Action
  const handleVerifyWorker = async (profileId) => {
    try {
      const token = localStorage.getItem('fixconnect_token');
      const response = await axios.put(
        `${API_URL}/workers/${profileId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert('Worker verification completed successfully!');
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to verify worker.');
    }
  };

  // Moderate user status
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change user status to ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem('fixconnect_token');
      const response = await axios.put(
        `${API_URL}/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to moderate user.');
    }
  };

  return (
    <div style={{ minHeight: '90vh', paddingBottom: '60px' }}>
      {/* Header bar */}
      <header
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'between',
          padding: '16px 28px',
          borderRadius: '0 0 20px 20px',
          marginBottom: '32px',
          transform: 'none',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', color: '#0f172a' }}>FixConnect Admin</h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            Control Center &bull; <strong style={{ color: '#10b981' }}>{user.name}</strong>
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '12px', marginRight: '24px' }}>
          <button
            className={`btn ${activeSubTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setActiveSubTab('overview')}
          >
            Overview Stats
          </button>
          <button
            className={`btn ${activeSubTab === 'verify' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setActiveSubTab('verify')}
          >
            Verify Queue ({pendingWorkers.length})
          </button>
          <button
            className={`btn ${activeSubTab === 'moderate' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setActiveSubTab('moderate')}
          >
            Moderate Users
          </button>
        </div>

        <button
          onClick={onLogout}
          className="btn btn-danger"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Sign Out
        </button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* OVERVIEW STATS TAB */}
        {activeSubTab === 'overview' && (
          <div>
            {loading && !stats ? (
              <SkeletonMetrics />
            ) : (
              stats && (
                <div>
                  {/* Summary Metric Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '24px',
                      marginBottom: '40px',
                    }}
                  >
                    <div className="glass-card" style={{ padding: '24px', transform: 'none' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={16} color="#10b981" /> Total Platform Revenue
                      </span>
                      <h2 style={{ fontSize: '32px', color: '#10b981', marginTop: '8px' }}>
                        ${stats.totalEarnings.toFixed(2)}
                      </h2>
                    </div>

                    <div className="glass-card" style={{ padding: '24px', transform: 'none' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={16} color="#10b981" /> Total Registered Clients
                      </span>
                      <h2 style={{ fontSize: '32px', color: '#0f172a', marginTop: '8px' }}>
                        {stats.totalUsers} Clients
                      </h2>
                    </div>

                    <div className="glass-card" style={{ padding: '24px', transform: 'none' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={16} color="#10b981" /> Active Service Experts
                      </span>
                      <h2 style={{ fontSize: '32px', color: '#0f172a', marginTop: '8px' }}>
                        {stats.totalWorkers} Workers
                      </h2>
                    </div>

                    <div className="glass-card" style={{ padding: '24px', transform: 'none' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={16} color="#10b981" /> Total Service Bookings
                      </span>
                      <h2 style={{ fontSize: '32px', color: '#0f172a', marginTop: '8px' }}>
                        {stats.totalBookings} Orders
                      </h2>
                    </div>
                  </div>

                  {/* Booking Ratio Details */}
                  <div className="glass-card" style={{ padding: '32px', transform: 'none' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Active Booking States Ratio</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Pending Requests</span>
                        <h4 style={{ fontSize: '24px', marginTop: '4px' }}>{stats.statusBreakdown.pending}</h4>
                      </div>
                      <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1px solid #10b981' }}>
                        <span style={{ color: '#047857', fontSize: '13px' }}>In Progress Jobs</span>
                        <h4 style={{ fontSize: '24px', marginTop: '4px', color: '#10b981' }}>{stats.statusBreakdown.active}</h4>
                      </div>
                      <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                        <span style={{ color: '#047857', fontSize: '13px' }}>Completed Jobs</span>
                        <h4 style={{ fontSize: '24px', marginTop: '4px', color: '#10b981' }}>{stats.statusBreakdown.completed}</h4>
                      </div>
                      <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '16px', border: '1px solid #fee2e2' }}>
                        <span style={{ color: '#ef4444', fontSize: '13px' }}>Cancelled Jobs</span>
                        <h4 style={{ fontSize: '24px', marginTop: '4px', color: '#ef4444' }}>{stats.statusBreakdown.cancelled}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* VERIFICATION QUEUE TAB */}
        {activeSubTab === 'verify' && (
          <div className="glass-card" style={{ padding: '32px', transform: 'none' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Workers Certification Applications Queue</h3>

            {loading ? (
              <p>Loading application folders...</p>
            ) : pendingWorkers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                <h4>Verification Queue Empty</h4>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  There are no pending worker profile certifications awaiting review. Great job!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {pendingWorkers.map((worker) => (
                  <div
                    key={worker._id}
                    style={{
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '16px',
                      padding: '24px',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'between', alignItems: 'start' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <img
                          src={worker.userId?.avatar}
                          alt="Worker"
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '16px' }}>{worker.userId?.name}</h4>
                          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {worker.title}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Contact Email</span>
                        <span style={{ fontSize: '13px', color: '#0f172a' }}>{worker.userId?.email}</span>
                      </div>

                      <div>
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Address Location</span>
                        <span style={{ fontSize: '13px', color: '#0f172a' }}>{worker.userId?.address}</span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Set Billing Rate</span>
                        <strong style={{ fontSize: '18px', color: '#10b981' }}>${worker.hourlyRate}/hr</strong>
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: '#64748b', margin: '16px 0', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                      <strong>Worker Bio:</strong> {worker.bio}
                    </p>

                    {/* Certifications PDFs */}
                    {worker.certifications && worker.certifications.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <span style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                          Uploaded Verification Credentials:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {worker.certifications.map((credUrl, index) => (
                            <a
                              key={index}
                              href={credUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: '#f0fdf4',
                                border: '1px solid #10b981',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: '#047857',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontWeight: '700',
                              }}
                            >
                              <FileText size={14} />
                              <span>View Document {index + 1}</span>
                              <ExternalLink size={12} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'end' }}>
                      <button
                        onClick={() => handleVerifyWorker(worker._id)}
                        className="btn btn-primary"
                        style={{ padding: '8px 18px', fontSize: '13px' }}
                      >
                        <UserCheck size={16} /> Approve & Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODERATE USERS TAB */}
        {activeSubTab === 'moderate' && (
          <div className="glass-card" style={{ padding: '32px', transform: 'none' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Platform Users Registry</h3>

            {loading ? (
              <p>Loading users list...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                      <th style={{ padding: '12px' }}>Name / Role</th>
                      <th style={{ padding: '12px' }}>Email Address</th>
                      <th style={{ padding: '12px' }}>Phone Contact</th>
                      <th style={{ padding: '12px' }}>Address Location</th>
                      <th style={{ padding: '12px' }}>Active Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={usr.avatar}
                            alt="Avatar"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <span style={{ fontWeight: 'bold', display: 'block', color: '#0f172a' }}>{usr.name}</span>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: usr.role === 'admin' ? '#ef4444' : usr.role === 'worker' ? '#10b981' : '#64748b', fontWeight: 'bold' }}>
                              {usr.role}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>{usr.email}</td>
                        <td style={{ padding: '12px' }}>{usr.phone || 'N/A'}</td>
                        <td style={{ padding: '12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {usr.address || 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 'bold',
                              padding: '2px 8px',
                              borderRadius: '99px',
                              textTransform: 'uppercase',
                              background: usr.status === 'active' ? '#f0fdf4' : '#fef2f2',
                              color: usr.status === 'active' ? '#10b981' : '#ef4444',
                            }}
                          >
                            {usr.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {usr.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUserStatus(usr._id, usr.status)}
                              className="btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '11px',
                                border: '1px solid',
                                background: usr.status === 'active' ? '#fef2f2' : '#f0fdf4',
                                borderColor: usr.status === 'active' ? '#fee2e2' : '#d1fae5',
                                color: usr.status === 'active' ? '#ef4444' : '#10b981',
                              }}
                            >
                              {usr.status === 'active' ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <UserX size={12} /> Suspend Account
                                </span>
                              ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <UserCheck size={12} /> Reactivate
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
