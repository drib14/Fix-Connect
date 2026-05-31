import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import {
  Wrench,
  Zap,
  Sparkles,
  Tv,
  Hammer,
  Leaf,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Star,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';

const Landing = ({ onGetStarted, onLegalClick }) => {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  const services = [
    {
      name: 'Plumbing',
      desc: 'Leaky pipes, faucet repairs, water heaters, and drain cleaning.',
      icon: <Wrench size={24} />,
    },
    {
      name: 'Electrical',
      desc: 'Outlet installations, wiring repairs, light fixtures, and breaker boxes.',
      icon: <Zap size={24} />,
    },
    {
      name: 'Cleaning',
      desc: 'Deep home cleaning, office sanitizing, vacuuming, and kitchen sanitations.',
      icon: <Sparkles size={24} />,
    },
    {
      name: 'Appliance Repair',
      desc: 'Refrigerators, washing machines, microwaves, AC units, and television repairs.',
      icon: <Tv size={24} />,
    },
    {
      name: 'Carpentry',
      desc: 'Furniture assembly, cabinet repairs, door installation, and custom woodwork.',
      icon: <Hammer size={24} />,
    },
    {
      name: 'Gardening',
      desc: 'Lawn mowing, plant pruning, landscape layout, and backyard clearings.',
      icon: <Leaf size={24} />,
    },
  ];

  const statistics = [
    { label: 'Verified Experts', value: '1,200+', icon: <Briefcase size={22} /> },
    { label: 'Platform Bookings', value: '10,000+', icon: <Layers size={22} /> },
    { label: 'Client Satisfaction', value: '98%', icon: <Star size={22} /> },
    { label: 'Active Coverage', value: '50+ Cities', icon: <Users size={22} /> },
  ];

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Client & Homeowner',
      rating: 5,
      comment:
        'Finding Marco Diaz on FixConnect was incredibly easy! He accepted the request instantly, arrived with his tools, and resolved our bathroom faucet leak within 15 minutes. High-fidelity tracking is exactly like ride-hailing!',
      avatar: 'https://res.cloudinary.com/dwquuisuj/image/upload/v1700000000/avatar-f1.png',
    },
    {
      name: 'David Reynolds',
      role: 'Property Manager',
      rating: 5,
      comment:
        'We use FixConnect for all our emergency apartment maintenance. The speed of booking is outstanding. Being able to view real-time technician routes on the street map grid is incredibly reassuring.',
      avatar: 'https://res.cloudinary.com/dwquuisuj/image/upload/v1700000000/avatar-m1.png',
    },
    {
      name: 'Emily Thompson',
      role: 'Residential Client',
      rating: 5,
      comment:
        'The password standardizer and security measures gave me complete peace of mind. The cleaners who came to my home were verified professionals, exceedingly polite, and thorough. I recommend FixConnect highly!',
      avatar: 'https://res.cloudinary.com/dwquuisuj/image/upload/v1700000000/avatar-f2.png',
    },
  ];

  // Auto scroll testimonials carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNextReview = () => {
    setActiveReviewIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevReview = () => {
    setActiveReviewIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div style={{ background: 'var(--bg-gradient)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Header/Navbar */}
      <header
        className="glass-card"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderRadius: '0 0 20px 20px',
          boxShadow: 'var(--shadow-sm)',
          transform: 'none',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Logo size={40} showText={true} />

        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#sectors" style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--slate-800))' }}>
            Sectors
          </a>
          <a href="#stats" style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--slate-800))' }}>
            Statistics
          </a>
          <a href="#reviews" style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--slate-800))' }}>
            Reviews
          </a>
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            Get Started
          </button>
        </nav>
      </header>

      {/* 2. Hero Core Section */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
        }}
      >
        <div
          style={{
            background: 'hsl(var(--primary-emerald-light))',
            color: 'hsl(var(--primary-emerald-hover))',
            padding: '6px 16px',
            borderRadius: '99px',
            fontSize: '13px',
            fontWeight: '700',
            border: '1px solid hsl(var(--primary-emerald) / 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} />
          <span>100% Admin Verified Home Services</span>
        </div>

        <h1
          style={{
            fontSize: '52px',
            lineHeight: '1.15',
            letterSpacing: '-1.5px',
            maxWidth: '820px',
            fontFamily: 'Outfit',
            background: 'linear-gradient(135deg, hsl(var(--slate-900)) 30%, hsl(var(--primary-emerald)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Connecting Homes with Handpicked Professionals
        </h1>

        <p style={{ color: 'hsl(var(--slate-600))', fontSize: '18px', maxWidth: '580px', lineHeight: '1.6' }}>
          Discover verified plumbers, electricians, cleaners, and carpenters in your city. Book instantly with secure PayMongo payments and live geolocation routing maps.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{ padding: '14px 32px', fontSize: '15px' }}
          >
            Book a Professional
            <ArrowRight size={16} />
          </button>
          <a href="#sectors" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '15px' }}>
            Explore Services
          </a>
        </div>
      </section>

      {/* 3. Sectors / Services Showcase Grid */}
      <section id="sectors" style={{ background: '#ffffff', padding: '80px 24px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '32px', fontFamily: 'Outfit' }}>Explore Home Services</h2>
            <p style={{ color: 'hsl(var(--slate-600))', fontSize: '15px', marginTop: '8px' }}>
              Select a specialized sector to see qualified, verified experts in your neighborhood
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {services.map((svc, i) => (
              <div
                key={i}
                className="glass-card"
                onClick={onGetStarted}
                style={{
                  padding: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: '#f8fafc',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'hsl(var(--primary-emerald-light))',
                    color: 'hsl(var(--primary-emerald))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {svc.icon}
                </div>
                <h3 style={{ fontSize: '20px', fontFamily: 'Outfit' }}>{svc.name}</h3>
                <p style={{ color: 'hsl(var(--slate-600))', fontSize: '14px', lineHeight: '1.6' }}>
                  {svc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Live Statistics Deck */}
      <section
        id="stats"
        style={{
          background: 'radial-gradient(circle at center, #ffffff 40%, hsl(var(--primary-emerald-light)) 100%)',
          padding: '80px 24px',
          borderTop: '1px solid #f1f5f9',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '32px', fontFamily: 'Outfit' }}>Platform Operational Scale</h2>
            <p style={{ color: 'hsl(var(--slate-600))', fontSize: '15px', marginTop: '8px' }}>
              We facilitate connection dispatches securely every day
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
            }}
          >
            {statistics.map((stat, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  background: '#ffffff',
                  transform: 'none',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'hsl(var(--primary-emerald-light))',
                    color: 'hsl(var(--primary-emerald))',
                    padding: '12px',
                    borderRadius: '50%',
                    marginBottom: '16px',
                  }}
                >
                  {stat.icon}
                </div>
                <h3 style={{ fontSize: '36px', color: 'hsl(var(--primary-emerald))', fontFamily: 'Outfit', fontWeight: '800' }}>
                  {stat.value}
                </h3>
                <span style={{ color: 'hsl(var(--slate-600))', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Reviews Slideshow Carousel */}
      <section id="reviews" style={{ background: '#ffffff', padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontFamily: 'Outfit' }}>Client Testimonials</h2>
            <p style={{ color: 'hsl(var(--slate-600))', fontSize: '15px', marginTop: '8px' }}>
              Read verified reviews from other homeowners and clients
            </p>
          </div>

          {/* Testimonials Carousel Wrapper */}
          <div
            className="glass-card"
            style={{
              padding: '40px',
              background: '#f8fafc',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              transform: 'none',
            }}
          >
            {/* Stars */}
            <div style={{ display: 'flex', gap: '4px', color: '#d97706' }}>
              {[...Array(testimonials[activeReviewIndex].rating)].map((_, i) => (
                <Star key={i} size={18} fill="#d97706" />
              ))}
            </div>

            {/* Comment */}
            <p style={{ fontSize: '16px', color: 'hsl(var(--slate-900))', fontStyle: 'italic', lineHeight: '1.7' }}>
              "{testimonials[activeReviewIndex].comment}"
            </p>

            {/* Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
              <img
                src={testimonials[activeReviewIndex].avatar}
                alt="Client Avatar"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #10b981',
                }}
              />
              <div>
                <strong style={{ fontSize: '15px', color: 'hsl(var(--slate-800))' }}>
                  {testimonials[activeReviewIndex].name}
                </strong>
                <span style={{ fontSize: '12px', color: 'hsl(var(--slate-600))', display: 'block' }}>
                  {testimonials[activeReviewIndex].role}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <button
                onClick={handlePrevReview}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#10b981')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNextReview}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#10b981')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer
        className="glass-card"
        style={{
          marginTop: 'auto',
          borderRadius: '20px 20px 0 0',
          padding: '40px 24px',
          background: '#0f172a',
          color: '#cbd5e1',
          transform: 'none',
          border: 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* White inverted text logo for dark footer */}
            <Logo size={36} showText={false} />
            <span style={{ fontFamily: 'Outfit', fontWeight: '800', fontSize: '18px', color: '#ffffff' }}>
              FixConnect
            </span>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => onLegalClick('tos')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Terms of Service
            </button>
            <button
              onClick={() => onLegalClick('privacy')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Privacy Policy
            </button>
          </div>

          <p style={{ color: '#64748b', fontSize: '12px' }}>
            &copy; {new Date().getFullYear()} FixConnect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
