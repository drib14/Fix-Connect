import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import ThreeBackground from '../components/ThreeBackground';
import { ArrowRight, Wrench, Shield, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Landing() {
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-y-auto overflow-x-hidden dark bg-background">
      <div className="absolute inset-0 pointer-events-none z-0 fixed">
         <ThreeBackground />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 w-full max-w-6xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden p-1">
            <img src="/FC-logo.png" alt="FixConnect Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white hidden sm:block">FixConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-white hover:text-emerald-400 transition-colors z-30 relative px-4 py-2">
            Sign In
          </Link>
          <Button asChild className="font-semibold shadow-lg shadow-primary/25 z-30 relative">
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto p-6 flex flex-col items-center justify-center text-center pb-20" ref={contentRef}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
          <Wrench size={16} />
          <span className="text-sm font-medium">Your Trusted Repair Partners</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl">
          Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Skilled Workers</span> in Real-Time
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
          FixConnect is the modern platform for booking reliable, skilled workers on demand. Track your worker's location in real-time, just like your favorite ride-hailing app.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-lg z-30 relative">
          <Button asChild size="lg" className="w-full sm:w-auto font-semibold text-lg px-8 shadow-xl shadow-primary/25">
            <Link to="/register">
              Find a Worker <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto font-semibold text-lg px-8 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            <Link to="/apply-worker">Become a Pro</Link>
          </Button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full">
          <div className="flex flex-col items-center p-6 bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-Time Tracking</h3>
            <p className="text-center text-muted-foreground">Watch your worker arrive live on the map from the moment they accept your job.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
              <Wrench size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Expert Workers</h3>
            <p className="text-center text-muted-foreground">Connect with verified, skilled professionals for all your repair and maintenance needs.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Secure & Reliable</h3>
            <p className="text-center text-muted-foreground">Every booking is tracked and monitored to ensure top-quality service delivery.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
