import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getPendingWorkers, verifyWorker, getStats, getUsers, deleteUser,
  updateUserStatus, getBookings, getBookingDetails, updateBookingStatus,
  updateUserProfile, getPayments, getReviews, deleteReview
} from '../services/adminService';
import { 
  getTerms, updateTerms, getPrivacy, updatePrivacy,
  getBlogs, createBlog, updateBlog, deleteBlog
} from '../services/contentService';
import { 
  Users, BarChart2, ShieldAlert, CheckCircle, XCircle, 
  Trash2, DollarSign, Hammer, Calendar, LogOut, ArrowRight,
  MessageSquare, FileText, Ban, Check, Edit3, Plus, X, Loader, Search, RefreshCw,
  Star, CreditCard, Edit, Save, MapPin
} from 'lucide-react';

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'verifications', 'users', 'bookings', 'payments', 'reviews', 'content'
  const [stats, setStats] = useState(null);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Bookings Auditing States
  const [bookingsList, setBookingsList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);

  // Payments / Transactions States
  const [paymentsList, setPaymentsList] = useState([]);

  // Reviews Moderation States
  const [reviewsList, setReviewsList] = useState([]);

  // User Profile Editor States
  const [editingUser, setEditingUser] = useState(null); // user object to edit
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    specialty: '',
    hourlyRate: 0,
    bio: '',
    experienceYears: 0,
    address: '',
    coordinates: [0, 0],
    status: '',
    onboardingCompleted: true
  });

  // Content Customizer States
  const [contentSubTab, setContentSubTab] = useState('terms'); // 'terms', 'privacy', 'blogs'
  const [termsText, setTermsText] = useState('');
  const [privacyText, setPrivacyText] = useState('');
  const [blogsList, setBlogsList] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null); // null, 'NEW', or blog object
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', author: '', slug: '', status: 'PUBLISHED' });

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const statsData = await getStats();
        setStats(statsData);
      } else if (activeTab === 'verifications') {
        const list = await getPendingWorkers();
        setPendingWorkers(list);
      } else if (activeTab === 'users') {
        const list = await getUsers();
        setAllUsers(list);
      } else if (activeTab === 'bookings') {
        const list = await getBookings();
        setBookingsList(list);
      } else if (activeTab === 'payments') {
        const list = await getPayments();
        setPaymentsList(list);
      } else if (activeTab === 'reviews') {
        const list = await getReviews();
        setReviewsList(list);
      } else if (activeTab === 'content') {
        const t = await getTerms();
        const p = await getPrivacy();
        const b = await getBlogs();
        setTermsText(t);
        setPrivacyText(p);
        setBlogsList(b);
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWorker = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action === 'APPROVE' ? 'approve' : 'reject'} this worker?`)) return;
    setActionLoading(true);
    try {
      await verifyWorker(id, action);
      const list = await getPendingWorkers();
      setPendingWorkers(list);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('WARNING: Deleting this user will remove their account and all associated booking/earnings logs from the database. Proceed?')) return;
    setActionLoading(true);
    try {
      await deleteUser(id);
      const list = await getUsers();
      setAllUsers(list);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserBlock = async (id, currentStatus) => {
    const isBlocked = currentStatus === 'BLOCKED';
    const actionText = isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${actionText} this user account?`)) return;

    setActionLoading(true);
    try {
      const newStatus = isBlocked ? 'ACTIVE' : 'BLOCKED';
      await updateUserStatus(id, newStatus);
      const list = await getUsers();
      setAllUsers(list);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // User Profile editor handlers
  const handleOpenUserEditor = (u) => {
    setEditingUser(u);
    setUserForm({
      fullName: u.fullName || '',
      email: u.email || '',
      phoneNumber: u.phoneNumber || '',
      role: u.role || 'USER',
      specialty: u.specialty || '',
      hourlyRate: u.hourlyRate || 0,
      bio: u.bio || '',
      experienceYears: u.experienceYears || 0,
      address: u.address || '',
      coordinates: u.coordinates && u.coordinates.length === 2 ? u.coordinates : [120.9842, 14.5995],
      status: u.status || 'ACTIVE',
      onboardingCompleted: u.onboardingCompleted ?? true
    });
  };

  const handleSaveUserProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateUserProfile(editingUser._id, userForm);
      setEditingUser(null);
      const list = await getUsers();
      setAllUsers(list);
      alert('User profile updated successfully.');
    } catch (err) {
      alert('Failed to save profile details: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Booking details chat transcript reader
  const handleInspectBooking = async (id) => {
    setBookingDetailsLoading(true);
    try {
      const details = await getBookingDetails(id);
      setSelectedBooking(details);
    } catch (err) {
      alert('Failed to load booking details: ' + (err.response?.data?.message || err.message));
    } finally {
      setBookingDetailsLoading(false);
    }
  };

  const handleForceCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to FORCE CANCEL this booking? This action is irreversible.')) return;
    setActionLoading(true);
    try {
      await updateBookingStatus(id, 'CANCELLED');
      const details = await getBookingDetails(id);
      setSelectedBooking(details);
      const list = await getBookings();
      setBookingsList(list);
    } catch (err) {
      alert('Failed to cancel booking: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Review deletion & ratings recalculation
  const handleDeleteReview = async (bookingId) => {
    if (!window.confirm('Are you sure you want to moderate and DELETE this rating/review? The system will automatically recalculate this worker\'s average score rating.')) return;
    setActionLoading(true);
    try {
      await deleteReview(bookingId);
      const list = await getReviews();
      setReviewsList(list);
      alert('Review successfully moderated and deleted. Worker statistics updated.');
    } catch (err) {
      alert('Failed to delete review: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Content Customizer handlers
  const handleSaveTerms = async () => {
    setActionLoading(true);
    try {
      await updateTerms(termsText);
      alert('Terms and Conditions updated successfully.');
    } catch (err) {
      alert('Failed to save terms: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setActionLoading(true);
    try {
      await updatePrivacy(privacyText);
      alert('Privacy Policy updated successfully.');
    } catch (err) {
      alert('Failed to save privacy policy: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenBlogForm = (blog) => {
    if (blog === 'NEW') {
      setEditingBlog('NEW');
      setBlogForm({ title: '', excerpt: '', content: '', author: user.fullName || 'Admin', slug: '', status: 'PUBLISHED' });
    } else {
      setEditingBlog(blog);
      setBlogForm({
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        author: blog.author,
        slug: blog.slug,
        status: blog.status,
      });
    }
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingBlog === 'NEW') {
        await createBlog(blogForm);
      } else {
        await updateBlog(editingBlog._id, blogForm);
      }
      setEditingBlog(null);
      const b = await getBlogs();
      setBlogsList(b);
    } catch (err) {
      alert('Failed to save blog post: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    setActionLoading(true);
    try {
      await deleteBlog(id);
      const b = await getBlogs();
      setBlogsList(b);
    } catch (err) {
      alert('Failed to delete blog post: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden select-none">
      
      {/* Admin Sidebar */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-6">
        <div className="space-y-6 text-left">
          {/* Admin Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center font-display font-black text-white text-lg shadow-lg shadow-primary-500/20">
              FC
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight text-white font-display">Fix-Connect</h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Desktop Admin Portal</span>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/15'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
              <span>Metrics Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'verifications'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/15'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center space-x-3">
                <ShieldAlert className="w-5 h-5" />
                <span>Verification Queue</span>
              </span>
              {pendingWorkers.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {pendingWorkers.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/15'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>User Directories</span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/15'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Booking Audits</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/15'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Financial Audits</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/15'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Star className="w-5 h-5" />
              <span>Review Moderation</span>
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/15'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Content Customizer</span>
            </button>
          </nav>
        </div>

        {/* User profile footer info */}
        <div className="space-y-4 text-left">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-300">
              A
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 truncate">{user.fullName}</p>
              <span className="text-[9px] text-slate-500 font-bold uppercase">System Operator</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 text-slate-400 rounded-xl text-xs font-bold transition border border-slate-800 hover:border-rose-900/40 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Operator</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header bar */}
        <header className="h-16 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between px-8 text-left">
          <h1 className="text-lg font-bold font-display text-white">
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'verifications' && 'Worker Verifications'}
            {activeTab === 'users' && 'Manage User Directories'}
            {activeTab === 'bookings' && 'Booking Dispatch Audits'}
            {activeTab === 'payments' && 'Financial Audits'}
            {activeTab === 'reviews' && 'Reviews Moderation Queue'}
            {activeTab === 'content' && 'Content & Legal Customizer'}
          </h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchAdminData} 
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              title="Refresh Roster Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>Operator Mode</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm space-y-2">
              <Loader className="w-6 h-6 animate-spin text-primary-500" />
              <span className="animate-pulse">Loading dashboard records...</span>
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
              
              {/* PAGE: DASHBOARD */}
              {activeTab === 'dashboard' && stats && (
                <div className="space-y-6 text-left">
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Platform Volume</span>
                        <span className="text-2xl font-black mt-2 block text-emerald-400">₱{stats.summary?.totalRevenue?.toFixed(2)}</span>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Completed Bookings</span>
                        <span className="text-2xl font-black mt-2 block text-primary-400">{stats.summary?.totalBookings}</span>
                      </div>
                      <div className="w-12 h-12 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Verified Workers</span>
                        <span className="text-2xl font-black mt-2 block text-sky-400">{stats.summary?.totalWorkers}</span>
                      </div>
                      <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center">
                        <Hammer className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Registrations</span>
                        <span className="text-2xl font-black mt-2 block text-amber-500">{stats.summary?.pendingWorkers}</span>
                      </div>
                      <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Monthly Volume chart */}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg col-span-2">
                      <h3 className="text-sm font-bold font-display text-white mb-4">Financial Volume Analytics</h3>
                      <div className="h-64 flex items-end space-x-6 pt-6 px-4">
                        {stats.monthly?.map((m) => {
                          const maxRev = stats.monthly.reduce((max, curr) => Math.max(max, curr.revenue), 1);
                          const heightPct = Math.min(100, Math.max(12, (m.revenue / maxRev) * 100));

                          return (
                            <div key={m.month} className="flex-1 flex flex-col items-center">
                              <span className="text-[10px] font-semibold text-emerald-400 mb-2">₱{m.revenue}</span>
                              <div 
                                className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500"
                                style={{ height: `${heightPct * 1.5}px` }}
                              ></div>
                              <span className="text-[11px] font-bold text-slate-500 mt-3">{m.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Specialties Distribution Card */}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg">
                      <h3 className="text-sm font-bold font-display text-white mb-4">Specialty Distributions</h3>
                      {stats.specialties && stats.specialties.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-slate-500 text-xs">No specialty distribution data available.</div>
                      ) : (
                        <div className="space-y-4">
                          {stats.specialties?.map((spec) => {
                            const total = stats.specialties.reduce((sum, item) => sum + item.value, 0);
                            const widthPct = Math.round((spec.value / total) * 100);

                            return (
                              <div key={spec.name} className="space-y-1 text-xs">
                                <div className="flex justify-between font-semibold">
                                  <span className="text-slate-300">{spec.name}</span>
                                  <span className="text-slate-400">{spec.value} ({widthPct}%)</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                  <div className="bg-primary-500 h-full rounded-full" style={{ width: `${widthPct}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Bookings Roster */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-lg">
                    <h3 className="text-sm font-bold font-display text-white mb-4">Recent Platform Operations</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <th className="pb-3">Client</th>
                            <th className="pb-3">Worker</th>
                            <th className="pb-3">Service</th>
                            <th className="pb-3">Scheduled At</th>
                            <th className="pb-3 text-right">Invoice</th>
                            <th className="pb-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {stats.recentBookings && stats.recentBookings.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-6 text-center text-slate-500">No bookings recorded on the platform yet.</td>
                            </tr>
                          ) : (
                            stats.recentBookings?.map((b) => (
                              <tr key={b._id} className="text-slate-300">
                                <td className="py-3.5 font-semibold text-white">{b.userId?.fullName}</td>
                                <td className="py-3.5 font-semibold text-slate-400">{b.workerId?.fullName}</td>
                                <td className="py-3.5">{b.serviceType}</td>
                                <td className="py-3.5 text-slate-400">{new Date(b.scheduledAt).toLocaleString()}</td>
                                <td className="py-3.5 text-right font-bold text-white">₱{b.price}</td>
                                <td className="py-3.5 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                    b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                                    b.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                    b.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400' :
                                    b.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400' :
                                    'bg-slate-800 text-slate-400'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE: WORKER VERIFICATIONS */}
              {activeTab === 'verifications' && (
                <div className="space-y-4 text-left">
                  {pendingWorkers.length === 0 ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-slate-700 mb-3" />
                      <h4 className="text-sm font-bold text-white mb-1">Queue Completed</h4>
                      <p className="text-xs max-w-xs">There are no pending worker registration files to review.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      {pendingWorkers.map((w) => (
                        <div 
                          key={w._id} 
                          className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <img
                                src={w.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                alt={w.fullName}
                                className="w-14 h-14 rounded-full object-cover border border-slate-800 shadow-inner"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-white">{w.fullName}</h4>
                                <span className="text-xs text-primary-400 font-bold">{w.specialty} Specialist</span>
                                <p className="text-[10px] text-slate-500 mt-0.5">{w.email} &bull; {w.phoneNumber}</p>
                              </div>
                            </div>

                            <hr className="border-slate-900" />

                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Rate Proposed</span>
                                <span className="font-bold text-white">PHP {w.hourlyRate}/hr</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Experience</span>
                                <span className="font-bold text-white">{w.experienceYears} Years</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Worker Bio</span>
                              <p className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-900 italic">
                                "{w.bio || 'No details provided.'}"
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Gov ID Reference</span>
                                <span className="font-mono text-slate-300 font-semibold truncate block">{w.governmentId}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Certification</span>
                                <span className="text-slate-300 font-semibold truncate block">{w.certificate || 'None provided'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-900">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleVerifyWorker(w._id, 'REJECT')}
                              className="py-2 bg-slate-900 hover:bg-rose-950/20 text-rose-500 hover:text-rose-400 rounded-xl text-xs font-bold border border-slate-800 hover:border-rose-900/30 transition text-center cursor-pointer"
                            >
                              Decline Account
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleVerifyWorker(w._id, 'APPROVE')}
                              className="py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition text-center cursor-pointer shadow-md shadow-primary-500/10"
                            >
                              Approve Profile
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PAGE: USER REGISTRY */}
              {activeTab === 'users' && (
                <div className="space-y-4 text-left animate-fade-in">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-md">
                    <div className="relative w-72">
                      <input
                        type="text"
                        placeholder="Search accounts by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl text-xs pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 outline-none w-full focus:border-slate-700 transition"
                      />
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Accounts Registered: {allUsers.length}
                    </span>
                  </div>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <th className="p-4">Account Profile</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Contact Detail</th>
                            <th className="p-4">Coordinates / Specialty</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {allUsers
                            .filter((u) => {
                              const q = searchQuery.toLowerCase();
                              return (
                                u.fullName.toLowerCase().includes(q) ||
                                u.email.toLowerCase().includes(q)
                              );
                            })
                            .map((u) => (
                              <tr key={u._id} className="text-slate-300">
                                <td className="p-4 font-semibold text-white">
                                  <div className="flex items-center space-x-3">
                                    <img 
                                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                                      alt="avatar" 
                                      className="w-8 h-8 rounded-full object-cover border border-slate-800" 
                                    />
                                    <div>
                                      <span className="block font-bold">{u.fullName}</span>
                                      {u.status === 'BLOCKED' && (
                                        <span className="text-[9px] text-rose-500 font-bold uppercase">Blocked Account</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                    u.role === 'WORKER' ? 'bg-sky-500/10 text-sky-400' : 'bg-primary-500/10 text-primary-400'
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <p>{u.email}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">{u.phoneNumber}</p>
                                </td>
                                <td className="p-4">
                                  {u.role === 'WORKER' ? (
                                    <div>
                                      <span className="font-semibold text-white">{u.specialty}</span>
                                      <p className="text-[10px] text-slate-500">PHP {u.hourlyRate}/hr &bull; {u.experienceYears}y exp</p>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-slate-400 truncate max-w-xs">{u.address || 'No address onboarded'}</p>
                                      {u.coordinates && u.coordinates.length === 2 && (
                                        <span className="text-[9px] font-mono text-slate-600 block mt-0.5">[{u.coordinates[0]?.toFixed(4)}, {u.coordinates[1]?.toFixed(4)}]</span>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    u.status === 'BLOCKED' ? 'bg-rose-500/20 text-rose-400' :
                                    u.status === 'APPROVED' || u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                                    u.status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-rose-500/10 text-rose-500'
                                  }`}>
                                    {u.status}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center space-x-2">
                                    <button
                                      onClick={() => handleOpenUserEditor(u)}
                                      className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                                      title="Edit Profile Details"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleToggleUserBlock(u._id, u.status)}
                                      className={`p-1.5 border rounded-lg transition cursor-pointer ${
                                        u.status === 'BLOCKED' 
                                          ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400 hover:bg-emerald-900/20'
                                          : 'bg-slate-900 border-slate-800 hover:bg-rose-950/20 hover:border-rose-900/30 text-rose-400'
                                      }`}
                                      title={u.status === 'BLOCKED' ? 'Unblock Account' : 'Block Account'}
                                    >
                                      <Ban className="w-4 h-4" />
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleDeleteUser(u._id)}
                                      className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-900/30 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                                      title="Delete Account Roster"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE: BOOKINGS AUDITS */}
              {activeTab === 'bookings' && (
                <div className="space-y-4 text-left animate-fade-in">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-md">
                    <div className="relative w-72">
                      <input
                        type="text"
                        placeholder="Search bookings by service or names..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl text-xs pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 outline-none w-full focus:border-slate-700 transition"
                      />
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Total Bookings Audited: {bookingsList.length}
                    </span>
                  </div>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <th className="p-4">Booking ID / Service</th>
                            <th className="p-4">Client</th>
                            <th className="p-4">Worker Partner</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Scheduled Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Inspect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {bookingsList
                            .filter((b) => {
                              const q = searchQuery.toLowerCase();
                              return (
                                b.serviceType.toLowerCase().includes(q) ||
                                b.userId?.fullName?.toLowerCase().includes(q) ||
                                b.workerId?.fullName?.toLowerCase().includes(q)
                              );
                            })
                            .map((b) => (
                              <tr key={b._id} className="text-slate-300">
                                <td className="p-4 font-semibold text-white">
                                  <span className="block font-mono text-[10px] text-slate-500">#{b._id.slice(-6)}</span>
                                  <span className="font-bold">{b.serviceType}</span>
                                </td>
                                <td className="p-4">{b.userId?.fullName || 'Deleted Client'}</td>
                                <td className="p-4">
                                  <p>{b.workerId?.fullName || 'Deleted Worker'}</p>
                                  <span className="text-[10px] text-slate-500">{b.workerId?.specialty}</span>
                                </td>
                                <td className="p-4 font-bold text-white">₱{b.price}</td>
                                <td className="p-4 text-slate-400">{new Date(b.scheduledAt).toLocaleString()}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                                    b.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400' :
                                    b.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                    b.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400' :
                                    'bg-slate-800 text-slate-400'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => handleInspectBooking(b._id)}
                                    className="px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                                  >
                                    Inspect Logs
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE: FINANCIAL AUDITS (PAYMENTS) */}
              {activeTab === 'payments' && (
                <div className="space-y-6 text-left animate-fade-in">
                  
                  {/* Financial KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gross Volume Settled</span>
                        <span className="text-2xl font-black mt-2 block text-emerald-400">
                          ₱{paymentsList.filter(p => p.paymentStatus === 'PAID').reduce((sum, curr) => sum + curr.amount, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending / Unpaid Invoice Balance</span>
                        <span className="text-2xl font-black mt-2 block text-amber-500">
                          ₱{paymentsList.filter(p => p.paymentStatus !== 'PAID').reduce((sum, curr) => sum + curr.amount, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Settlement Completion Rate</span>
                        <span className="text-2xl font-black mt-2 block text-primary-400">
                          {paymentsList.length > 0 
                            ? Math.round((paymentsList.filter(p => p.paymentStatus === 'PAID').length / paymentsList.length) * 100) 
                            : 100}%
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-lg">
                    <h3 className="text-sm font-bold font-display text-white mb-4">Invoice & Settlement Logs</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <th className="pb-3">Reference ID</th>
                            <th className="pb-3">Client User</th>
                            <th className="pb-3">Worker Partner</th>
                            <th className="pb-3">Service Requested</th>
                            <th className="pb-3">Amount</th>
                            <th className="pb-3">Payment ID</th>
                            <th className="pb-3 text-right">Settlement status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {paymentsList.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-6 text-center text-slate-500">No payment transaction records found in the database.</td>
                            </tr>
                          ) : (
                            paymentsList.map((p, idx) => (
                              <tr key={idx} className="text-slate-300">
                                <td className="py-3 font-mono text-[10px] text-slate-500">#{p.bookingId.slice(-6)}</td>
                                <td className="py-3">
                                  <span className="block font-semibold text-white">{p.clientName}</span>
                                  <span className="text-[10px] text-slate-500">{p.clientEmail}</span>
                                </td>
                                <td className="py-3">
                                  <span className="block font-semibold text-slate-400">{p.workerName}</span>
                                  <span className="text-[10px] text-slate-500">{p.workerSpecialty}</span>
                                </td>
                                <td className="py-3">{p.serviceType}</td>
                                <td className="py-3 font-bold text-white">₱{p.amount.toFixed(2)}</td>
                                <td className="py-3 font-mono text-[10px] text-slate-400">{p.paymentId || 'N/A'}</td>
                                <td className="py-3 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    p.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' :
                                    p.paymentStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-slate-800 text-slate-400'
                                  }`}>
                                    {p.paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* PAGE: REVIEWS MODERATION */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 text-left animate-fade-in">
                  
                  {/* Reviews KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Ratings Moderated</span>
                        <span className="text-2xl font-black mt-2 block text-primary-400">{reviewsList.length}</span>
                      </div>
                      <div className="w-12 h-12 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Platform Rating Score</span>
                        <span className="text-2xl font-black mt-2 block text-amber-400">
                          {reviewsList.length > 0 
                            ? (reviewsList.reduce((sum, curr) => sum + curr.review.rating, 0) / reviewsList.length).toFixed(1)
                            : '5.0'} / 5.0
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Reviews Cards Grid */}
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-white mb-2">Platform Reviews & Moderation Log</h3>
                    
                    {reviewsList.length === 0 ? (
                      <div className="text-center text-slate-500 text-xs py-8">No user ratings or review comments left on the platform yet.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviewsList.map((rev) => (
                          <div 
                            key={rev._id} 
                            className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src={rev.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                                    alt="avatar" 
                                    className="w-8 h-8 rounded-full object-cover border border-slate-800" 
                                  />
                                  <div>
                                    <span className="block font-bold text-white text-xs leading-tight">{rev.userId?.fullName}</span>
                                    <span className="text-[9px] text-slate-500">Rated completed #{rev._id.slice(-6)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded px-1.5 py-0.5 text-[10px] font-bold">
                                  <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                                  <span>{rev.review.rating?.toFixed(1)}</span>
                                </div>
                              </div>
                              
                              <p className="text-xs text-slate-300 italic bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                                "{rev.review.comment || 'No comment text provided.'}"
                              </p>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-950 text-[10px]">
                              <div>
                                <span className="text-slate-500">Worker reviewed:</span>
                                <span className="block font-bold text-slate-300">{rev.workerId?.fullName} ({rev.workerId?.specialty})</span>
                              </div>
                              <button
                                onClick={() => handleDeleteReview(rev._id)}
                                className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-rose-950/30 hover:border-rose-900/40 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                                title="Delete & Moderate Review"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* PAGE: CONTENT CUSTOMIZER */}
              {activeTab === 'content' && (
                <div className="space-y-6 text-left animate-fade-in">
                  
                  {/* Content Sub tabs */}
                  <div className="flex border-b border-slate-800">
                    <button
                      onClick={() => { setContentSubTab('terms'); setEditingBlog(null); }}
                      className={`px-6 py-3 font-bold text-sm border-b-2 cursor-pointer transition-all ${
                        contentSubTab === 'terms' ? 'border-primary-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Terms & Conditions
                    </button>
                    <button
                      onClick={() => { setContentSubTab('privacy'); setEditingBlog(null); }}
                      className={`px-6 py-3 font-bold text-sm border-b-2 cursor-pointer transition-all ${
                        contentSubTab === 'privacy' ? 'border-primary-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Privacy Policy
                    </button>
                    <button
                      onClick={() => { setContentSubTab('blogs'); setEditingBlog(null); }}
                      className={`px-6 py-3 font-bold text-sm border-b-2 cursor-pointer transition-all ${
                        contentSubTab === 'blogs' ? 'border-primary-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Insight Blogs Editor
                    </button>
                  </div>

                  {/* Sub tab contents */}
                  {contentSubTab === 'terms' && (
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-white">Terms and Conditions Configuration</h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">Edit the terms markdown. Changes reflect on public apps instantly.</p>
                        </div>
                        <button
                          disabled={actionLoading}
                          onClick={handleSaveTerms}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-primary-500/10 cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                      <textarea
                        value={termsText}
                        onChange={(e) => setTermsText(e.target.value)}
                        className="w-full h-96 bg-slate-900 border border-slate-800 rounded-xl text-xs p-4 font-mono text-slate-300 focus:border-slate-700 outline-none leading-relaxed"
                        placeholder="# Title..."
                      />
                    </div>
                  )}

                  {contentSubTab === 'privacy' && (
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-white">Privacy Policy Configuration</h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">Edit the privacy policy markdown. Changes reflect on public apps instantly.</p>
                        </div>
                        <button
                          disabled={actionLoading}
                          onClick={handleSavePrivacy}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-primary-500/10 cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                      <textarea
                        value={privacyText}
                        onChange={(e) => setPrivacyText(e.target.value)}
                        className="w-full h-96 bg-slate-900 border border-slate-800 rounded-xl text-xs p-4 font-mono text-slate-300 focus:border-slate-700 outline-none leading-relaxed"
                        placeholder="# Title..."
                      />
                    </div>
                  )}

                  {contentSubTab === 'blogs' && (
                    <div className="space-y-4">
                      {editingBlog ? (
                        /* Create/Edit Blog Form */
                        <form onSubmit={handleSaveBlog} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg animate-fade-in">
                          <h3 className="text-sm font-bold text-white">
                            {editingBlog === 'NEW' ? 'Publish a New Insight Article' : 'Modify Article: ' + editingBlog.title}
                          </h3>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Article Title</label>
                              <input
                                type="text"
                                required
                                value={blogForm.title}
                                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs p-3 text-slate-200 outline-none focus:border-slate-700 transition"
                                placeholder="e.g. GCash Sandbox Payment Flows"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">URL Slug</label>
                              <input
                                type="text"
                                required
                                value={blogForm.slug}
                                onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs p-3 text-slate-200 outline-none focus:border-slate-700 transition font-mono"
                                placeholder="gcash-sandbox-payment-flows"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Author Name</label>
                              <input
                                type="text"
                                required
                                value={blogForm.author}
                                onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs p-3 text-slate-200 outline-none focus:border-slate-700 transition"
                                placeholder="Operations Team"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Publishing Status</label>
                              <select
                                value={blogForm.status}
                                onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs p-3 text-slate-200 outline-none focus:border-slate-700 transition"
                              >
                                <option value="PUBLISHED">PUBLISHED (Visible immediately)</option>
                                <option value="DRAFT">DRAFT (Admin only)</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Short Excerpt (Grid Card Preview)</label>
                            <input
                              type="text"
                              required
                              value={blogForm.excerpt}
                              onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs p-3 text-slate-200 outline-none focus:border-slate-700 transition"
                              placeholder="Describe the article in one sentence..."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Article Content</label>
                            <textarea
                              required
                              value={blogForm.content}
                              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                              className="w-full h-48 bg-slate-900 border border-slate-800 rounded-xl text-xs p-4 text-slate-300 focus:border-slate-700 outline-none leading-relaxed"
                              placeholder="Write your article content here..."
                            />
                          </div>

                          <div className="flex justify-end space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingBlog(null)}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Discard Changes
                            </button>
                            <button
                              type="submit"
                              disabled={actionLoading}
                              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-primary-500/10 cursor-pointer"
                            >
                              Save and Post
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* Blog Posts Listing */
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-lg animate-fade-in">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-sm font-bold text-white">Insight Articles</h3>
                              <p className="text-[10px] text-slate-500 mt-0.5">Manage the articles showing in the mobile resources and web blog.</p>
                            </div>
                            <button
                              onClick={() => handleOpenBlogForm('NEW')}
                              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-primary-500/10 cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Create Article</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {blogsList.length === 0 ? (
                              <div className="col-span-2 text-center text-slate-500 text-xs py-8">No articles in database. Click Create to get started!</div>
                            ) : (
                              blogsList.map((blog) => (
                                <div key={blog._id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between space-y-4">
                                  <div>
                                    <div className="flex justify-between items-start">
                                      <span className="text-[9px] font-mono text-slate-500 uppercase">{new Date(blog.date).toLocaleDateString()} &bull; By {blog.author}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                        blog.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                                      }`}>
                                        {blog.status}
                                      </span>
                                    </div>
                                    <h4 className="font-bold text-white mt-1 text-sm">{blog.title}</h4>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{blog.excerpt}</p>
                                  </div>
                                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-950">
                                    <button
                                      onClick={() => handleOpenBlogForm(blog)}
                                      className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                                      title="Edit Article"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBlog(blog._id)}
                                      className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-900/30 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                                      title="Delete Article"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* DETAILED BOOKING AUDITING DRAWER */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between text-left animate-slide-in">
            
            {/* Drawer Header */}
            <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
              <div>
                <h3 className="font-bold text-white text-sm">Dispute Audit Log</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Booking Record ID: {selectedBooking._id}</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Client & Worker Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block mb-2">Requesting Client</span>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={selectedBooking.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                      alt="avatar" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-800" 
                    />
                    <div>
                      <span className="block text-xs font-bold text-white leading-tight">{selectedBooking.userId?.fullName}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{selectedBooking.userId?.email}</span>
                      <span className="text-[9px] text-slate-400 block font-mono">{selectedBooking.userId?.phoneNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block mb-2">Service Partner</span>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={selectedBooking.workerId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                      alt="avatar" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-800" 
                    />
                    <div>
                      <span className="block text-xs font-bold text-white leading-tight">{selectedBooking.workerId?.fullName}</span>
                      <span className="text-[10px] text-primary-400 font-semibold block mt-0.5">{selectedBooking.workerId?.specialty}</span>
                      <span className="text-[9px] text-slate-400 block font-mono">{selectedBooking.workerId?.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details Card */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Service Particulars</h4>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Service Requested</span>
                    <span className="font-bold text-white">{selectedBooking.serviceType}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Price / Invoice</span>
                    <span className="font-bold text-emerald-400">₱{selectedBooking.price}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Current Status</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedBooking.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                      selectedBooking.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400' :
                      selectedBooking.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block mb-0.5">Problem Description</span>
                  <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-850">{selectedBooking.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Scheduled Date</span>
                    <span className="text-slate-300 font-semibold">{new Date(selectedBooking.scheduledAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Payment State</span>
                    <span className={`font-bold ${selectedBooking.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Log Transcript Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Chat Transcript</h4>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 h-80 overflow-y-auto space-y-3 flex flex-col">
                  {selectedBooking.chat && selectedBooking.chat.length === 0 ? (
                    <div className="m-auto text-center text-slate-600 text-xs">No chat communication logs found.</div>
                  ) : (
                    selectedBooking.chat?.map((msg, idx) => {
                      const isClientMsg = msg.senderId?.role === 'USER';
                      
                      return (
                        <div 
                          key={idx} 
                          className={`flex flex-col max-w-[80%] ${isClientMsg ? 'self-end items-end' : 'self-start items-start'}`}
                        >
                          <span className="text-[8px] font-bold text-slate-500 mb-0.5">
                            {msg.senderId?.fullName || 'Deleted Account'} ({msg.senderId?.role || 'N/A'})
                          </span>
                          <div 
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isClientMsg 
                                ? 'bg-primary-600 text-white rounded-tr-none' 
                                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                            }`}
                          >
                            <p className="break-all whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          <span className="text-[7px] text-slate-600 mt-0.5">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <footer className="h-20 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-6">
              <span className="text-[10px] text-slate-500">Authorized Operator Action Only</span>
              {['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(selectedBooking.status) ? (
                <button
                  disabled={actionLoading}
                  onClick={() => handleForceCancelBooking(selectedBooking._id)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-500/10 cursor-pointer"
                >
                  Force Cancel Booking
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2.5 bg-slate-900 text-slate-500 text-xs font-bold rounded-xl border border-slate-850 cursor-not-allowed"
                >
                  Booking Inactive
                </button>
              )}
            </footer>

          </div>
        </div>
      )}

      {/* USER DETAIL EDITOR DRAWER/MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col justify-between text-left animate-fade-in overflow-hidden">
            
            {/* Modal Header */}
            <header className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Update Profile Details</h3>
                <p className="text-[10px] text-slate-500">Operator Edit Console for {editingUser.fullName}</p>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Modal Scroll Content */}
            <form onSubmit={handleSaveUserProfile}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                
                {/* Core Particulars */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-primary-400 uppercase tracking-wider">Account Core</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={userForm.fullName}
                        onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Phone Number</label>
                      <input 
                        type="text" 
                        required
                        value={userForm.phoneNumber}
                        onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">User Role</label>
                      <select 
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700"
                      >
                        <option value="USER">USER (Client)</option>
                        <option value="WORKER">WORKER (Partner)</option>
                        <option value="ADMIN">ADMIN (Operator)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Verification Status</label>
                      <select 
                        value={userForm.status}
                        onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Worker Specific Attributes */}
                {userForm.role === 'WORKER' && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <h4 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">Worker Service Configs</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Specialty Category</label>
                        <input 
                          type="text" 
                          value={userForm.specialty}
                          onChange={(e) => setUserForm({ ...userForm, specialty: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700"
                          placeholder="Plumbing, Electrical..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Hourly Rate (PHP)</label>
                        <input 
                          type="number" 
                          value={userForm.hourlyRate}
                          onChange={(e) => setUserForm({ ...userForm, hourlyRate: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Experience (Years)</label>
                        <input 
                          type="number" 
                          value={userForm.experienceYears}
                          onChange={(e) => setUserForm({ ...userForm, experienceYears: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Worker Description / Biography</label>
                      <textarea 
                        value={userForm.bio}
                        onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-3 text-slate-300 outline-none focus:border-slate-700 h-20"
                        placeholder="Bio details..."
                      />
                    </div>
                  </div>
                )}

                {/* Location Coordinates & Address Info */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    Dispatch Address coordinates
                  </h4>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Street Address</label>
                    <input 
                      type="text" 
                      value={userForm.address || ''}
                      onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700"
                      placeholder="e.g. Quezon City, Manila"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Longitude coordinate</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        value={userForm.coordinates[0]}
                        onChange={(e) => setUserForm({ ...userForm, coordinates: [Number(e.target.value), userForm.coordinates[1]] })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Latitude coordinate</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        value={userForm.coordinates[1]}
                        onChange={(e) => setUserForm({ ...userForm, coordinates: [userForm.coordinates[0], Number(e.target.value)] })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs p-2.5 text-slate-200 outline-none focus:border-slate-700 font-mono"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Actions Footer */}
              <footer className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-primary-500/10 flex items-center space-x-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>Update Profile</span>
                </button>
              </footer>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortal;
