import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, MapPin, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const [footerData, setFooterData] = useState({
    config: {},
    currencies: [],
    testimonials: [],
  });

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/system/footer');
        if (response.data.success) {
          setFooterData({
            config: response.data.config || {},
            currencies: response.data.currencies || [],
            testimonials: response.data.testimonials || [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch footer data:', err);
      }
    };
    fetchFooter();
  }, []);

  const { config, currencies, testimonials } = footerData;

  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '64px 24px', marginTop: 'auto' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Top Section: Testimonials */}
        {testimonials.length > 0 && (
          <div style={{ marginBottom: '48px', borderBottom: '1px solid #334155', paddingBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
              What Our Community Says
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {testimonials.map((t) => (
                <div key={t._id} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < t.rating ? '#d97706' : 'none'} color={i < t.rating ? '#d97706' : '#64748b'} />
                    ))}
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', fontStyle: 'italic', marginBottom: '16px' }}>"{t.content}"</p>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{t.authorName}</p>
                    <p style={{ color: '#94a3b8', fontSize: '12px' }}>{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Middle Section: Links & Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '48px', marginBottom: '48px' }}>

          {/* Brand Info */}
          <div>
            <Logo />
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '16px', lineHeight: '1.6' }}>
              Your trusted platform for discovering and booking the best local service professionals, safely and instantly.
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#e2e8f0' }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '14px' }}>
                <MapPin size={18} />
                <span>{config.address || '123 Service Road, Tech District, Philippines'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '14px' }}>
                <Phone size={18} />
                <span>{config.phone || '+63 900 123 4567'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '14px' }}>
                <Mail size={18} />
                <span>{config.email || 'support@fixconnect.com'}</span>
              </div>
            </div>
          </div>

          {/* Currencies */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#e2e8f0' }}>Supported Currencies</h4>
            {currencies.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {currencies.map(c => (
                  <li key={c._id} style={{ color: '#94a3b8', fontSize: '14px' }}>
                    {c.symbol} {c.code}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>₱ PHP</p>
            )}
          </div>
        </div>

        {/* Bottom Section: Socials & Copyright */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '24px', gap: '16px' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            &copy; {new Date().getFullYear()} {config.companyName || 'FixConnect'}. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href={config.socialLinks?.facebook || '#'} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              <Facebook size={20} />
            </a>
            <a href={config.socialLinks?.twitter || '#'} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              <Twitter size={20} />
            </a>
            <a href={config.socialLinks?.instagram || '#'} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
