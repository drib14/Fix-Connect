import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Shield, Clock, MapPin, Search, PlusCircle, ArrowRight, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { setCurrency } from '../store/currencySlice.js';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

export const Landing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [serviceInput, setServiceInput] = useState('');

  const { selected: selectedCurrency, rates, symbol, currencies } = useSelector(state => state.currency);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/platform/config');
        const data = await res.json();
        if (data?.data?.config) {
          setConfig(data.data.config);
        } else {
          // Fallback static config in case DB is empty
          setConfig({
            heroTitle: 'On-Demand Service Experts',
            heroSubtitle: 'Connecting you instantly with top local professionals.',
            aboutDescription: 'FixConnect is your premium ride-hailing style platform for local home care services. We match you instantly with verified workers.',
            faqs: [
              { question: "How does the instant booking work?", answer: "Just type your request, and we'll instantly broadcast it to available workers in your radius." },
              { question: "Are your workers verified?", answer: "Yes, all our professionals undergo strict identity and background checks before they can accept jobs." },
              { question: "How is pricing calculated?", answer: "Pricing is transparent. You'll pay a base rate plus an active service fee, calculated securely through our platform." }
            ],
            footer: {
              platformName: 'FixConnect',
              description: 'Bridging the gap between reliable local services and modern technology.',
              copyright: '© 2024 FixConnect. All rights reserved.'
            },
            socialLinks: { facebook: 'https://facebook.com', twitter: 'https://twitter.com', instagram: 'https://instagram.com' }
          });
        }
      } catch (err) {
        console.error('Error fetching platform config:', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch('/api/platform/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus('Success!');
        setEmail('');
      } else {
        setNewsletterStatus(data.message || 'Error subscribing');
      }
    } catch (err) {
      setNewsletterStatus('Error subscribing');
    }
  };

  const handleInstantSearch = (e) => {
    e.preventDefault();
    if (serviceInput.trim()) {
      navigate(`/book?query=${encodeURIComponent(serviceInput)}`);
    }
  };

  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar overlay */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.5rem 3rem',
      }}>
        <div className="logo-container">
          <img src="/FC-logo.png" alt="FixConnect" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Fix<span className="logo-highlight">Connect</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <select
            value={selectedCurrency}
            onChange={(e) => dispatch(setCurrency(e.target.value))}
            style={{
              background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', outline: 'none'
            }}
          >
            {currencies?.map(c => (
              <option key={c.code} value={c.code} style={{ color: 'black' }}>{c.flag} {c.code}</option>
            ))}
          </select>
          <Link to="/login" style={{ color: 'white', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
          <Link to="/register" className="btn btn-primary">Sign up</Link>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <section style={{
        position: 'relative',
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 2rem 4rem',
        overflow: 'hidden',
      }}>
        {/* Dynamic Abstract Background Elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '300px', height: '300px', background: '#3b82f6', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%' }}></div>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px', width: '100%' }}>
          {loadingConfig ? (
            <div style={{ width: '60%', margin: '0 auto', textAlign: 'center' }}>
               <SkeletonLoader type="text" count={2} style={{ height: '40px', marginBottom: '1rem', background: 'rgba(255,255,255,0.1)' }} />
               <SkeletonLoader type="text" count={1} style={{ height: '20px', width: '80%', margin: '0 auto 3rem', background: 'rgba(255,255,255,0.1)' }} />
            </div>
          ) : (
            <>
              <span style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.5rem', letterSpacing: '1px' }}>
                INSTANT SERVICE MARKETPLACE
              </span>
              <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'white', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                {config?.heroTitle}
              </h1>
              <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                {config?.heroSubtitle}
              </p>
            </>
          )}

          {/* Instant Search Bar */}
          <form onSubmit={handleInstantSearch} style={{
            display: 'flex',
            background: 'white',
            borderRadius: '50px',
            padding: '0.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem', flex: 1 }}>
              <Search size={24} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="What service do you need right now? (e.g., Fix my sink)"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                style={{
                  border: 'none', outline: 'none', padding: '1rem', width: '100%',
                  fontSize: '1.1rem', color: 'var(--text-primary)'
                }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '40px', padding: '0 2rem', fontSize: '1.1rem' }}>
              Find Worker
            </button>
          </form>
        </div>
      </section>

      {/* Platform Description & Architecture */}
      <section style={{ padding: '5rem 2rem', backgroundColor: 'var(--background)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}><Clock color="var(--primary)" /> Instant Dispatch</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}><MapPin color="var(--primary)" /> Live Map Tracking</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}><Shield color="var(--primary)" /> Verified Professionals</div>
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>About Our Protocol</h2>
          {loadingConfig ? (
            <SkeletonLoader type="text" count={3} style={{ width: '80%', margin: '0 auto 0.5rem' }} />
          ) : (
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
              {config?.aboutDescription}
            </p>
          )}
        </div>
      </section>

      {/* FAQs */}
      <section style={{ padding: '5rem 2rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '3rem', textAlign: 'center', color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>

          {loadingConfig ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SkeletonLoader type="card" count={3} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {config?.faqs?.map((faq, index) => (
                <div key={index} style={{
                  border: '1px solid var(--surface-border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'var(--background)'
                }}>
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    style={{
                      width: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'left'
                    }}
                  >
                    {faq.question}
                    {openFaqIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {openFaqIndex === index && (
                    <div style={{ padding: '0 1.5rem 1.5rem', fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ padding: '4rem 2rem', backgroundColor: 'var(--primary-soft)', borderTop: '1px solid var(--primary)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Stay Updated
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Subscribe to our newsletter for the latest service features and local expansion news.
          </p>
          <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid var(--surface-border)', fontSize: '1rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }}>Subscribe</button>
          </form>
          {newsletterStatus && (
            <p style={{ marginTop: '1rem', color: newsletterStatus === 'Success!' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 'bold' }}>
              {newsletterStatus}
            </p>
          )}
        </div>
      </section>

      {/* Dynamic Footer */}
      <footer style={{ padding: '4rem 2rem 2rem', backgroundColor: '#0f172a', color: '#cbd5e1', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
            
            <div>
              {loadingConfig ? (
                <SkeletonLoader type="text" count={2} style={{ background: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <>
                  <div className="logo-container" style={{ marginBottom: '1rem' }}>
                    <img src="/FC-logo.png" alt="FixConnect" style={{ width: 28, height: 28 }} />
                    <span style={{ color: 'white' }}>{config?.footer?.platformName || 'FixConnect'}</span>
                  </div>
                  <p style={{ lineHeight: '1.6', fontSize: '0.95rem', color: '#94a3b8' }}>
                    {config?.footer?.description}
                  </p>
                </>
              )}
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <Link to="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Login</Link>
                <Link to="/register" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Become a Provider</Link>
                <Link to="/legal?tab=terms" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Terms of Service</Link>
                <Link to="/legal?tab=privacy" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Privacy Policy</Link>
              </div>
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Connect With Us</h4>
              {loadingConfig ? (
                 <SkeletonLoader type="text" count={1} style={{ background: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <a href={config?.socialLinks?.facebook} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Facebook</a>
                  <a href={config?.socialLinks?.twitter} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Twitter</a>
                  <a href={config?.socialLinks?.instagram} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Instagram</a>
                </div>
              )}
            </div>

          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
             {loadingConfig ? (
                 <SkeletonLoader type="text" count={1} style={{ width: '200px', margin: '0 auto', background: 'rgba(255,255,255,0.1)' }} />
             ) : (
                 config?.footer?.copyright || '© 2024 FixConnect. All rights reserved.'
             )}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
