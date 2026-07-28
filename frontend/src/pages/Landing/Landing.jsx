import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Water, Flash, Snow, Hammer, Bug, 
  ChevronRight, Star, ShieldCheck, HeartPulse
} from 'lucide-react';
import logo from '../../assets/logo.png';

export default function Landing() {
  const features = [
    { icon: ShieldCheck, title: 'Verified Experts', desc: 'All local handymen and cleaning technicians are background checked and verified.' },
    { icon: Star, title: 'Top Rated', desc: 'Check reviews and ratings from your local neighborhood before booking a service.' },
    { icon: HeartPulse, title: 'Safety First', desc: 'Secure cash-free payments and on-demand tracking for complete peace of mind.' },
  ];

  return (
    <div className="bg-white min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 px-4">
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <div className="navbar-brand d-flex align-items-center gap-2 m-0">
            <img src={logo} alt="FixConnect" style={{ width: 40, height: 40 }} />
            <span className="fw-bold text-success fs-4">FixConnect</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="btn btn-outline-success px-4 fw-bold">Sign In</Link>
            <Link to="/register" className="btn btn-success px-4 fw-bold text-white">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow-1">
        <section className="container py-5 text-center px-4" style={{ marginTop: '5%' }}>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-bold mb-4 fs-6">
                ✨ Trusted Home Services on Demand
              </div>
              <h1 className="display-4 fw-extrabold text-dark mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Your Trusted Partner for <span className="text-success">Home Repairs & Cleaning</span>
              </h1>
              <p className="lead text-secondary mb-5">
                Connect instantly with top-rated local professionals for plumbing, electrical issues, general cleaning, carpentry, and AC maintenance. Fast, safe, and fully insured.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Link to="/register" className="btn btn-success btn-lg px-5 py-3 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2">
                  Book a Service Now <ChevronRight size={20} />
                </Link>
                <Link to="/login" className="btn btn-light btn-lg px-5 py-3 fw-bold border text-secondary shadow-sm">
                  Sign In to Account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-light py-5 border-top border-bottom">
          <div className="container py-4">
            <div className="row g-4 justify-content-center">
              {features.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <div key={index} className="col-md-4">
                    <div className="card h-100 p-4 border-0 shadow-sm text-center">
                      <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mx-auto mb-3">
                        <Icon size={28} />
                      </div>
                      <h5 className="fw-bold mb-2 text-dark">{feat.title}</h5>
                      <p className="text-secondary small mb-0">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="container py-5 px-4">
          <h3 className="text-center fw-bold text-dark mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>Our Service Offerings</h3>
          <div className="row row-cols-2 row-cols-md-4 g-4 justify-content-center">
            {[
              { icon: Sparkles, name: 'Home Cleaning' },
              { icon: Water, name: 'Plumbing Repair' },
              { icon: Flash, name: 'Electrical Wiring' },
              { icon: Snow, name: 'AC Maintenance' },
            ].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div key={i} className="col">
                  <div className="card p-3 border-0 bg-light text-center hover-transform h-100">
                    <div className="text-success mb-2">
                      <Icon size={32} className="mx-auto" />
                    </div>
                    <span className="fw-bold text-dark small">{cat.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 border-top text-center">
        <p className="text-secondary small mb-0">&copy; 2026 FixConnect Inc. All rights reserved. Built with premium aesthetics.</p>
      </footer>
    </div>
  );
}
