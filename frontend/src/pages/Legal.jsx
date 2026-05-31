import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

const Legal = ({ onBack, defaultTab = 'tos' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px' }}>
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#10b981',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
          }}
        >
          <ArrowLeft size={16} />
          Back to Authentication
        </button>
      )}

      <div className="glass-card" style={{ padding: '40px 32px', transform: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', color: '#10b981', marginBottom: '8px' }}>FixConnect Legal Center</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Terms of Service & Privacy Policy Guidelines
          </p>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '6px',
            borderRadius: '12px',
            marginBottom: '32px',
          }}
        >
          <button
            type="button"
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              background: activeTab === 'tos' ? '#ffffff' : 'transparent',
              color: activeTab === 'tos' ? '#10b981' : '#64748b',
              boxShadow: activeTab === 'tos' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
            }}
            onClick={() => setActiveTab('tos')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <FileText size={16} /> Terms of Service
            </span>
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              background: activeTab === 'privacy' ? '#ffffff' : 'transparent',
              color: activeTab === 'privacy' ? '#10b981' : '#64748b',
              boxShadow: activeTab === 'privacy' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
            }}
            onClick={() => setActiveTab('privacy')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Privacy Policy
            </span>
          </button>
        </div>

        {/* CONTENT */}
        <div style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'tos' ? (
            <>
              <h3 style={{ color: '#0f172a', fontSize: '18px' }}>1. Contractual Relationship</h3>
              <p>
                These Terms of Service ("Terms") govern your access or use, from within the Philippines or globally, of applications, websites, content, products, and services (the "Services") made available by FixConnect, Inc. and its parents, subsidiaries, and affiliates (collectively, "FixConnect").
              </p>

              <h3 style={{ color: '#0f172a', fontSize: '18px' }}>2. The Services Booking Platform</h3>
              <p>
                The Services constitute a technology platform that enables users of FixConnect's mobile applications or websites to arrange and schedule home-service booking jobs with independent third-party providers of such services ("Workers"). YOU ACKNOWLEDGE THAT FIXCONNECT DOES NOT PROVIDE HOME REPAIR OR MAINTENANCE SERVICES OR FUNCTION AS A GENERAL CONTRACTOR AND THAT ALL SUCH HOME SERVICES ARE PROVIDED BY INDEPENDENT CONTRACTORS WHO ARE NOT EMPLOYED BY FIXCONNECT.
              </p>

              <h3 style={{ color: '#0f172a', fontSize: '18px' }}>3. User Accounts and Verification</h3>
              <p>
                In order to use most aspects of the Services, you must register for and maintain an active personal user Services account ("Account"). You must be at least 18 years of age to obtain an Account. Account registration requires you to submit to FixConnect certain personal information, such as your name, address, mobile phone number, and age, as well as at least one valid payment method.
              </p>

              <h3 style={{ color: '#0f172a', fontSize: '18px' }}>4. Payments & Booking Billing</h3>
              <p>
                You understand that use of the Services may result in charges to you for the services or goods you receive from a Worker ("Charges"). FixConnect will facilitate your payment of the applicable Charges on behalf of the Worker as the Worker's limited payment collection agent. Payment of the Charges in such manner shall be considered the same as payment made directly by you to the Worker. Charges will be inclusive of applicable taxes where required by law.
              </p>
            </>
          ) : (
            <>
              <h3 style={{ color: '#0f172a', fontSize: '18px' }}>1. Scope of Privacy Protection</h3>
              <p>
                FixConnect is committed to protecting the privacy of our clients and independent service workers. This Privacy Policy describes how we collect, use, process, and disclose your information, including personal information, in conjunction with your access to and use of the FixConnect Booking System.
              </p>

              <h3 style={{ color: '#0f172a', fontSize: '18px' }}>2. Information We Collect</h3>
              <p>
                There are three general categories of information we collect:
              </p>
              <ul>
                <li><strong>Information You Give Us:</strong> We collect your name, email, phone number, and billing/geographic addresses when you sign up or complete onboarding. For workers, we additionally collect rate listings, biographical notes, and PDF/image qualification credentials.</li>
                <li><strong>Geospatial Details:</strong> We collect exact coordinates (longitude and latitude) via our LocationIQ API autocomplete address integration. This enables computing distances to local professionals.</li>
                <li><strong>Transaction Records:</strong> We store booking histories, transaction costs, and transaction receipt tokens provided securely by PayMongo checkout portals. We do not store raw card numbers.</li>
              </ul>

              <h3 style={{ color: '#0f172a', fontSize: '18px' }}>3. Sharing & Disclosure</h3>
              <p>
                To facilitate booking engagements, we share necessary user contact details (e.g. client home addresses and phone numbers) with the designated Worker once a request is officially approved. We never sell your personal information to third-party marketing companies.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Legal;
