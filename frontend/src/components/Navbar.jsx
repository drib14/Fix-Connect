import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Wrench, Home, Calendar, MessageCircle, Bell, User, LogOut,
  ChevronDown, Menu, X, Repeat, Star, BarChart2, Briefcase,
  PlusCircle, CheckSquare
} from 'lucide-react';
import { logoutUser } from '../store/authSlice.js';
import { markAllNotificationsRead } from '../store/notificationSlice.js';
import NotificationDropdown from './NotificationDropdown.jsx';
import CurrencySelector from './CurrencySelector.jsx';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken } = useSelector(state => state.auth);
  const { unreadCount } = useSelector(state => state.notifications);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const customerLinks = [
    { to: '/', label: 'Home', icon: <Home size={17} /> },
    { to: '/book', label: 'Book a Service', icon: <PlusCircle size={17} /> },
    { to: '/dashboard', label: 'My Bookings', icon: <Calendar size={17} /> },
    { to: '/chat', label: 'Messages', icon: <MessageCircle size={17} /> },
  ];

  const providerLinks = [
    { to: '/', label: 'Home', icon: <Home size={17} /> },
    { to: '/dashboard', label: 'Dashboard', icon: <BarChart2 size={17} /> },
    { to: '/dashboard?tab=requests', label: 'Requests', icon: <CheckSquare size={17} /> },
    { to: '/chat', label: 'Messages', icon: <MessageCircle size={17} /> },
  ];

  const navLinks = user?.role === 'provider' ? providerLinks : customerLinks;

  const handleLogout = async () => {
    setProfileOpen(false);
    await dispatch(logoutUser());
    navigate('/');
  };

  const handleSwitchAccount = () => {
    setProfileOpen(false);
    navigate('/login?switch=true');
  };

  const avatarUrl = user?.avatar
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=10b981&color=fff&size=80`;

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* ── Logo ── */}
      <Link to="/" className="navbar-logo" aria-label="FixConnect home">
        <div className="navbar-logo-icon">
          <Wrench size={18} strokeWidth={2.5} />
        </div>
        <span>Fix<span style={{ color: 'var(--primary)' }}>Connect</span></span>
      </Link>

      {/* ── Desktop Nav Links ── */}
      <div className="navbar-links" role="menubar">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`navbar-link ${isActive(link.to) && link.to !== '/' ? 'active' : location.pathname === '/' && link.to === '/' ? 'active' : ''}`}
            role="menuitem"
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Right Controls ── */}
      <div className="navbar-right">
        {/* Currency Selector */}
        <CurrencySelector compact />

        {/* Notification Bell */}
        <div className="navbar-icon-btn" ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="nav-icon-button"
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
            aria-label="Notifications"
            id="notif-btn"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
          {notifOpen && (
            <NotificationDropdown onClose={() => setNotifOpen(false)} />
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="navbar-profile" ref={profileRef}>
          <button
            className="navbar-avatar-btn"
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            id="profile-btn"
          >
            <img src={avatarUrl} alt={user?.name} className="navbar-avatar" />
            <span className="navbar-name">{user?.name?.split(' ')[0]}</span>
            <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {profileOpen && (
            <div className="navbar-dropdown" role="menu" aria-labelledby="profile-btn">
              {/* Profile Header */}
              <div className="dropdown-header">
                <img src={avatarUrl} alt={user?.name} className="dropdown-avatar" />
                <div>
                  <div className="dropdown-name">{user?.name}</div>
                  <div className="dropdown-role">{user?.role === 'provider' ? '🔧 Service Provider' : '👤 Customer'}</div>
                </div>
              </div>
              <div className="dropdown-divider" />

              <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => setProfileOpen(false)}>
                <User size={15} /> My Profile
              </Link>

              {user?.role === 'customer' && (
                <Link to="/dashboard" className="dropdown-item" role="menuitem" onClick={() => setProfileOpen(false)}>
                  <Briefcase size={15} /> My Bookings
                </Link>
              )}

              {user?.role === 'provider' && (
                <Link to="/dashboard" className="dropdown-item" role="menuitem" onClick={() => setProfileOpen(false)}>
                  <Star size={15} /> Provider Dashboard
                </Link>
              )}

              <button className="dropdown-item" role="menuitem" onClick={handleSwitchAccount}>
                <Repeat size={15} /> Switch Account
              </button>

              <div className="dropdown-divider" />

              <button className="dropdown-item danger" role="menuitem" onClick={handleLogout}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-mobile-link ${isActive(link.to) ? 'active' : ''}`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <div className="navbar-mobile-divider" />
          <Link to="/profile" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
            <User size={17} /> Profile
          </Link>
          <button className="navbar-mobile-link" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
