import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Shield, ChevronRight, X } from 'lucide-react';

const SAVED_KEY = 'fc_saved_accounts';

const getSavedAccounts = () => {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; }
};

const saveAccount = (user) => {
  try {
    const existing = getSavedAccounts();
    const filtered = existing.filter(a => a.email !== user.email);
    const updated = [{ name: user.name, email: user.email, role: user.role, avatar: user.avatar }, ...filtered].slice(0, 5);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    return true;
  } catch { return false; }
};

const AccountSwitchBanner = ({ onDismiss }) => {
  const { user } = useSelector(state => state.auth);
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const accounts = getSavedAccounts();
    const alreadySaved = accounts.some(a => a.email === user.email);
    if (!alreadySaved) {
      // Show banner 800ms after login
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!visible || !user) return null;

  const handleSave = () => {
    saveAccount(user);
    setSaved(true);
    setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 1500);
  };

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className={`account-banner ${visible ? 'visible' : ''}`} role="alert" id="account-switch-banner">
      <div className="account-banner-inner">
        <div className="account-banner-icon">
          <Shield size={18} />
        </div>
        <div className="account-banner-text">
          {saved ? (
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>✓ Account saved! You can switch quickly next time.</span>
          ) : (
            <>
              <strong>Save account for quick access?</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.4rem' }}>
                Sign in next time without re-entering your password.
              </span>
            </>
          )}
        </div>
        {!saved && (
          <div className="account-banner-actions">
            <button className="banner-btn-save" onClick={handleSave}>
              Save <ChevronRight size={14} />
            </button>
            <button className="banner-btn-dismiss" onClick={handleDismiss} aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { getSavedAccounts, saveAccount };
export default AccountSwitchBanner;
