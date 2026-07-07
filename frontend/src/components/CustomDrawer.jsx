import React from 'react';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  User as UserIcon, 
  Tag, 
  HelpCircle, 
  Info, 
  LogOut,
  X
} from 'lucide-react';
import logo from '../../assets/logo.png';

export default function CustomDrawer({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab,
  onPromoPress,
  onHelpPress,
  onAboutPress,
  user,
  onLogout
}) {
  const menuItems = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'inbox', label: 'Inbox Messages', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose(); // Close drawer on mobile
  };

  const handleAction = (actionCallback) => {
    if (onClose) onClose();
    setTimeout(() => {
      actionCallback();
    }, 100);
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          className="modal-overlay" 
          style={{ position: 'fixed', zIndex: 9 }} 
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header Branding */}
        <div className="sidebar-header">
          <img src={logo} alt="FixConnect Logo" className="sidebar-logo" />
          <span className="sidebar-brand">FixConnect</span>
          {/* Mobile Close Button */}
          <button 
            className="mobile-menu-btn" 
            style={styles.closeBtn}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div style={styles.userCard}>
          <div style={styles.avatarPlaceholder}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={styles.userMeta}>
            <div style={styles.userName}>{user?.name || 'FixConnect User'}</div>
            <div style={styles.userRole}>{user?.role || 'Customer'}</div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="sidebar-menu">
          <div style={styles.sectionHeader}>Navigation</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
            );
          })}

          <div style={styles.divider} />

          <div style={styles.sectionHeader}>Promos & Support</div>
          <div className="menu-item" onClick={() => handleAction(onPromoPress)}>
            <Tag size={20} />
            <span>Apply Promo Code</span>
          </div>
          <div className="menu-item" onClick={() => handleAction(onHelpPress)}>
            <HelpCircle size={20} />
            <span>Help & Support</span>
          </div>
          <div className="menu-item" onClick={() => handleAction(onAboutPress)}>
            <Info size={20} />
            <span>About Platform</span>
          </div>
        </nav>

        {/* Footer Logout */}
        <div className="sidebar-footer">
          <div className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        </div>
      </aside>
    </>
  );
}

const styles = {
  closeBtn: {
    display: 'none', // Managed via CSS display media queries
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#F8FAFC',
    margin: '16px',
    borderRadius: '12px',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: '#2E7D32',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  userMeta: {
    flex: 1,
    overflow: 'hidden',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: '0.5px',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    paddingLeft: 12,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    margin: '12px 12px 16px 12px',
  },
};

// Append style overrides for mobile close button injection
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @media (max-width: 900px) {
      .sidebar .mobile-menu-btn {
        display: flex !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
