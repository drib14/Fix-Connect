import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FileText, ShieldAlert, ArrowLeft } from 'lucide-react';

export const Legal = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('terms');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'privacy' || tab === 'terms') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="main-header" style={{ padding: '1rem 3rem' }}>
        <div className="logo-container">
          <svg viewBox="0 0 100 100" width="34" height="34" style={{ fill: 'none' }}>
            <circle cx="50" cy="50" r="46" fill="#f0fdf4" stroke="#10b981" strokeWidth="4" />
            <path d="M35 50 L45 60 L65 40" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Fix<span className="logo-highlight">Connect</span></span>
        </div>
        <Link to="/" className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Page Title */}
          <div>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--text-primary)', letterSpacing: '-0.8px', marginBottom: '0.4rem' }}>Legal & Guidelines</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Review the compliance terms and privacy bounds of the FixConnect SaaS platform.</p>
          </div>

          {/* Segmented Select Control */}
          <div className="role-switcher" style={{ maxWidth: '400px', margin: '0' }}>
            <div 
              className={`role-option ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <FileText size={16} /> Terms of Service
            </div>
            <div 
              className={`role-option ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <ShieldAlert size={16} /> Privacy Policy
            </div>
          </div>

          {/* Document Content Frame */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            boxShadow: 'var(--shadow-md)',
            color: 'var(--text-secondary)',
            lineHeight: '1.7',
          }}>
            {activeTab === 'terms' ? (
              <div className="animate-fade">
                <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Terms of Service Agreement</h2>
                <p style={{ marginBottom: '1.5rem' }}>Welcome to FixConnect! By accessing or using our local service booking marketplace, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.</p>
                
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem' }}>1. Accepting the Terms</h3>
                <p style={{ marginBottom: '1rem' }}>By creating an account (Customer or Provider) on FixConnect, you explicitly consent to these Terms of Service. If you do not agree to all terms, you are restricted from utilizing our services.</p>
                
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem' }}>2. Account Verification & Safety</h3>
                <p style={{ marginBottom: '1rem' }}>We enforce mandatory email verification and profile onboarding rules. Service Providers must submit accurate business specialties, rate schedules, and service radii. Fraudulent representations will result in immediate termination.</p>
                
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem' }}>3. Service Bookings & Availability</h3>
                <p style={{ marginBottom: '1rem' }}>Customers book services directly into Provider availability calendars. Contract cancellations or rescheduled bookings must conform to provider cancellation margins. All dispute negotiations are handled under Admin panel moderation.</p>
                
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem' }}>4. Payment Terms</h3>
                <p style={{ marginBottom: '1rem' }}>FixConnect acts as an escrow-matching facilitator. Payment processing is prepared via test keys. You agree not to bypass platform booking controls to avoid fee schedules.</p>
              </div>
            ) : (
              <div className="animate-fade">
                <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Privacy & Data Policy</h2>
                <p style={{ marginBottom: '1.5rem' }}>Your privacy is highly important to us. This Privacy Policy details how we collect, store, process, and secure your personal credentials and location coordinates inside the FixConnect marketplace.</p>
                
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem' }}>1. Information We Collect</h3>
                <p style={{ marginBottom: '1rem' }}>We collect personal registration details (Name, email address, password hashes), business metrics (Business name, specialty, rates, schedules), and precise location details (provided via LocationIQ API coordinates) to map correct search radii.</p>
                
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem' }}>2. How We Use Data</h3>
                <p style={{ marginBottom: '1rem' }}>Your location coordinates are utilized solely to compute search metrics (e.g. mapping nearby plumbers). Password hashes are secured with `bcryptjs` and are never stored in plain text. Auth cookies are served as secure HttpOnly.</p>
                
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem' }}>3. Data Retention & Sharing</h3>
                <p style={{ marginBottom: '1rem' }}>We do not sell your personal or geographical data. Account data is retained until an explicit profile removal request is raised. Security logging tracks potential hijacked sessions to terminate credentials instantly.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="main-footer" style={{ backgroundColor: '#ffffff' }}>
        <p>&copy; {new Date().getFullYear()} FixConnect Legal Compliance Team.</p>
      </footer>
    </div>
  );
};

export default Legal;
