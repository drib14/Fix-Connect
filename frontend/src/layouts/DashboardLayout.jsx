import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../store/authSlice';
import { 
  Home, Calendar, MessageSquare, User as UserIcon, Tag, 
  HelpCircle, Info, LogOut, X, Menu, Bell
} from 'lucide-react';
import CustomModal from '../components/CustomModal';
import api from '../utils/api';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [loadingPromo, setLoadingPromo] = useState(false);
  
  // Support ticket
  const [supportCategory, setSupportCategory] = useState('General');
  const [supportMessage, setSupportMessage] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);

  const handleLogout = () => {
    dispatch(logOut());
    toast.success('Signed out successfully.');
    navigate('/login');
  };

  const handleValidatePromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    try {
      setLoadingPromo(true);
      const response = await api.post('/promos/validate', { code: promoCode });
      toast.success(`Promo code applied! ${user?.currency_symbol || '₱'}${response.data.promo.discount_amount} Discount!`);
      setPromoCode('');
      setIsPromoModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid promo code.');
    } finally {
      setLoadingPromo(false);
    }
  };

  const handleSubmitSupport = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    try {
      setSubmittingSupport(true);
      await api.post('/support/tickets', {
        category: supportCategory,
        message: supportMessage.trim(),
      });
      toast.success('Help request submitted! A support agent will contact you soon.');
      setSupportMessage('');
      setIsHelpModalOpen(false);
    } catch (err) {
      toast.error('Failed to submit help ticket.');
    } finally {
      setSubmittingSupport(false);
    }
  };

  const menuItems = [
    { path: '/home', label: 'Home Dashboard', icon: Home },
    { path: '/bookings', label: 'My Bookings', icon: Calendar },
    { path: '/messages', label: 'Inbox Messages', icon: MessageSquare },
    { path: '/profile', label: 'My Profile', icon: UserIcon },
  ];

  return (
    <div className="app-container">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="modal-overlay" 
          style={{ position: 'fixed', zIndex: 99, background: 'rgba(0, 0, 0, 0.4)' }} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ zIndex: 100 }}>
        <div className="sidebar-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <img src={logo} alt="FixConnect Logo" className="sidebar-logo" />
            <span className="sidebar-brand">FixConnect</span>
          </div>
          <button 
            className="btn d-md-none border-0 p-1"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-3 my-3 p-3 rounded d-flex align-items-center gap-3" style={{ backgroundColor: '#F8FAFC' }}>
          <div 
            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: 42, height: 42, backgroundColor: '#2E7D32', fontSize: 18 }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h6 className="mb-0 fw-bold text-dark text-truncate">{user?.name || 'FixConnect User'}</h6>
            <small className="text-secondary text-uppercase fw-semibold" style={{ fontSize: 10, letterSpacing: 0.5 }}>
              {user?.role || 'Customer'}
            </small>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-menu px-2 flex-grow-1">
          <div className="text-secondary text-uppercase fw-bold mb-2 px-3" style={{ fontSize: 10, letterSpacing: 1 }}>
            Navigation
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `menu-item d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none ${isActive ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="my-3 border-bottom mx-3" />

          <div className="text-secondary text-uppercase fw-bold mb-2 px-3" style={{ fontSize: 10, letterSpacing: 1 }}>
            Promos & Support
          </div>
          <button 
            className="btn menu-item border-0 w-100 text-start d-flex align-items-center gap-3 px-3 py-2 rounded"
            onClick={() => { setIsPromoModalOpen(true); setIsSidebarOpen(false); }}
          >
            <Tag size={20} />
            <span>Apply Promo Code</span>
          </button>
          <button 
            className="btn menu-item border-0 w-100 text-start d-flex align-items-center gap-3 px-3 py-2 rounded"
            onClick={() => { setIsHelpModalOpen(true); setIsSidebarOpen(false); }}
          >
            <HelpCircle size={20} />
            <span>Help & Support</span>
          </button>
          <button 
            className="btn menu-item border-0 w-100 text-start d-flex align-items-center gap-3 px-3 py-2 rounded"
            onClick={() => { setIsAboutModalOpen(true); setIsSidebarOpen(false); }}
          >
            <Info size={20} />
            <span>About Platform</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer p-3 border-top">
          <button 
            className="btn logout-btn w-100 border-0 d-flex align-items-center gap-3 px-3 py-2 rounded text-danger"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="main-content d-flex flex-column h-100 w-100 overflow-hidden">
        {/* Header Bar */}
        <header 
          className="d-flex align-items-center justify-content-between px-3 px-md-4 py-2 border-bottom"
          style={{ height: 64, minHeight: 64, backgroundColor: '#ffffff' }}
        >
          <div className="d-flex align-items-center gap-2">
            <button 
              className="btn border-0 p-1 d-md-none"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h5 className="mb-0 fw-bold d-none d-md-block text-dark">Welcome back, {user?.name || 'User'}!</h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link to="/notifications" className="btn border-0 p-2 position-relative rounded-circle hover-bg-light">
              <Bell size={20} className="text-secondary" />
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New notifications</span>
              </span>
            </Link>
          </div>
        </header>

        {/* Routed Subpage Content */}
        <div className="flex-grow-1 overflow-auto position-relative bg-light p-3 p-md-4">
          <Outlet />
        </div>
      </div>

      {/* PROMO MODAL */}
      <CustomModal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} title="Apply Promo Code">
        <form onSubmit={handleValidatePromo} className="py-2">
          <p className="text-muted small mb-3">Enter a valid promotion code to receive immediate discounts on your service bookings.</p>
          <div className="mb-3">
            <input
              type="text"
              placeholder="e.g. FIXWELCOME100"
              className="form-control"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100 py-2 fw-bold" disabled={loadingPromo}>
            {loadingPromo ? 'Verifying...' : 'Validate & Apply'}
          </button>
        </form>
      </CustomModal>

      {/* HELP MODAL */}
      <CustomModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="Help & Support Desk">
        <form onSubmit={handleSubmitSupport} className="py-2">
          <div className="mb-3">
            <label className="form-label small fw-semibold">Choose Category</label>
            <select 
              className="form-select"
              value={supportCategory}
              onChange={(e) => setSupportCategory(e.target.value)}
            >
              <option value="General">General Inquiry</option>
              <option value="Booking">Booking Issues</option>
              <option value="Payment">Payment & Billing</option>
              <option value="Feedback">Feedback & Suggestions</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Describe your problem</label>
            <textarea
              rows={4}
              placeholder="Tell us what you need help with..."
              className="form-control"
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100 py-2 fw-bold" disabled={submittingSupport}>
            {submittingSupport ? 'Submitting...' : 'Submit Help Request'}
          </button>
        </form>
      </CustomModal>

      {/* ABOUT MODAL */}
      <CustomModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} title="About FixConnect">
        <div className="py-2 text-center">
          <img src={logo} alt="Logo" className="mb-3" style={{ width: 64, height: 64 }} />
          <h5 className="fw-bold mb-1">FixConnect Platform</h5>
          <p className="text-secondary small mb-3">Version 1.0.0 (Build 2026)</p>
          <div className="p-3 bg-light rounded text-start small mb-3">
            FixConnect matches homeowners with local, certified independent technicians for plumbing, home cleaning, electrical, and appliance repair services.
          </div>
          <p className="text-muted small mb-0">&copy; 2026 FixConnect Inc. All rights reserved.</p>
        </div>
      </CustomModal>
    </div>
  );
}
