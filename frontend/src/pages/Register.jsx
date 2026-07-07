import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';
import api from '../utils/api';

export default function Register({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Countries dropdown states
  const [countries, setCountries] = useState([
    { name: 'Philippines', code: 'PH', flag: '🇵🇭', prefix: '+63', currency: 'PHP', symbol: '₱' }
  ]);
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Philippines',
    code: 'PH',
    flag: '🇵🇭',
    prefix: '+63',
    currency: 'PHP',
    symbol: '₱'
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,currencies,flag');
        const data = await response.json();
        
        const parsed = data
          .map((c) => {
            const root = c.idd?.root || '';
            const suffix = c.idd?.suffixes?.[0] || '';
            const prefix = root + suffix;
            
            const currencyCode = c.currencies ? Object.keys(c.currencies)[0] : 'PHP';
            const currencySymbol = c.currencies?.[currencyCode]?.symbol || '₱';

            return {
              name: c.name?.common || '',
              code: c.cca2 || '',
              flag: c.flag || '',
              prefix: prefix || '',
              currency: currencyCode,
              symbol: currencySymbol,
            };
          })
          .filter((c) => c.name && c.prefix)
          .sort((a, b) => a.name.localeCompare(b.name));

        if (parsed.length > 0) {
          setCountries(parsed);
          const ph = parsed.find(c => c.code === 'PH');
          if (ph) {
            setSelectedCountry(ph);
          } else {
            setSelectedCountry(parsed[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load REST Countries, using default Philippines.', err.message);
      }
    };
    fetchCountries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const fullPhoneNumber = `${selectedCountry.prefix}${phone.trim()}`;
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        phone: fullPhoneNumber,
        country: selectedCountry.name,
        currency: selectedCountry.currency,
        currency_symbol: selectedCountry.symbol,
        password,
      });

      setIsLoading(false);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img src={logo} alt="FixConnect Logo" style={styles.logo} />
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join FixConnect for home services at your doorstep</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-container">
              <span className="input-icon"><User size={18} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Juan Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-container">
              <span className="input-icon"><Mail size={18} /></span>
              <input
                type="email"
                className="form-control"
                placeholder="yourname@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-container" style={{ display: 'flex', gap: '8px', padding: '0 12px 0 16px' }}>
              <span className="input-icon" style={{ marginRight: 4 }}><Phone size={18} /></span>
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = countries.find(c => c.code === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                style={styles.countrySelect}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.prefix}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                className="form-control"
                placeholder="9171234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                required
              />
            </div>
          </div>

          {/* Realigned Password Fields Side-by-Side */}
          <div style={styles.passwordRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Password</label>
              <div className="input-container">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Min. 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Confirm Password</label>
              <div className="input-container">
                <span className="input-icon"><Shield size={16} /></span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="loader-spin" size={18} />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Already have an account? </span>
          <span
            style={styles.navigateLink}
            onClick={() => onNavigate('login')}
          >
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#F4F6F8',
    padding: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    width: '100%',
    maxWidth: '480px',
    padding: '36px',
    border: '1px solid #E2E8F0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logo: {
    width: '75px',
    height: '75px',
    borderRadius: '38px',
    marginBottom: '16px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: '26px',
    color: '#1E293B',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    marginTop: '6px',
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    border: '1.5px solid #FEB2B2',
    color: '#C53030',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    border: '1.5px solid #BBF7D0',
    color: '#16A34A',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'center',
  },
  passwordRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  submitBtn: {
    width: '100%',
    height: '48px',
    marginTop: '12px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
  },
  footerText: {
    color: '#64748B',
  },
  navigateLink: {
    color: '#2E7D32',
    fontWeight: '700',
    cursor: 'pointer',
    marginLeft: '4px',
  },
  countrySelect: {
    border: 'none',
    background: 'none',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1E293B',
    outline: 'none',
    cursor: 'pointer',
    marginRight: '4px',
  },
};
