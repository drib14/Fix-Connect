import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Shield, Bell, HelpCircle, FileText, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handlePasswordReset = (e) => {
    e.preventDefault();
    toast.success('Password update instructions sent to your email.');
  };

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <h4 className="fw-bold mb-4 text-dark">Account Settings</h4>

      <div className="d-flex flex-column gap-4">
        {/* Notifications Config Card */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <Bell size={20} className="text-success" /> Notification Settings
          </h5>
          <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
            <div>
              <h6 className="mb-0 fw-semibold">Push Notifications</h6>
              <p className="text-secondary small mb-0">Receive real-time alerts on technician updates and messages.</p>
            </div>
            <button 
              className="btn border-0 bg-transparent"
              onClick={() => {
                setPushEnabled(!pushEnabled);
                toast.success(`Push notifications ${!pushEnabled ? 'enabled' : 'disabled'}`);
              }}
            >
              {pushEnabled ? <ToggleRight size={38} className="text-success" /> : <ToggleLeft size={38} className="text-secondary" />}
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-between py-2 mt-2">
            <div>
              <h6 className="mb-0 fw-semibold">Email Alerts</h6>
              <p className="text-secondary small mb-0">Receive transaction receipts and order confirmations via email.</p>
            </div>
            <button 
              className="btn border-0 bg-transparent"
              onClick={() => {
                setEmailEnabled(!emailEnabled);
                toast.success(`Email alerts ${!emailEnabled ? 'enabled' : 'disabled'}`);
              }}
            >
              {emailEnabled ? <ToggleRight size={38} className="text-success" /> : <ToggleLeft size={38} className="text-secondary" />}
            </button>
          </div>
        </div>

        {/* Security / Password Reset */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <Shield size={20} className="text-success" /> Security & Privacy
          </h5>
          <div className="py-2">
            <h6 className="fw-semibold mb-1">Reset Account Password</h6>
            <p className="text-secondary small mb-3">Keep your account secure by rotating your password regularly.</p>
            <button 
              onClick={handlePasswordReset}
              className="btn btn-outline-success fw-bold d-flex align-items-center gap-2"
            >
              <Lock size={16} /> Request Password Reset Link
            </button>
          </div>
        </div>

        {/* Platform Policy Links */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <FileText size={20} className="text-success" /> Legal & Terms
          </h5>
          <ul className="list-group list-group-flush small">
            <li className="list-group-item bg-transparent px-0 py-2.5 d-flex align-items-center justify-content-between">
              <span>Terms of Service</span>
              <span className="text-secondary cursor-pointer hover-text-success small">Read</span>
            </li>
            <li className="list-group-item bg-transparent px-0 py-2.5 d-flex align-items-center justify-content-between">
              <span>Privacy Policy</span>
              <span className="text-secondary cursor-pointer hover-text-success small">Read</span>
            </li>
            <li className="list-group-item bg-transparent px-0 py-2.5 d-flex align-items-center justify-content-between border-0">
              <span>Third-party licenses</span>
              <span className="text-secondary cursor-pointer hover-text-success small">View</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
