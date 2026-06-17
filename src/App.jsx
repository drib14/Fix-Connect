import React, { useState, useEffect } from 'react';
import { 
  BarChart2, ShieldAlert, CheckCircle, XCircle, Trash2, 
  DollarSign, Hammer, Calendar, LogOut, ArrowRight, MessageSquare, 
  FileText, Ban, Check, Edit3, Plus, X, Loader, Search, RefreshCw, 
  Star, CreditCard, Edit, Save, MapPin, Layers, Users, Shield, ShieldCheck,
  AlertTriangle, Settings, HelpCircle, UserCheck
} from 'lucide-react';

// ==========================================
// MOCK SEED DATA
// ==========================================
const INITIAL_WORKERS = [
  {
    _id: "w_01",
    fullName: "John Plumbing",
    email: "john@fixconnect.com",
    phoneNumber: "09172233445",
    specialty: "Plumbing",
    hourlyRate: 200,
    experienceYears: 6,
    bio: "Residential plumbing expert. Drain cleaning, leak repairs, and pipe fittings.",
    governmentId: "ID-PH-49204-A",
    certificate: "Master Plumber License #1994",
    status: "APPROVED",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    _id: "w_02",
    fullName: "Arnel Spark",
    email: "arnel@fixconnect.com",
    phoneNumber: "09183344556",
    specialty: "Electrical",
    hourlyRate: 250,
    experienceYears: 8,
    bio: "Licensed electrician. Circuit breaker repairs, home wiring, and diagnostics.",
    governmentId: "ID-PH-20491-E",
    certificate: "Registered Electrical Practitioner #2012",
    status: "PENDING_APPROVAL",
    avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80"
  },
  {
    _id: "w_03",
    fullName: "Elena Clean",
    email: "elena@fixconnect.com",
    phoneNumber: "09194455667",
    specialty: "Cleaning",
    hourlyRate: 90,
    experienceYears: 4,
    bio: "Deep sanitization, office disinfection, and post-event sweep ups.",
    governmentId: "ID-PH-30948-C",
    certificate: "National Cleaning Certification Level II",
    status: "PENDING_APPROVAL",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
  },
  {
    _id: "w_04",
    fullName: "Marco Green",
    email: "marco@fixconnect.com",
    phoneNumber: "09205566778",
    specialty: "Gardening",
    hourlyRate: 100,
    experienceYears: 5,
    bio: "Lawn redesign, pruning, and evolutionary local soil nourishment.",
    governmentId: "ID-PH-94029-G",
    certificate: "B.S. Agriculture & Gardening Technology",
    status: "APPROVED",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  }
];

const INITIAL_BOOKINGS = [
  {
    _id: "FC-94281",
    clientName: "Jane Doe",
    clientEmail: "jane@fixconnect.com",
    clientPhone: "09171234567",
    workerName: "John Plumbing",
    workerSpecialty: "Plumbing",
    serviceType: "Plumbing",
    price: 400,
    status: "COMPLETED",
    paymentStatus: "PAID",
    paymentId: "pay_mongo_sess_hl080b",
    scheduledAt: "2026-06-25T14:00:00.000Z",
    createdAt: "2026-06-17T09:30:00.000Z",
    description: "Bathroom sink is dripping heavily and flooded the cabinet.",
    coordinates: [120.9842, 14.5995],
    chatLogs: [
      { sender: "client", text: "Hello! When can you arrive?", time: "09:31" },
      { sender: "worker", text: "On my way. Should take about 15 minutes.", time: "09:33" }
    ],
    review: { rating: 5, comment: "Fixed it in record time, highly recommended!" }
  },
  {
    _id: "FC-10492",
    clientName: "David Lee",
    clientEmail: "david@gmail.com",
    clientPhone: "09299402940",
    workerName: "Marco Green",
    workerSpecialty: "Gardening",
    serviceType: "Gardening",
    price: 200,
    status: "IN_PROGRESS",
    paymentStatus: "UNPAID",
    paymentId: "N/A",
    scheduledAt: "2026-06-17T15:00:00.000Z",
    createdAt: "2026-06-17T08:15:00.000Z",
    description: "Trim front lawn hedges and clean the back patio.",
    coordinates: [121.0450, 14.6500],
    chatLogs: [
      { sender: "client", text: "Please use organic pesticides on the shrubs.", time: "08:20" },
      { sender: "worker", text: "Got it! I only carry natural sprays.", time: "08:25" }
    ]
  },
  {
    _id: "FC-49021",
    clientName: "Sarah Connor",
    clientEmail: "sarah@connor.net",
    clientPhone: "09990192849",
    workerName: "Arnel Spark",
    workerSpecialty: "Electrical",
    serviceType: "Electrical",
    price: 500,
    status: "SEARCHING",
    paymentStatus: "UNPAID",
    paymentId: "N/A",
    scheduledAt: "2026-06-18T10:00:00.000Z",
    createdAt: "2026-06-17T11:00:00.000Z",
    description: "Kitchen main breaker keeps tripping when oven is on.",
    coordinates: [120.9500, 14.5800],
    chatLogs: []
  },
  {
    _id: "FC-85012",
    clientName: "Bruce Wayne",
    clientEmail: "bruce@wayne.co",
    clientPhone: "09000000000",
    workerName: "John Plumbing",
    workerSpecialty: "Plumbing",
    serviceType: "Plumbing",
    price: 600,
    status: "CANCELLED",
    paymentStatus: "UNPAID",
    paymentId: "N/A",
    scheduledAt: "2026-06-16T11:00:00.000Z",
    createdAt: "2026-06-16T08:00:00.000Z",
    description: "Inspect cellar piping infrastructure for leakages.",
    coordinates: [121.0000, 14.7000],
    chatLogs: [
      { sender: "client", text: "Can we cancel? Emergency in Gotham.", time: "08:30" }
    ]
  }
];

const INITIAL_DISPUTES = [
  {
    _id: "DSP-001",
    bookingId: "FC-85012",
    clientName: "Bruce Wayne",
    workerName: "John Plumbing",
    raisedBy: "Client",
    description: "Worker charged booking fee but did not show up at all.",
    status: "PENDING_RESOLUTION",
    createdAt: "2026-06-16T12:00:00.000Z",
    resolution: null
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    _id: "LOG-01",
    actionType: "LOGIN",
    targetEntity: "System Operator",
    details: "Admin successfully authenticated from local IP.",
    createdAt: "2026-06-17T17:18:25.000Z"
  },
  {
    _id: "LOG-02",
    actionType: "VERIFY_WORKER",
    targetEntity: "john@fixconnect.com",
    details: "John Plumbing registration approved by administrator.",
    createdAt: "2026-06-17T17:20:00.000Z"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  
  // Tab states and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [vettingFilter, setVettingFilter] = useState('ALL');
  
  // Selection states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  
  // System configurations
  const [platformFee, setPlatformFee] = useState(10);
  const [taxPercent, setTaxPercent] = useState(12);
  const [hotline, setHotline] = useState("+63 911 000 1111");
  const [broadcastMessage, setBroadcastMessage] = useState("Operational control is fully initialized.");

  // Terms and Privacy Template Configurations
  const [termsText, setTermsText] = useState("All partners undergo verification of government licenses.");
  const [privacyText, setPrivacyText] = useState("GPS coordinates are utilized to calculate local distances.");

  // Live platform simulator state
  const [simTicker, setSimTicker] = useState("All administrative services operational.");

  // Auto-Simulation of a live ticker
  useEffect(() => {
    const tickers = [
      "New registration application received: Elena Clean (Cleaning)",
      "Client Sarah Connor created a request: 'Kitchen breaker trips' (Electrical)",
      "Worker John Plumbing successfully completed booking FC-94281",
      "GCash payment captured for booking FC-94281: PHP 400.00",
      "LocationIQ distance verified: David Lee is 2.4 km from Worker Marco Green",
      "Compliance audit log trace updated: Permanent backup synchronized."
    ];
    let count = 0;
    const interval = setInterval(() => {
      setSimTicker(tickers[count % tickers.length]);
      count++;
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Log compliance action helper
  const addAuditLog = (type, target, detailText) => {
    const newLog = {
      _id: `LOG-${Math.floor(Math.random() * 9000 + 1000)}`,
      actionType: type,
      targetEntity: target,
      details: detailText,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Vetting Actions
  const handleVetting = (workerId, isApproved) => {
    const status = isApproved ? 'APPROVED' : 'REJECTED';
    setWorkers(prev => prev.map(w => w._id === workerId ? { ...w, status } : w));
    const targetWorker = workers.find(w => w._id === workerId);
    addAuditLog(
      isApproved ? "VERIFY_WORKER" : "REJECT_WORKER",
      targetWorker?.email || workerId,
      `Vetting updated: ${targetWorker?.fullName}. Status changed to ${status}.`
    );
  };

  // Booking Force cancellation
  const handleCancelBooking = (bookingId) => {
    setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'CANCELLED' } : b));
    if (selectedBooking && selectedBooking._id === bookingId) {
      setSelectedBooking(prev => ({ ...prev, status: 'CANCELLED' }));
    }
    addAuditLog("CANCEL_BOOKING", bookingId, `Administrator forced booking cancellation.`);
  };

  // Dispute resolution
  const handleResolveDispute = (disputeId, action) => {
    setDisputes(prev => prev.map(d => d._id === disputeId ? { ...d, status: 'RESOLVED', resolution: action } : d));
    const target = disputes.find(d => d._id === disputeId);
    
    // Perform operations based on resolution action
    if (action === 'REFUND_CLIENT') {
      setBookings(prev => prev.map(b => b._id === target.bookingId ? { ...b, paymentStatus: 'REFUNDED' } : b));
    }
    
    addAuditLog("RESOLVE_DISPUTE", target?.bookingId || disputeId, `Resolved dispute. Action: ${action}`);
    setSelectedDispute(null);
  };

  // Financial KPI calculations
  const grossVolume = bookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.price, 0);
  const platformRevenue = grossVolume * (platformFee / 100);
  const taxesCollected = grossVolume * (taxPercent / 100);
  const workerPayouts = grossVolume - platformRevenue - taxesCollected;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* ==========================================
          SIDEBAR NAVIGATION (VIBRANT GLOW)
          ========================================== */}
      <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between p-5 z-20">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-black tracking-wide font-display text-white">Fix-Connect</h2>
              <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Control Center</span>
            </div>
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition ${activeTab === 'dashboard' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Command Center</span>
            </button>

            <button 
              onClick={() => setActiveTab('vetting')} 
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${activeTab === 'vetting' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="w-4 h-4" />
                <span>Partner Vetting</span>
              </div>
              {workers.filter(w => w.status === 'PENDING_APPROVAL').length > 0 && (
                <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-extrabold animate-pulse">
                  {workers.filter(w => w.status === 'PENDING_APPROVAL').length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('bookings')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition ${activeTab === 'bookings' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Hammer className="w-4 h-4" />
              <span>Operations Audits</span>
            </button>

            <button 
              onClick={() => setActiveTab('disputes')} 
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${activeTab === 'disputes' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-4 h-4" />
                <span>Disputes Console</span>
              </div>
              {disputes.filter(d => d.status === 'PENDING_RESOLUTION').length > 0 && (
                <span className="bg-rose-500/20 text-rose-400 text-[9px] px-1.5 py-0.5 rounded font-extrabold">
                  {disputes.filter(d => d.status === 'PENDING_RESOLUTION').length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('payments')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition ${activeTab === 'payments' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Financial Ledger</span>
            </button>

            <button 
              onClick={() => setActiveTab('configs')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition ${activeTab === 'configs' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" />
              <span>System Safety Settings</span>
            </button>

            <button 
              onClick={() => setActiveTab('audit_logs')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition ${activeTab === 'audit_logs' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <FileText className="w-4 h-4" />
              <span>Compliance Logs</span>
            </button>
          </nav>
        </div>

        {/* User profile section */}
        <div className="space-y-4">
          <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-2xl flex items-center space-x-3 text-left">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white text-xs">A</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white leading-tight truncate">Operator Console</p>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">Primary Admin</span>
            </div>
          </div>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider block font-bold text-center">Version 3.0.0 (Standard)</span>
        </div>
      </aside>

      {/* ==========================================
          MAIN DISPLAY AREA
          ========================================== */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden">
        
        {/* Header toolbar */}
        <header className="h-16 bg-slate-900/40 border-b border-slate-850 flex items-center justify-between px-6 z-10">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
              {activeTab === 'dashboard' && 'Command Dashboard'}
              {activeTab === 'vetting' && 'Partner Verification Hub'}
              {activeTab === 'bookings' && 'Operational Booking Audits'}
              {activeTab === 'disputes' && 'Disputes & Resolutions Manager'}
              {activeTab === 'payments' && 'Financial Settlements Ledger'}
              {activeTab === 'configs' && 'System Parameters & Safety'}
              {activeTab === 'audit_logs' && 'Compliance Trace logs'}
            </h3>
            <span className="text-slate-700">|</span>
            <span className="text-xs text-slate-500 font-semibold">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {/* Simulated System Alert Ticker */}
          <div className="bg-slate-950 border border-slate-800/60 px-4 py-1.5 rounded-full max-w-md flex items-center space-x-2 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider shrink-0">Live:</span>
            <p className="text-[10px] text-slate-400 truncate text-left w-52">{simTicker}</p>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          
          {/* ==========================================
              VIEW: COMMAND CENTER (DASHBOARD)
              ========================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Metrics cards grid */}
              <div className="grid grid-cols-5 gap-4">
                <div className="glass-panel p-4 flex flex-col justify-between border border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Volume Settled</span>
                  <div className="flex items-baseline space-x-1 mt-3">
                    <span className="text-2xl font-black text-emerald-400">₱{grossVolume}</span>
                    <span className="text-[10px] font-semibold text-slate-500">PHP</span>
                  </div>
                  <span className="text-[9px] text-slate-600 mt-2 block font-medium">From completed invoices</span>
                </div>
                <div className="glass-panel p-4 flex flex-col justify-between border border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Take Rate Revenue ({platformFee}%)</span>
                  <div className="flex items-baseline space-x-1 mt-3">
                    <span className="text-2xl font-black text-violet-400">₱{platformRevenue}</span>
                    <span className="text-[10px] font-semibold text-slate-500">PHP</span>
                  </div>
                  <span className="text-[9px] text-slate-600 mt-2 block font-medium">Retained platform share</span>
                </div>
                <div className="glass-panel p-4 flex flex-col justify-between border border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Operations</span>
                  <div className="flex items-baseline space-x-1 mt-3">
                    <span className="text-2xl font-black text-sky-400">
                      {bookings.filter(b => ['SEARCHING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)).length}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">Jobs</span>
                  </div>
                  <span className="text-[9px] text-slate-600 mt-2 block font-medium">Currently dispatching/working</span>
                </div>
                <div className="glass-panel p-4 flex flex-col justify-between border border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vetting Queue</span>
                  <div className="flex items-baseline space-x-1 mt-3">
                    <span className="text-2xl font-black text-amber-500">
                      {workers.filter(w => w.status === 'PENDING_APPROVAL').length}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">Workers</span>
                  </div>
                  <span className="text-[9px] text-slate-600 mt-2 block font-medium">Pending file verification</span>
                </div>
                <div className="glass-panel p-4 flex flex-col justify-between border border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Disputes</span>
                  <div className="flex items-baseline space-x-1 mt-3">
                    <span className="text-2xl font-black text-rose-500">
                      {disputes.filter(d => d.status === 'PENDING_RESOLUTION').length}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">Tickets</span>
                  </div>
                  <span className="text-[9px] text-slate-600 mt-2 block font-medium">Unresolved operations complaints</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                
                {/* SVG Mini Charts Panel */}
                <div className="glass-panel p-5 border border-slate-800/60 col-span-2 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Financial Performance Growth</h4>
                  <div className="h-48 flex items-end justify-between px-6 pt-6 border-b border-slate-800">
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-12 bg-violet-600/20 hover:bg-violet-600/30 border-t-2 border-violet-500 rounded-t-lg transition h-16 flex items-center justify-center text-[10px] font-bold text-violet-400">₱200</div>
                      <span className="text-[10px] font-bold text-slate-500 mt-2">Week 1</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-12 bg-violet-600/30 hover:bg-violet-600/40 border-t-2 border-violet-500 rounded-t-lg transition h-24 flex items-center justify-center text-[10px] font-bold text-violet-400">₱400</div>
                      <span className="text-[10px] font-bold text-slate-500 mt-2">Week 2</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-12 bg-violet-600/50 hover:bg-violet-600/60 border-t-2 border-violet-500 rounded-t-lg transition h-32 flex items-center justify-center text-[10px] font-bold text-violet-400 font-sans">₱800</div>
                      <span className="text-[10px] font-bold text-slate-500 mt-2">Week 3</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-12 bg-gradient-to-t from-violet-600/80 to-violet-500 rounded-t-lg transition h-40 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-violet-500/10">₱1,200</div>
                      <span className="text-[10px] font-bold text-slate-400 mt-2">Active</span>
                    </div>
                  </div>
                </div>

                {/* Specialties distribution */}
                <div className="glass-panel p-5 border border-slate-800/60 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Popular Specialty Distribution</h4>
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Plumbing Service</span>
                        <span className="text-white">60%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-600 rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Gardening Service</span>
                        <span className="text-white">25%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '25%' }} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Electrical Service</span>
                        <span className="text-white">15%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Tickers */}
              <div className="glass-panel border border-slate-800/60 p-5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Recent Platform Incidents</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800/60 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="pb-3 font-semibold text-[10px]">Reference</th>
                        <th className="pb-3 font-semibold text-[10px]">Client</th>
                        <th className="pb-3 font-semibold text-[10px]">Worker Partner</th>
                        <th className="pb-3 font-semibold text-[10px]">Invoicing</th>
                        <th className="pb-3 font-semibold text-[10px]">Match Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {bookings.map((b) => (
                        <tr key={b._id} className="text-slate-300">
                          <td className="py-3 font-mono font-bold text-white">{b._id}</td>
                          <td>{b.clientName}</td>
                          <td>{b.workerName || 'Searching...'}</td>
                          <td className="font-bold text-white">₱{b.price}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                              b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                              b.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' :
                              b.status === 'SEARCHING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10 animate-pulse' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: PARTNER VETTING (VERIFICATIONS HUB)
              ========================================== */}
          {activeTab === 'vetting' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Tabs selector */}
              <div className="bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/80 inline-flex space-x-1.5">
                {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setVettingFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                      vettingFilter === filter ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter === 'PENDING_APPROVAL' ? 'Pending Action' : filter.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Grid roster */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workers
                  .filter(w => vettingFilter === 'ALL' || w.status === vettingFilter)
                  .map(w => (
                    <div key={w._id} className="glass-panel p-5 border border-slate-800/60 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                          <img src={w.avatar} alt={w.fullName} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-white truncate">{w.fullName}</h4>
                            <p className="text-[10px] text-violet-400 font-bold">{w.specialty} Partner</p>
                            <span className="text-[9px] text-slate-500 block font-mono">{w.email} &bull; {w.phoneNumber}</span>
                          </div>
                        </div>

                        <div className="h-px bg-slate-850" />

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block font-bold">Government ID</span>
                            <span className="font-mono text-slate-300 font-semibold">{w.governmentId}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block font-bold">Certification</span>
                            <span className="text-slate-300 font-semibold truncate block" title={w.certificate}>{w.certificate}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block font-bold mb-1">Bio Description</span>
                          <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 italic">"{w.bio}"</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          w.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                          w.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {w.status}
                        </span>

                        {w.status === 'PENDING_APPROVAL' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleVetting(w._id, false)}
                              className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-rose-950/30 hover:border-rose-900/40 text-rose-500 rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              Reject File
                            </button>
                            <button
                              onClick={() => handleVetting(w._id, true)}
                              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: OPERATIONS & BOOKING AUDITS
              ========================================== */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Search filter bar */}
              <div className="glass-panel p-4 border border-slate-800/60 flex justify-between items-center shadow-md">
                <div className="relative w-80">
                  <input
                    type="text"
                    placeholder="Search operations by service or client name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-dark pl-9 pr-4 py-2"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Total Bookings Audited: {bookings.length}
                </span>
              </div>

              {/* Master logs table */}
              <div className="glass-panel border border-slate-800/60 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Reference</th>
                      <th className="p-4">Client Profile</th>
                      <th className="p-4">Assigned Partner</th>
                      <th className="p-4">Particular</th>
                      <th className="p-4 text-right">Invoiced Amount</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Auditing Logs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {bookings
                      .filter(b => b.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) || b.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(b => (
                        <tr key={b._id} className="text-slate-300 hover:bg-slate-900/30 transition">
                          <td className="p-4 font-mono font-bold text-white">{b._id}</td>
                          <td className="p-4">
                            <span className="block font-bold text-white">{b.clientName}</span>
                            <span className="text-[9px] text-slate-500 block">{b.clientEmail}</span>
                          </td>
                          <td className="p-4">
                            <span className="block font-bold text-slate-300">{b.workerName || 'Finding Partner...'}</span>
                            <span className="text-[9px] text-slate-500 block">{b.workerSpecialty || 'Searching'}</span>
                          </td>
                          <td className="p-4">{b.serviceType}</td>
                          <td className="p-4 text-right font-bold text-white">₱{b.price}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                              b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                              b.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400' :
                              b.status === 'SEARCHING' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                              b.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="px-3 py-1 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: DISPUTES & RESOLUTIONS
              ========================================== */}
          {activeTab === 'disputes' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="grid grid-cols-1 gap-4">
                {disputes.map(d => (
                  <div key={d._id} className="glass-panel p-5 border border-slate-800/60 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-rose-400">{d._id}</span>
                          <span className="text-slate-600">|</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Booking Ref: {d.bookingId}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">Dispute Filed by: {d.raisedBy}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                        d.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500 animate-pulse'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-xs text-slate-300">
                      <span className="text-[9px] text-slate-500 uppercase block font-bold mb-1">Issue Description</span>
                      "{d.description}"
                    </div>

                    {d.status === 'PENDING_RESOLUTION' ? (
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleResolveDispute(d._id, 'REFUND_CLIENT')}
                          className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-emerald-950/20 hover:border-emerald-900/30 text-emerald-400 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Resolve & Refund Client
                        </button>
                        <button
                          onClick={() => handleResolveDispute(d._id, 'PAYOUT_WORKER')}
                          className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-violet-950/20 hover:border-violet-900/30 text-violet-400 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Approve Payout to Worker
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1.5 justify-end">
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolved via Action: {d.resolution}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: PLATFORM FINANCIAL LEDGER
              ========================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Financial Dashboard summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="glass-panel p-4 border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Gross volume processed</span>
                  <span className="text-2xl font-black text-white block mt-2">₱{grossVolume}</span>
                </div>
                <div className="glass-panel p-4 border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Platform Take share ({platformFee}%)</span>
                  <span className="text-2xl font-black text-violet-400 block mt-2">₱{platformRevenue}</span>
                </div>
                <div className="glass-panel p-4 border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Estimated Tax ({taxPercent}%)</span>
                  <span className="text-2xl font-black text-sky-400 block mt-2">₱{taxesCollected}</span>
                </div>
                <div className="glass-panel p-4 border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Settled payouts to partners</span>
                  <span className="text-2xl font-black text-emerald-400 block mt-2">₱{workerPayouts}</span>
                </div>
              </div>

              {/* Transaction Logs */}
              <div className="glass-panel border border-slate-800/60 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Reference ID</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Assigned Contractor</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Payment Reference</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {bookings
                      .filter(b => b.paymentStatus === 'PAID')
                      .map(b => (
                        <tr key={b._id} className="text-slate-300">
                          <td className="p-4 font-mono font-bold text-white">{b._id}</td>
                          <td className="p-4">{b.clientName}</td>
                          <td className="p-4">{b.workerName}</td>
                          <td className="p-4 font-bold text-white">₱{b.price}</td>
                          <td className="p-4 font-mono text-[10px] text-slate-500">{b.paymentId}</td>
                          <td className="p-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400">
                              PAID
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: SAFETY CONFIGURATION
              ========================================== */}
          {activeTab === 'configs' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="grid grid-cols-2 gap-6">
                
                {/* Platform parameters */}
                <div className="glass-panel p-5 border border-slate-800/60 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fee Percentage & hotline configs</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Platform Service Fee (%)</label>
                    <input
                      type="number"
                      value={platformFee}
                      onChange={(e) => setPlatformFee(Number(e.target.value))}
                      className="input-dark text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tax Retention Fee (%)</label>
                    <input
                      type="number"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value))}
                      className="input-dark text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Emergency Safety Hotline</label>
                    <input
                      type="text"
                      value={hotline}
                      onChange={(e) => setHotline(e.target.value)}
                      className="input-dark text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Alert Broadcast Console Message</label>
                    <textarea
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="input-dark text-xs h-20"
                    />
                  </div>

                  <button
                    onClick={() => {
                      addAuditLog("UPDATE_CONFIG", "System Parameters", "Modified platform fees and safety hotlines.");
                      alert("Configurations successfully synchronized and cached in local registry.");
                    }}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Apply Configs
                  </button>
                </div>

                {/* Templates & Guidelines */}
                <div className="glass-panel p-5 border border-slate-800/60 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Regulatory Templates Preview</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Terms & Conditions Template Snippet</label>
                    <textarea
                      value={termsText}
                      onChange={(e) => setTermsText(e.target.value)}
                      className="input-dark text-xs h-24"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Privacy Policy Template Snippet</label>
                    <textarea
                      value={privacyText}
                      onChange={(e) => setPrivacyText(e.target.value)}
                      className="input-dark text-xs h-24"
                    />
                  </div>

                  <button
                    onClick={() => {
                      addAuditLog("UPDATE_CONTENT", "Legal Documents", "Customized terms and privacy document snippets.");
                      alert("Legal guidelines updated successfully.");
                    }}
                    className="w-full py-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Publish Guidelines
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VIEW: COMPLIANCE AUDIT LOGS
              ========================================== */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="glass-panel p-4 border border-slate-800/60 flex justify-between items-center shadow-md">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Auditing Trace Entries: {auditLogs.length}</span>
                <button
                  onClick={() => {
                    addAuditLog("CLEAR_LOGS", "Audit Registry", "Cleared diagnostic history log.");
                    setAuditLogs([]);
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-900/30 text-rose-400 rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  Flush Trace Registry
                </button>
              </div>

              <div className="glass-panel border border-slate-800/60 overflow-hidden">
                <div className="overflow-y-auto max-h-[60vh] divide-y divide-slate-900">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-900/20 transition">
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          log.actionType.includes("CANCEL") || log.actionType.includes("REJECT") ? 'bg-rose-500/10 text-rose-400' :
                          log.actionType.includes("VERIFY") || log.actionType.includes("RESOLVE") ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-violet-500/10 text-violet-400'
                        }`}>
                          {log.actionType}
                        </span>
                        <div className="min-w-0">
                          <p className="text-slate-300 font-semibold truncate leading-tight">{log.details}</p>
                          <span className="text-[9px] text-slate-500 font-mono">Target: {log.targetEntity}</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==========================================
          DETAILED INSPECT DRAWER
          ========================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full shadow-2xl flex flex-col justify-between text-left animate-slide-in-right">
            
            <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
              <div>
                <h3 className="font-bold text-white text-sm">Detailed Operations Audit</h3>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">Booking Ref: #{selectedBooking._id}</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Client and Worker profiles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block mb-2">Requesting Client</span>
                  <div>
                    <span className="block text-xs font-bold text-white leading-tight">{selectedBooking.clientName}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{selectedBooking.clientEmail}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">{selectedBooking.clientPhone}</span>
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block mb-2">Service Partner</span>
                  <div>
                    <span className="block text-xs font-bold text-white leading-tight">{selectedBooking.workerName || 'Searching...'}</span>
                    <span className="text-[10px] text-violet-400 font-semibold block mt-0.5">{selectedBooking.workerSpecialty || 'Searching'}</span>
                  </div>
                </div>
              </div>

              {/* Service details */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Service Details</h4>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Category</span>
                    <span className="font-bold text-white">{selectedBooking.serviceType}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Total Price</span>
                    <span className="font-bold text-emerald-400">₱{selectedBooking.price}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Status</span>
                    <span className="font-bold text-white">{selectedBooking.status}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block mb-0.5">Problem Description</span>
                  <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-850">"{selectedBooking.description}"</p>
                </div>
              </div>

              {/* Simulated chat transcript */}
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Chat Logs</h4>
                </div>
                <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 h-56 overflow-y-auto space-y-3 flex flex-col justify-end">
                  {selectedBooking.chatLogs && selectedBooking.chatLogs.length === 0 ? (
                    <div className="m-auto text-center text-slate-600 text-xs">No chat communication recorded.</div>
                  ) : (
                    selectedBooking.chatLogs?.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col max-w-[80%] ${msg.sender === 'client' ? 'self-end items-end' : 'self-start items-start'}`}>
                        <span className="text-[8px] font-bold text-slate-500 mb-0.5">{msg.sender === 'client' ? 'Client' : 'Worker'}</span>
                        <div className={`p-2.5 rounded-2xl text-xs ${msg.sender === 'client' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'}`}>
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[7px] text-slate-600 mt-0.5">{msg.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <footer className="h-20 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-6">
              <span className="text-[10px] text-slate-500">Authorized Operator Action Only</span>
              {['SEARCHING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(selectedBooking.status) ? (
                <button
                  onClick={() => {
                    handleCancelBooking(selectedBooking._id);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-lg cursor-pointer"
                >
                  Force Cancel Booking
                </button>
              ) : (
                <button disabled className="px-4 py-2 bg-slate-900 text-slate-600 text-xs font-bold rounded-xl border border-slate-850 cursor-not-allowed">Audit Logs Saved</button>
              )}
            </footer>
          </div>
        </div>
      )}

    </div>
  );
}
